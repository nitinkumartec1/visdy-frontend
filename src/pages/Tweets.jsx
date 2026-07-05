import { useEffect, useState } from "react";
import { createTweet, getAllTweets } from "../api/tweet.api";
import { useAuth } from "../context/AuthContext";
import TweetCard from "../components/TweetCard";

export default function Tweets() {
  const { user } = useAuth();
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  const fetchTweets = () => {
    if (!user?._id) return;
    setLoading(true);
    getAllTweets()
      .then((res) => setTweets(res.data.data || []))
      .catch((err) => console.error("Failed to fetch tweets", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTweets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try {
      const res = await createTweet(content.trim());
      const newTweet = res.data.data;
      // Attach owner info so TweetCard can display it
      const tweetWithOwner = {
        ...newTweet,
        owner: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
        },
      };
      setTweets((prev) => [tweetWithOwner, ...prev]);
      setContent("");
    } catch (err) {
      console.error("Failed to create tweet", err);
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = (tweetId) => {
    setTweets((prev) => prev.filter((t) => t._id !== tweetId));
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <h1 className="text-2xl font-bold text-theme-text mb-6">Tweets</h1>

      {/* Tweets Feed */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-wine-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-theme-muted">Loading tweets…</p>
          </div>
        </div>
      ) : tweets.length > 0 ? (
        <div className="space-y-4 mb-8">
          {tweets.map((tweet) => (
            <TweetCard key={tweet._id} tweet={tweet} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-theme-card border border-theme-border flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 text-theme-muted">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-theme-text mb-2">No tweets yet</h2>
          <p className="text-theme-muted max-w-sm mb-8">
            Be the first to share your thoughts with the community!
          </p>
        </div>
      )}

      {/* Compose Box */}
      <div className="bg-theme-card border border-theme-border rounded-xl p-5 mb-8 mt-auto sticky bottom-24 lg:bottom-8 shadow-2xl">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-theme-soft border border-theme-border flex-shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-wine-glow font-bold text-sm">
                {user?.username?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>
          <form onSubmit={handlePost} className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full bg-transparent border-none outline-none resize-none text-theme-text placeholder-theme-muted text-sm leading-relaxed min-h-[60px]"
              rows={3}
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-theme-border">
              <span className="text-xs text-theme-muted">
                {content.length > 0 ? `${content.length} characters` : ""}
              </span>
              <button
                type="submit"
                disabled={posting || !content.trim()}
                className="btn-primary text-sm py-1.5 px-5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {posting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Posting…
                  </span>
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
