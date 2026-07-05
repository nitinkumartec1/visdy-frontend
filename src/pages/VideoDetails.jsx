import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getVideoById } from "../api/video.api";
import { toggleWatchLater, getWatchLaterVideos } from "../api/user.api";
import { useAuth } from "../context/AuthContext";

import LikeButton from "../components/LikeButton";
import SubscribeButton from "../components/SubscribeButton";
import Comments from "../components/Comments";
import SaveToPlaylistModal from "../components/SaveToPlaylistModal";

export default function VideoDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isWatchLater, setIsWatchLater] = useState(false);

  const handleWatchLater = async () => {
    try {
      const res = await toggleWatchLater(video._id);
      setIsWatchLater(res.data.data.isWatchLater);
    } catch (err) {
      console.error("Failed to toggle watch later", err);
    }
  };

  useEffect(() => {
    getVideoById(id).then((res) => setVideo(res.data.data));
    
    if (user) {
      getWatchLaterVideos().then((res) => {
        const isSaved = res.data.data.some((v) => v._id === id);
        setIsWatchLater(isSaved);
      }).catch(err => console.error("Failed to fetch watch later status", err));
    }
  }, [id, user]);

  if (!video)
    return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Video Section */}
      <div className="lg:col-span-2">
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative group">
            <video
              src={typeof video.videoFile === 'string' ? video.videoFile : video.videoFile.url}
              controls
              className="w-full h-full object-contain"
              autoPlay
            />
        </div>

        <h1 className="text-2xl font-bold mt-4 text-theme-text">
          {video.title}
        </h1>

        <div className="flex items-center gap-4 mt-4 mb-6">
          <LikeButton videoId={video._id} />
          <SubscribeButton channelId={video?.owner?._id || video?.owner} />
          {user && (
            <div className="flex gap-2 ml-auto">
              <button
                onClick={handleWatchLater}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 border ${
                  isWatchLater
                    ? "bg-wine-primary/20 border-wine-primary text-wine-primary"
                    : "bg-theme-soft hover:bg-theme-card border-theme-border hover:border-wine-primary text-theme-muted hover:text-theme-text"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill={isWatchLater ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v3" />
                </svg>
                {isWatchLater ? "Added to Watch Later" : "Watch Later"}
              </button>
              <button
                onClick={() => setShowSaveModal(true)}
                className="flex items-center gap-2 bg-theme-soft hover:bg-theme-card text-theme-muted hover:text-theme-text border border-theme-border hover:border-wine-primary px-4 py-2 rounded-full transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                </svg>
                Add to Playlist
              </button>
            </div>
          )}
        </div>

        <div className="bg-theme-card p-4 rounded-xl shadow-lg border border-theme-border">
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-theme-muted whitespace-pre-wrap leading-relaxed">
              {video.description}
            </p>
        </div>

        <Comments videoId={video._id} />
      </div>

      {/* Sidebar */}
      <div className="hidden lg:block">
        <p className="text-theme-muted">More videos coming here...</p>
      </div>

      {/* Save to Playlist Modal */}
      {showSaveModal && (
        <SaveToPlaylistModal
          videoId={video._id}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
}