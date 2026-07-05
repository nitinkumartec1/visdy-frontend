import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllVideos } from "../api/video.api";
import VideoCard from "../components/VideoCard";
import { useSidebar } from "../context/SidebarContext";

export default function Home() {
  const { collapsed } = useSidebar();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("query") || "";

  const fetchVideos = async (query = "") => {
    setLoading(true);
    try {
      const res = await getAllVideos({ query });
      // Controller returns { videos, total, page, ... } in data.data
      setVideos(res.data.data.videos || []); 
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(queryParam);
  }, [queryParam]);

  return (
    <div className="w-full">
      {/* Search results indicator */}
      {queryParam && (
        <div className="mb-6 w-full">
          <h2 className="text-xl font-medium text-theme-text border-b border-theme-border pb-4">
            Search results for: <span className="font-bold text-wine-glow">"{queryParam}"</span>
          </h2>
        </div>
      )}

      {loading ? (
        <div className="text-center mt-10 text-theme-muted">Loading videos...</div>
      ) : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 ${collapsed ? 'lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6' : 'lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5'} gap-x-4 gap-y-10`}>
          {videos.length > 0 ? (
            videos.map(video => (
                <VideoCard key={video._id} video={video} />
            ))
          ) : (
            <div className="col-span-full text-center text-theme-muted mt-10">
                No videos found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}