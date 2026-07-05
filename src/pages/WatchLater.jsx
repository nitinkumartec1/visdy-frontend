import { useEffect, useState } from "react";
import { getWatchLaterVideos } from "../api/user.api";
import VideoCard from "../components/VideoCard";

export default function WatchLater() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWatchLaterVideos()
      .then((res) => {
        setVideos(res.data.data);
      })
      .catch((err) => console.error("Failed to fetch watch later videos", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 lg:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-theme-text mb-2">Watch Later</h1>
        <p className="text-theme-muted">
          Videos you have saved to watch later.
        </p>
      </div>

      {videos.length === 0 ? (
        <div className="text-center mt-20">
          <p className="text-xl text-theme-muted mb-4">
            You don't have any videos saved to watch later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
