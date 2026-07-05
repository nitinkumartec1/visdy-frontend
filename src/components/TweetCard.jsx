import { useState } from "react";
import { Link } from "react-router-dom";
import { updateTweet, deleteTweet } from "../api/tweet.api";
import { toggleTweetLike } from "../api/like.api";
import { useAuth } from "../context/AuthContext";
import TweetComments from "./TweetComments";

export default function TweetCard({ tweet, onDelete }) {
  const { user } = useAuth();
  const [content, setContent] = useState(tweet.content);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(tweet.content);
  const [saving, setSaving] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(tweet.likeCount || 0);
  const [deleted, setDeleted] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const isOwner = user && (tweet.owner?._id || tweet.owner) === user._id;
  const ownerData = typeof tweet.owner === "object" ? tweet.owner : null;
  const ownerName = ownerData?.username || "Unknown";
  const ownerAvatar = ownerData?.avatar || user?.avatar;

  const timeAgo = (() => {
    if (!tweet.createdAt) return "";
    const seconds = Math.floor((new Date() - new Date(tweet.createdAt)) / 1000);
    if (seconds < 60) return "just now";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "just now";
  })();

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      await updateTweet(tweet._id, editContent.trim());
      setContent(editContent.trim());
      setEditing(false);
    } catch (err) {
      console.error("Failed to update tweet", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTweet(tweet._id);
      setDeleted(true);
      onDelete?.(tweet._id);
    } catch (err) {
      console.error("Failed to delete tweet", err);
    }
  };

  const handleLike = async () => {
    try {
      const res = await toggleTweetLike(tweet._id);
      const data = res.data?.data;
      if (data) {
        setLiked(data.liked);
        setLikeCount(data.likeCount);
      } else {
        // Optimistic toggle
        setLiked((prev) => !prev);
        setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
      }
    } catch (err) {
      console.error("Failed to toggle like", err);
    }
  };

  if (deleted) return null;

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl p-5 transition-all duration-300 hover:border-theme-border/80 group">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link to={ownerData ? `/c/${ownerName}` : "#"} className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-theme-soft border border-theme-border">
            {ownerAvatar ? (
              <img src={ownerAvatar} alt={ownerName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-wine-glow font-bold text-sm">
                {ownerName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              to={ownerData ? `/c/${ownerName}` : "#"}
              className="font-semibold text-theme-text hover:text-wine-glow transition-colors text-sm"
            >
              @{ownerName}
            </Link>
            <span className="text-[10px] text-theme-muted">•</span>
            <span className="text-xs text-theme-muted">{timeAgo}</span>
          </div>

          {/* Content */}
          {editing ? (
            <form onSubmit={handleUpdate} className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="input-field resize-none text-sm"
                rows={3}
                autoFocus
                required
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setEditContent(content);
                  }}
                  className="text-xs text-theme-muted hover:text-theme-text transition-colors px-3 py-1.5 rounded-lg bg-theme-soft border border-theme-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !editContent.trim()}
                  className="text-xs text-white bg-wine-primary hover:bg-wine-accent px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-theme-text text-sm leading-relaxed mt-1.5 whitespace-pre-wrap break-words">
              {content}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      {!editing && (
        <div className="flex items-center gap-1 mt-4 ml-[52px]">
          {/* Like */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200 ${
              liked
                ? "text-wine-primary bg-wine-primary/10"
                : "text-theme-muted hover:text-wine-glow hover:bg-theme-soft"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill={liked ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>

          {/* Comment toggle */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200 ${
              showComments
                ? "text-wine-primary bg-wine-primary/10"
                : "text-theme-muted hover:text-wine-glow hover:bg-theme-soft"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill={showComments ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
            </svg>
            Comment
          </button>

          {/* Owner actions */}
          {isOwner && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-theme-muted hover:text-wine-glow hover:bg-theme-soft transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                </svg>
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-theme-muted hover:text-red-500 hover:bg-red-500/10 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Delete
              </button>
            </>
          )}
        </div>
      )}

      {/* Comments Section */}
      {showComments && (
        <div className="ml-[52px]">
          <TweetComments tweetId={tweet._id} />
        </div>
      )}
    </div>
  );
}
