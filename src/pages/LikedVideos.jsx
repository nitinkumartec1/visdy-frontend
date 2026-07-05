import { useEffect, useState } from "react";
import { getLikedVideos } from "../api/like.api";
import VideoCard from "../components/VideoCard";
import { useSidebar } from "../context/SidebarContext";

export default function LikedVideos() {
  const { collapsed } = useSidebar();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLikedVideos()
      .then(res => {
        setVideos(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch liked videos", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center p-8">Loading liked videos...</div>;

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Liked Videos</h1>
      {videos.length > 0 ? (
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 ${collapsed ? 'lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6' : 'lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5'} gap-x-4 gap-y-10`}>
          {videos.map(video => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center text-theme-muted">No liked videos found.</div>
      )}
    </div>
  );
}
