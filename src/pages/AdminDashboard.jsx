import { useState, useEffect } from "react";
import { 
  getPlatformStats, 
  getAllUsers, deleteUser, 
  getAllVideos, deleteVideo, 
  getAllComments, deleteComment, 
  getAllTweets, deleteTweet 
} from "../api/admin.api";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview"); // overview, users, videos, comments, tweets
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState(null);
  
  // Data states
  const [users, setUsers] = useState([]);
  const [videos, setVideos] = useState([]);
  const [comments, setComments] = useState([]);
  const [tweets, setTweets] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setSearchQuery("");
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      if (activeTab === "overview") {
        const res = await getPlatformStats();
        setStats(res.data.data);
      } else if (activeTab === "users") {
        const res = await getAllUsers();
        setUsers(res.data.data.users);
      } else if (activeTab === "videos") {
        const res = await getAllVideos();
        setVideos(res.data.data.videos);
      } else if (activeTab === "comments") {
        const res = await getAllComments();
        setComments(res.data.data.comments);
      } else if (activeTab === "tweets") {
        const res = await getAllTweets();
        setTweets(res.data.data.tweets);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // --- Deletion Handlers ---

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("WARNING: This will delete the user and ALL their videos, comments, and tweets. Proceed?")) return;
    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Delete this video permanently?")) return;
    try {
      await deleteVideo(videoId);
      setVideos(videos.filter(v => v._id !== videoId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete video");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment permanently?")) return;
    try {
      await deleteComment(commentId);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const handleDeleteTweet = async (tweetId) => {
    if (!window.confirm("Delete this tweet permanently?")) return;
    try {
      await deleteTweet(tweetId);
      setTweets(tweets.filter(t => t._id !== tweetId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete tweet");
    }
  };

  // --- Render Helpers ---

  const renderTabs = () => {
    const tabs = [
      { id: "overview", label: "Overview" },
      { id: "users", label: "Users" },
      { id: "videos", label: "Videos" },
      { id: "comments", label: "Comments" },
      { id: "tweets", label: "Tweets" },
    ];

    return (
      <div className="flex overflow-x-auto space-x-2 border-b border-theme-border pb-4 mb-6 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-wine-primary text-white"
                : "bg-theme-card text-theme-muted hover:text-theme-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-theme-text tracking-tight flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-wine-glow">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          Admin Dashboard
        </h1>
        <p className="text-theme-muted mt-2">Manage users, content, and platform settings.</p>
      </div>

      {renderTabs()}

      {activeTab !== "overview" && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-theme-muted absolute left-3 top-1/2 -translate-y-1/2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-theme-card border border-theme-border rounded-xl pl-10 pr-4 py-2 text-theme-text focus:outline-none focus:border-wine-primary focus:ring-1 focus:ring-wine-primary transition-all shadow-sm"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-3 border-wine-primary/20 border-t-wine-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* OVERVIEW */}
          {activeTab === "overview" && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Users", value: stats.totalUsers, icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" },
                { label: "Total Videos", value: stats.totalVideos, icon: "M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 9.75v9a2.25 2.25 0 002.25 2.25z" },
                { label: "Total Comments", value: stats.totalComments, icon: "M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" },
                { label: "Total Tweets", value: stats.totalTweets, icon: "M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" },
              ].map((stat, i) => (
                <div key={i} className="card p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-wine-primary/10 text-wine-glow flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-theme-text mb-1">{stat.value}</h3>
                  <p className="text-theme-muted font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* USERS */}
          {activeTab === "users" && (
            <div className="overflow-x-auto rounded-xl border border-theme-border bg-theme-card">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/20 text-theme-muted text-sm border-b border-theme-border">
                    <th className="p-4 font-medium">User</th>
                    <th className="p-4 font-medium">Role</th>
                    <th className="p-4 font-medium">Auth Provider</th>
                    <th className="p-4 font-medium">Joined</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-theme-border">
                  {users
                    .filter(u => u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || u.username?.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((u) => (
                    <tr key={u._id} className="hover:bg-black/10 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={u.avatar} alt={u.username} className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <div className="font-semibold text-theme-text">{u.fullName}</div>
                            <Link to={`/c/${u.username}`} className="text-wine-glow hover:underline">@{u.username}</Link>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${u.role === 'admin' ? 'bg-wine-primary/20 text-wine-glow' : 'bg-gray-500/20 text-gray-300'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-theme-muted capitalize">{u.authProvider}</td>
                      <td className="p-4 text-theme-muted">{formatDistanceToNow(new Date(u.createdAt))} ago</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDeleteUser(u._id)}
                          className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-colors"
                          title="Delete User"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan="5" className="p-8 text-center text-theme-muted">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* VIDEOS */}
          {activeTab === "videos" && (
             <div className="overflow-x-auto rounded-xl border border-theme-border bg-theme-card">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-black/20 text-theme-muted text-sm border-b border-theme-border">
                     <th className="p-4 font-medium">Video</th>
                     <th className="p-4 font-medium">Owner</th>
                     <th className="p-4 font-medium">Stats</th>
                     <th className="p-4 font-medium text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="text-sm divide-y divide-theme-border">
                   {videos
                     .filter(v => v.title?.toLowerCase().includes(searchQuery.toLowerCase()) || v.owner?.username?.toLowerCase().includes(searchQuery.toLowerCase()))
                     .map((v) => (
                     <tr key={v._id} className="hover:bg-black/10 transition-colors">
                       <td className="p-4">
                         <div className="flex items-center gap-4 max-w-sm">
                           <img src={v.thumbnail} alt="thumb" className="w-24 h-14 rounded object-cover flex-shrink-0" />
                           <div>
                             <Link to={`/video/${v._id}`} className="font-semibold text-theme-text hover:text-wine-glow line-clamp-1">{v.title}</Link>
                             <div className="text-xs text-theme-muted mt-1">
                               {v.isPublished ? <span className="text-green-400">Published</span> : <span className="text-yellow-400">Draft</span>}
                               {" • "}{formatDistanceToNow(new Date(v.createdAt))} ago
                             </div>
                           </div>
                         </div>
                       </td>
                       <td className="p-4">
                         <Link to={`/c/${v.owner.username}`} className="flex items-center gap-2 hover:opacity-80">
                           <img src={v.owner.avatar} alt="" className="w-6 h-6 rounded-full" />
                           <span className="text-theme-muted">@{v.owner.username}</span>
                         </Link>
                       </td>
                       <td className="p-4 text-theme-muted">
                         {v.views} views
                       </td>
                       <td className="p-4 text-right">
                         <button 
                           onClick={() => handleDeleteVideo(v._id)}
                           className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-colors"
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          )}

          {/* COMMENTS */}
          {activeTab === "comments" && (
            <div className="space-y-4">
              {comments
                .filter(c => c.content?.toLowerCase().includes(searchQuery.toLowerCase()) || c.owner?.username?.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(c => (
                <div key={c._id} className="card p-4 flex justify-between items-start gap-4 hover:border-wine-primary/30 transition-colors">
                  <div className="flex gap-3">
                    <img src={c.owner.avatar} className="w-10 h-10 rounded-full" alt="" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-theme-text">@{c.owner.username}</span>
                        <span className="text-xs text-theme-muted">{formatDistanceToNow(new Date(c.createdAt))} ago</span>
                      </div>
                      <p className="text-sm text-theme-text mb-2">{c.content}</p>
                      <div className="text-xs text-theme-muted">
                        On: {c.video ? <Link to={`/video/${c.video._id}`} className="text-wine-glow hover:underline">{c.video.title}</Link> : "A Tweet"}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteComment(c._id)} className="text-red-400 p-2 hover:bg-red-400/10 rounded-lg">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TWEETS */}
          {activeTab === "tweets" && (
            <div className="space-y-4">
              {tweets
                .filter(t => t.content?.toLowerCase().includes(searchQuery.toLowerCase()) || t.owner?.username?.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(t => (
                <div key={t._id} className="card p-4 flex justify-between items-start gap-4 hover:border-wine-primary/30 transition-colors">
                   <div className="flex gap-3">
                    <img src={t.owner.avatar} className="w-10 h-10 rounded-full" alt="" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-theme-text">@{t.owner.username}</span>
                        <span className="text-xs text-theme-muted">{formatDistanceToNow(new Date(t.createdAt))} ago</span>
                      </div>
                      <p className="text-theme-text whitespace-pre-wrap">{t.content}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteTweet(t._id)} className="text-red-400 p-2 hover:bg-red-400/10 rounded-lg">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
