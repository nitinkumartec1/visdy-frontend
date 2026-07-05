import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { uploadVideo } from "../api/video.api";

/* -------------------------------------------------------
   File validation limits (must match backend)
------------------------------------------------------- */
const LIMITS = {
  VIDEO_MAX_SIZE: 100 * 1024 * 1024,    // 100 MB
  IMAGE_MAX_SIZE: 10 * 1024 * 1024,      // 10 MB
  IMAGE_MAX_MEGAPIXELS: 25,              // 25 MP
};

const formatSize = (bytes) => `${(bytes / (1024 * 1024)).toFixed(1)}MB`;

/**
 * Returns a promise that resolves to { width, height, megapixels }
 * for a given image File.
 */
const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const megapixels = (img.width * img.height) / 1_000_000;
      resolve({ width: img.width, height: img.height, megapixels });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Could not read image dimensions"));
    };
    img.src = URL.createObjectURL(file);
  });
};

export default function UploadVideo() {
  const navigate = useNavigate();

  // Metadata form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // File state
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  // Upload progress and loading state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }

  const formRef = useRef(null);

  /* ---- File validation handlers ---- */
  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > LIMITS.VIDEO_MAX_SIZE) {
      setMessage({ type: "error", text: `Video file exceeds 100MB limit (${formatSize(file.size)} selected)` });
      e.target.value = "";
      return;
    }
    setMessage(null);
    setVideoFile(file);
  };

  const handleThumbnailSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > LIMITS.IMAGE_MAX_SIZE) {
      setMessage({ type: "error", text: `Thumbnail exceeds 10MB limit (${formatSize(file.size)} selected)` });
      e.target.value = "";
      return;
    }
    try {
      const dims = await getImageDimensions(file);
      if (dims.megapixels > LIMITS.IMAGE_MAX_MEGAPIXELS) {
        setMessage({ type: "error", text: `Thumbnail exceeds 25MP limit (${dims.megapixels.toFixed(1)}MP — ${dims.width}×${dims.height})` });
        e.target.value = "";
        return;
      }
    } catch {
      // If we can't read dimensions, let server handle it
    }
    setMessage(null);
    setThumbnailFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!videoFile || !thumbnailFile) {
      setMessage({ type: "error", text: "Please select both a video and a thumbnail." });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("videoFile", videoFile);
    formData.append("thumbnail", thumbnailFile);

    try {
      setLoading(true);
      setMessage(null);

      await uploadVideo(formData);
      
      setMessage({ type: "success", text: "Video uploaded successfully!" });
      
      // Delay navigation slightly so user sees success message
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Upload failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Preview object URLs for confirmation
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [thumbPreviewUrl, setThumbPreviewUrl] = useState(null);

  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [videoFile]);

  useEffect(() => {
    if (thumbnailFile) {
      const url = URL.createObjectURL(thumbnailFile);
      setThumbPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [thumbnailFile]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-theme-text mb-2">Upload Video</h1>
        <p className="text-theme-muted">Share your content with the world.</p>
      </div>

      <div className="bg-theme-card rounded-2xl border border-theme-border shadow-2xl p-6 lg:p-10 relative overflow-hidden">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Files */}
            <div className="space-y-6">
              {/* Video File Input */}
              <div>
                <label className="block text-sm font-medium text-theme-muted mb-2">
                  Video File *
                </label>
                {videoPreviewUrl ? (
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-theme-border group">
                    <video src={videoPreviewUrl} controls className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => { setVideoFile(null); setVideoPreviewUrl(null); }}
                      className="absolute top-2 right-2 bg-black/70 hover:bg-wine-primary text-theme-text p-2 rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-theme-border rounded-xl hover:border-wine-primary hover:bg-wine-primary/5 transition-all cursor-pointer">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-theme-muted">
                      <svg className="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm font-semibold">Click to upload video</p>
                      <p className="text-xs mt-1">MP4, WebM, or OGG (MAX. 100MB)</p>
                    </div>
                    <input type="file" className="hidden" accept="video/mp4,video/webm,video/ogg" onChange={handleVideoSelect} />
                  </label>
                )}
              </div>

              {/* Thumbnail Input */}
              <div>
                <label className="block text-sm font-medium text-theme-muted mb-2">
                  Thumbnail *
                </label>
                {thumbPreviewUrl ? (
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-theme-border group">
                    <img src={thumbPreviewUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setThumbnailFile(null); setThumbPreviewUrl(null); }}
                      className="absolute top-2 right-2 bg-black/70 hover:bg-wine-primary text-theme-text p-2 rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-theme-border rounded-xl hover:border-wine-primary hover:bg-wine-primary/5 transition-all cursor-pointer">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-theme-muted">
                      <svg className="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm font-semibold">Click to upload thumbnail</p>
                      <p className="text-xs mt-1">PNG, JPG, or WEBP (MAX. 10MB, 25MP)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/png,image/jpeg,image/webp" onChange={handleThumbnailSelect} />
                  </label>
                )}
              </div>
            </div>

            {/* Right Column: Metadata */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-theme-muted mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-theme-card border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:ring-2 focus:ring-wine-primary transition-all placeholder-zinc-500"
                  placeholder="Catchy title goes here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-muted mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows="6"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-theme-card border border-theme-border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:ring-2 focus:ring-wine-primary transition-all placeholder-zinc-500 resize-none"
                  placeholder="Tell viewers about your video..."
                />
              </div>
            </div>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`p-4 rounded-xl border flex items-center gap-3 ${
              message.type === 'error' 
                ? 'bg-wine-glow/10 border-wine-glow/20 text-wine-glow' 
                : 'bg-green-500/10 border-green-500/20 text-green-400'
            }`}>
              {message.type === 'error' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
              <p className="font-medium">{message.text}</p>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex justify-end pt-4 border-t border-theme-border">
            <button
              type="submit"
              disabled={loading || !videoFile || !thumbnailFile || !title.trim() || !description.trim()}
              className="btn-primary px-8 py-3 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-theme-text" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </div>
              ) : (
                "Publish Video"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}