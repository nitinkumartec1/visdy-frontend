import { useEffect, useState } from "react";
import { getDashboardStats, getChannelVideos } from "../api/dashboard.api";
import { deleteVideo, togglePublishStatus } from "../api/video.api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    getDashboardStats()
      .then(res => setStats(res.data.data))
      .catch((err) => console.error(err));
      
    getChannelVideos()
      .then(res => setVideos(res.data.data))
      .catch((err) => console.error(err));
  }, []);

  const handleDelete = async (videoId) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      await deleteVideo(videoId);
      setVideos(videos.filter(v => v._id !== videoId));
    }
  };

  const handleTogglePublish = async (videoId) => {
    await togglePublishStatus(videoId);
    setVideos(videos.map(v => v._id === videoId ? { ...v, isPublished: !v.isPublished } : v));
  };


  if (!stats) return <p className="p-6">Loading dashboard...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Channel Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 text-theme-text p-4 rounded shadow">
          <h2 className="text-lg">Total Videos</h2>
          <p className="text-3xl font-bold">{stats.totalVideos}</p>
        </div>
        <div className="bg-gray-800 text-theme-text p-4 rounded shadow">
          <h2 className="text-lg">Total Views</h2>
          <p className="text-3xl font-bold">{stats.totalViews}</p>
        </div>
        <div className="bg-gray-800 text-theme-text p-4 rounded shadow">
          <h2 className="text-lg">Subscribers</h2>
          <p className="text-3xl font-bold">{stats.totalSubscribers}</p>
        </div>
         <div className="bg-gray-800 text-theme-text p-4 rounded shadow">
          <h2 className="text-lg">Total Likes</h2>
          <p className="text-3xl font-bold">{stats.totalLikes}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Your Videos</h2>
        <Link to="/upload" className="bg-wine-primary px-4 py-2 rounded text-theme-text hover:bg-wine-accent">Upload New Video</Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="py-2 px-4 text-left">Internal Status</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Thumbnail</th>
              <th className="py-2 px-4 text-left">Title</th>
              <th className="py-2 px-4 text-left text-right">Views</th>
              <th className="py-2 px-4 text-left text-right">Created At</th>
              <th className="py-2 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.map(video => (
              <tr key={video._id} className="border-b hover:bg-gray-50">
               <td className="py-2 px-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={video.isPublished} onChange={() => handleTogglePublish(video._id)} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-wine-glow dark:peer-focus:ring-wine-dark rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-wine-primary"></div>
                  </label>
                </td>
                <td className="py-2 px-4">
                  <span className={`px-2 py-1 rounded text-xs ${video.isPublished ? 'bg-green-100 text-green-800' : 'bg-red-100 text-wine-accent'}`}>
                    {video.isPublished ? 'Published' : 'Unpublished'}
                  </span>
                </td>
                <td className="py-2 px-4">
                  <img src={video.thumbnail} alt={video.title} className="w-16 h-10 object-cover rounded" />
                </td>
                <td className="py-2 px-4 font-medium text-gray-900">{video.title}</td>
                <td className="py-2 px-4 text-right">{video.views}</td>
                 <td className="py-2 px-4 text-right text-sm text-theme-muted">{new Date(video.createdAt).toLocaleDateString()}</td>
                <td className="py-2 px-4 text-center space-x-2">
                  <button onClick={() => handleDelete(video._id)} className="bg-wine-glow text-theme-text px-3 py-1 rounded hover:bg-wine-primary text-sm">Delete</button>
                  {/* Edit functionality would go here, maybe a modal or redirect */}
                </td>
              </tr>
            ))}
            {videos.length === 0 && (
                <tr>
                    <td colSpan="7" className="text-center py-4 text-theme-muted">No videos uploaded yet.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}