import { useEffect, useState } from "react";
import { getTweetComments, addTweetComment, deleteComment } from "../api/comment.api";
import { useAuth } from "../context/AuthContext";

export default function TweetComments({ tweetId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tweetId) return;
    let isMounted = true;
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await getTweetComments(tweetId);
        if (isMounted) setComments(res.data.data.comments || []);
      } catch (err) {
        console.error("Failed to fetch tweet comments", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchComments();
    return () => {
      isMounted = false;
    };
  }, [tweetId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const res = await addTweetComment(tweetId, text);
      const newComment = res.data.data.comment;
      if (!newComment.owner && user) {
        newComment.owner = user;
      }
      setComments([newComment, ...comments]);
      setText("");
    } catch (error) {
      console.error("Failed to add tweet comment", error);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (error) {
      console.error("Failed to delete comment", error);
    }
  };

  if (loading) {
    return (
      <div className="mt-4 pt-4 border-t border-theme-border flex justify-center">
        <div className="w-5 h-5 border-2 border-wine-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-theme-border">
      {user ? (
        <form onSubmit={submit} className="flex gap-3 mb-6">
          <img
            src={user.avatar}
            alt={user.username}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-wine-primary/20 shrink-0 mt-1"
          />
          <div className="flex-1 flex gap-2">
            <input
              className="w-full bg-theme-soft border border-theme-border focus:border-wine-primary px-3 py-2 text-sm outline-none text-theme-text placeholder-zinc-500 transition-colors rounded-lg"
              placeholder="Post a reply..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
                text.trim()
                  ? "bg-wine-primary text-white hover:bg-wine-accent shadow-md shadow-wine-primary/20"
                  : "bg-theme-soft border border-theme-border text-theme-muted cursor-not-allowed"
              }`}
            >
              Reply
            </button>
          </div>
        </form>
      ) : (
        <p className="mb-6 text-sm text-theme-muted">
          <a href="/login" className="text-wine-glow hover:underline">
            Login
          </a>{" "}
          to reply.
        </p>
      )}

      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c._id} className="flex gap-3 group">
            <img
              src={
                c.owner?.avatar ||
                `https://ui-avatars.com/api/?name=${c.owner?.username || "User"}&background=random`
              }
              alt={c.owner?.username || "User"}
              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-theme-border"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold text-xs text-theme-text">
                  @{c.owner?.username || "Unknown"}
                </span>
                <span className="text-[10px] text-theme-muted">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-theme-text text-sm leading-snug">{c.content}</p>
            </div>
            {user && c.owner?._id === user._id && (
              <button
                onClick={() => handleDelete(c._id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-theme-muted hover:text-red-500 p-1 h-fit"
                title="Delete comment"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
