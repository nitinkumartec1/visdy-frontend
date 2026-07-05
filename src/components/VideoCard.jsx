import { Link } from "react-router-dom";
import { memo, useMemo } from "react";

const VideoCard = memo(function VideoCard({ video }) {
  const timeAgo = useMemo(() => {
    if (!video.createdAt) return null;
    const seconds = Math.floor((new Date() - new Date(video.createdAt)) / 1000);
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
    return Math.floor(seconds) + "s ago";
  }, [video.createdAt]);

  return (
    <Link to={`/video/${video._id}`}>
      <div className="w-full bg-transparent group overflow-hidden transition-all duration-300 ease-in-out cursor-pointer">
        <div className="relative overflow-hidden aspect-video w-full rounded-xl">
           <img src={video.thumbnail} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
           </div>
        </div>
        <div className="p-3">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-theme-soft overflow-hidden shrink-0 border border-theme-border mt-1">
               <img src={video.owner?.avatar} alt={video.owner?.username} className="w-full h-full object-cover" /> 
            </div>
            <div className="flex flex-col flex-1 min-w-0">
                <h3 className="font-semibold text-base leading-snug line-clamp-2 text-theme-text group-hover:text-wine-glow transition-colors">{video.title}</h3>
                
                <div className="text-sm text-zinc-400 mt-1">
                    {/* Mobile Layout: Single Line */}
                    <div className="md:hidden truncate">
                        <span className="hover:text-theme-text transition-colors font-medium">
                            {video.owner?.username}
                        </span>
                        <span className="mx-1.5 text-[10px]">•</span>
                        <span>{video.views || 0} views</span>
                        {timeAgo && (
                            <>
                                <span className="mx-1.5 text-[10px]">•</span>
                                <span>{timeAgo}</span>
                            </>
                        )}
                    </div>

                    {/* Desktop Layout: Stacked */}
                    <div className="hidden md:block">
                        <div className="hover:text-theme-text transition-colors font-medium truncate">
                            {video.owner?.username}
                        </div>
                        <div className="flex items-center truncate mt-0.5">
                            <span>{video.views || 0} views</span>
                            {timeAgo && (
                                <>
                                    <span className="mx-1.5 text-[10px]">•</span>
                                    <span>{timeAgo}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

export default VideoCard;