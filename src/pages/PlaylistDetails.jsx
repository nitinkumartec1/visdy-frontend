import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getPlaylistById,
  updatePlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
} from "../api/playlist.api";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import VideoCard from "../components/VideoCard";

export default function PlaylistDetails() {
  const { playlistId } = useParams();
  const { user } = useAuth();
  const { collapsed } = useSidebar();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOwner = user && playlist && (playlist.owner?._id || playlist.owner) === user._id;

  const fetchPlaylist = () => {
    setLoading(true);
    getPlaylistById(playlistId)
      .then((res) => {
        const pl = res.data.data.playlist;
        setPlaylist(pl);
        setEditName(pl.name);
        setEditDesc(pl.description);
      })
      .catch((err) => console.error("Failed to fetch playlist", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPlaylist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editDesc.trim()) return;
    setSaving(true);
    try {
      const res = await updatePlaylist(playlistId, {
        name: editName.trim(),
        description: editDesc.trim(),
      });
      setPlaylist((prev) => ({
        ...prev,
        name: res.data.data.playlist.name,
        description: res.data.data.playlist.description,
      }));
      setEditing(false);
    } catch (err) {
      console.error("Failed to update playlist", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveVideo = async (videoId) => {
    try {
      await removeVideoFromPlaylist(playlistId, videoId);
      setPlaylist((prev) => ({
        ...prev,
        videos: prev.videos.filter((v) => (v._id || v) !== videoId),
      }));
    } catch (err) {
      console.error("Failed to remove video", err);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePlaylist(playlistId);
      navigate("/playlists");
    } catch (err) {
      console.error("Failed to delete playlist", err);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-wine-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-theme-muted">Loading playlist…</p>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-theme-text mb-2">Playlist not found</h2>
        <p className="text-theme-muted mb-6">This playlist may have been deleted or doesn't exist.</p>
        <Link to="/playlists" className="btn-primary">
          Back to Playlists
        </Link>
      </div>
    );
  }

  const videos = playlist.videos || [];
  const ownerName = playlist.owner?.username || "Unknown";

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-theme-muted mb-6">
        <Link to="/playlists" className="hover:text-wine-glow transition-colors">
          Playlists
        </Link>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-theme-text truncate">{playlist.name}</span>
      </div>

      {/* Playlist Header */}
      <div className="bg-theme-card border border-theme-border rounded-2xl p-6 mb-8">
        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="text-sm text-theme-muted block mb-1.5">Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="input-field"
                autoFocus
                required
              />
            </div>
            <div>
              <label className="text-sm text-theme-muted block mb-1.5">Description</label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="input-field resize-none h-24"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setEditName(playlist.name);
                  setEditDesc(playlist.description);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !editName.trim() || !editDesc.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-theme-text break-words">{playlist.name}</h1>
                <p className="text-theme-muted mt-2 leading-relaxed break-words">{playlist.description}</p>
              </div>

              {isOwner && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setEditing(true)}
                    className="p-2.5 rounded-xl bg-theme-soft border border-theme-border text-theme-muted hover:text-wine-glow hover:border-wine-primary transition-all"
                    title="Edit playlist"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4.5 h-4.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2.5 rounded-xl bg-theme-soft border border-theme-border text-theme-muted hover:text-red-500 hover:border-red-500/50 transition-all"
                    title="Delete playlist"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4.5 h-4.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-theme-border">
              {playlist.owner?.avatar && (
                <Link to={`/c/${ownerName}`}>
                  <img
                    src={playlist.owner.avatar}
                    alt={ownerName}
                    className="w-8 h-8 rounded-full border border-theme-border object-cover"
                  />
                </Link>
              )}
              <div className="flex items-center gap-3 text-sm text-theme-muted">
                <Link to={`/c/${ownerName}`} className="hover:text-wine-glow transition-colors font-medium">
                  {ownerName}
                </Link>
                <span className="text-[10px]">•</span>
                <span>{videos.length} {videos.length === 1 ? "video" : "videos"}</span>
                <span className="text-[10px]">•</span>
                <span>
                  {new Date(playlist.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Videos */}
      {videos.length > 0 ? (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 ${
            collapsed
              ? "lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5"
              : "lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
          } gap-x-4 gap-y-10`}
        >
          {videos.map((video) => (
            <div key={video._id || video} className="relative group/item">
              <VideoCard video={video} />
              {isOwner && (
                <button
                  onClick={() => handleRemoveVideo(video._id || video)}
                  className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-white p-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all duration-200 hover:bg-red-600 z-10"
                  title="Remove from playlist"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-theme-card border border-theme-border flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-theme-muted">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-theme-text mb-1">No videos in this playlist</h3>
          <p className="text-theme-muted text-sm">
            Browse videos and save them to this playlist.
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in" onClick={() => setShowDeleteConfirm(false)}>
          <div
            className="bg-theme-card border border-theme-border rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-theme-text">Delete "{playlist.name}"?</h3>
                <p className="text-sm text-theme-muted">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-full transition-all duration-300 flex-1 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
