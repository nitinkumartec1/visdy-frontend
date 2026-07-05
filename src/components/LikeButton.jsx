import { useEffect, useState } from "react";
import { toggleVideoLike, getVideoLikes } from "../api/like.api";
import { useAuth } from "../context/AuthContext";

export default function LikeButton({ videoId }) {
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    getVideoLikes(videoId).then(res => {
        setLikes(res.data.data.totalLikes);
        setIsLiked(res.data.data.isLiked);
    }).catch(err => console.error("Error fetching likes:", err));
  }, [videoId]);

  const handleLike = async () => {
    if (!user) {
        alert("Please login to like videos");
        return;
    }

    // Optimistic update
    const previousLikes = likes;
    const previousIsLiked = isLiked;

    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    setIsLiked(prev => !prev);

    try {
        await toggleVideoLike(videoId);
    } catch (err) {
        // Revert on error
        setLikes(previousLikes);
        setIsLiked(previousIsLiked);
        console.error("Like toggle failed", err);
    }
  };

  return (
    <button
      onClick={handleLike}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
        isLiked 
          ? "bg-white text-black hover:bg-gray-200" 
          : "bg-theme-card text-theme-text hover:bg-[#3f3f46]"
      }`}
    >
      {isLiked ? "👍 Liked" : "👍 Like"}
      <span className="border-l border-gray-500 pl-2 ml-1 text-sm">{likes}</span>
    </button>
  );
}