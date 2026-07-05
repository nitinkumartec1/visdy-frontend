import { useEffect, useState } from "react";
import {
  getUserPlaylists,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  createPlaylist,
} from "../api/playlist.api";
import { useAuth } from "../context/AuthContext";

export default function SaveToPlaylistModal({ videoId, onClose }) {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!user?._id) return;
    getUserPlaylists(user._id)
      .then((res) => {
        const pls = res.data.data.playlists || [];
        setPlaylists(pls);
        // Pre-check playlists that already contain this video
        const checked = new Set();
        pls.forEach((pl) => {
          const hasVideo = pl.videos?.some(
            (v) => (v._id || v) === videoId
          );
          if (hasVideo) checked.add(pl._id);
        });
        setCheckedIds(checked);
      })
      .catch((err) => console.error("Failed to fetch playlists", err))
      .finally(() => setLoading(false));
  }, [user, videoId]);

  const handleToggle = async (playlistId) => {
    const isChecked = checkedIds.has(playlistId);
    setActionLoading(playlistId);
    try {
      if (isChecked) {
        await removeVideoFromPlaylist(playlistId, videoId);
        setCheckedIds((prev) => {
          const next = new Set(prev);
          next.delete(playlistId);
          return next;
        });
      } else {
        await addVideoToPlaylist(playlistId, videoId);
        setCheckedIds((prev) => new Set(prev).add(playlistId));
      }
    } catch (err) {
      console.error("Failed to update playlist", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newDesc.trim()) return;
    setCreating(true);
    try {
      const res = await createPlaylist({ name: newName.trim(), description: newDesc.trim() });
      const newPl = res.data.data.playlist;
      // Add video to the newly created playlist
      await addVideoToPlaylist(newPl._id, videoId);
      setPlaylists((prev) => [newPl, ...prev]);
      setCheckedIds((prev) => new Set(prev).add(newPl._id));
      setNewName("");
      setNewDesc("");
      setShowCreate(false);
    } catch (err) {
      console.error("Failed to create playlist", err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in"
      onClick={onClose}
    >
      <div
        className="bg-theme-card border border-theme-border rounded-2xl w-full max-w-sm mx-4 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-theme-border">
          <h3 className="text-lg font-bold text-theme-text">Save to playlist</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-soft transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[320px] overflow-y-auto px-2 py-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-wine-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : playlists.length > 0 ? (
            <div className="space-y-0.5">
              {playlists.map((pl) => (
                <button
                  key={pl._id}
                  onClick={() => handleToggle(pl._id)}
                  disabled={actionLoading === pl._id}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-theme-soft transition-colors text-left group disabled:opacity-60"
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border transition-all duration-200 ${
                      checkedIds.has(pl._id)
                        ? "bg-wine-primary border-wine-primary"
                        : "border-theme-border group-hover:border-wine-glow"
                    }`}
                  >
                    {checkedIds.has(pl._id) && (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-theme-text truncate">{pl.name}</p>
                    <p className="text-xs text-theme-muted truncate">{pl.videos?.length || 0} videos</p>
                  </div>
                  {actionLoading === pl._id && (
                    <div className="w-4 h-4 border-2 border-wine-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-theme-muted py-6 text-sm">
              No playlists yet. Create one below!
            </p>
          )}
        </div>

        {/* Create New Playlist Section */}
        <div className="border-t border-theme-border">
          {showCreate ? (
            <form onSubmit={handleCreate} className="p-4 space-y-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Playlist name"
                className="input-field text-sm"
                autoFocus
                required
              />
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Description"
                className="input-field text-sm resize-none h-16"
                required
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setNewName(""); setNewDesc(""); }}
                  className="btn-secondary text-sm flex-1 py-1.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim() || !newDesc.trim()}
                  className="btn-primary text-sm flex-1 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {creating ? "Creating…" : "Create & Add"}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="w-full flex items-center gap-3 px-5 py-3.5 text-wine-glow hover:text-wine-primary hover:bg-theme-soft transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="text-sm font-medium">Create new playlist</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
