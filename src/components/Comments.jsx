import { useEffect, useState } from "react";
import { getVideoComments, addComment } from "../api/comment.api";
import { useAuth } from "../context/AuthContext";

export default function Comments({ videoId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    getVideoComments(videoId).then(res => {
        // Backend returns: { comments: [...], page, limit, ... }
        setComments(res.data.data.comments || []);
    });
  }, [videoId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
        const res = await addComment(videoId, text);
        // Backend key for new comment might be 'comment' based on controller
        const newComment = res.data.data.comment; 
        // Manually populate owner for immediate display if backend didn't do it fully (though controller seems to populate)
        if (!newComment.owner && user) {
            newComment.owner = user;
        }
        setComments([newComment, ...comments]);
        setText("");
    } catch (error) {
        console.error("Failed to add comment", error);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-6 text-theme-text">{comments.length} Comments</h3>
      
      {user ? (
        <form onSubmit={submit} className="flex gap-4 mb-8">
            <img 
                src={user.avatar} 
                alt={user.username} 
                className="w-10 h-10 rounded-full object-cover ring-2 ring-wine-primary/20"
            />
            <div className="flex-1">
                <input
                    className="w-full bg-black/20 border-b border-theme-border focus:border-wine-primary p-3 outline-none text-theme-text placeholder-zinc-500 transition-colors rounded-t-lg"
                    placeholder="Add a comment..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                />
                <div className="flex justify-end mt-2">
                    <button 
                        type="submit"
                        disabled={!text.trim()}
                        className={`px-6 py-2 rounded-full font-medium transition-all ${
                            text.trim() 
                            ? 'bg-wine-primary text-theme-text hover:bg-wine-accent shadow-lg shadow-wine-primary/25' 
                            : 'bg-gray-800 text-theme-muted cursor-not-allowed'
                        }`}
                    >
                        Comment
                    </button>
                </div>
            </div>
        </form>
      ) : (
          <p className="mb-6 text-theme-muted function-call-cta">
            <a href="/login" className="text-wine-glow hover:text-wine-glow underline">Login</a> to join the discussion.
          </p>
      )}

      <div className="space-y-6">
        {comments.map(c => (
            <div key={c._id} className="flex gap-4 group">
                <img 
                    src={c.owner?.avatar || `https://ui-avatars.com/api/?name=${c.owner?.username || "User"}&background=random`} 
                    alt={c.owner?.username || "User"} 
                    className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-gray-700 group-hover:ring-wine-primary/50 transition-all"
                />
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-theme-text">@{c.owner?.username || "Unknown"}</span>
                        <span className="text-xs text-theme-muted">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-theme-muted leading-relaxed text-sm">{c.content}</p>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}