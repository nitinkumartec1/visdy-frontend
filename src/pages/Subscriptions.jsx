import { useEffect, useState } from "react";
import { getSubscribedChannels, toggleSubscription } from "../api/subscription.api";
import { getCurrentUser } from "../api/auth.api";
import { Link } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";

export default function Subscriptions() {
  const { collapsed } = useSidebar();
  const [channels, setChannels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const userRes = await getCurrentUser();
      const userId = userRes?.data?.data?._id;
      
      if (!userId) {
        console.error("User ID not found");
        return;
      }


      const subRes = await getSubscribedChannels(userId);
      setChannels(Array.isArray(subRes?.data?.data) ? subRes.data.data : []);
    } catch (err) {
      console.error("Failed to fetch subscriptions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleUnsubscribe = async (e, channelId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleSubscription(channelId);
      setChannels(prev => prev.filter(c => c.subscribedChannel._id !== channelId));
    } catch (err) {
      console.error("Unsubscribe failed", err);
    }
  };

  const filteredChannels = channels.filter(sub => 
    sub.subscribedChannel.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.subscribedChannel.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-wine-primary/20 border-t-wine-primary rounded-full animate-spin mb-4"></div>
        <p className="text-theme-muted font-medium">Loading your favorite channels...</p>
      </div>
    );
  }

  return (
    <div className="w-full py-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-theme-text tracking-tight mb-2">Subscriptions</h1>
          <p className="text-theme-muted">Manage the {channels.length} channels you're following</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search channels..."
            className="input-field pl-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {filteredChannels.length > 0 ? (
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 ${collapsed ? 'lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6' : 'lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5'} gap-x-4 gap-y-10`}>
          {filteredChannels.map(sub => (
            <Link 
              key={sub._id} 
              to={`/c/${sub.subscribedChannel.username}`} 
              className="group card p-6 hover:bg-white/5 border-theme-border hover:border-wine-primary/30 transition-all duration-500"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-wine-primary/20 blur-3xl rounded-full scale-50 group-hover:scale-110 transition-transform duration-500 opacity-0 group-hover:opacity-100"></div>
                <img 
                  src={sub.subscribedChannel.avatar} 
                  alt={sub.subscribedChannel.username} 
                  className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-white/5 profile-ring group-hover:ring-wine-primary/40 relative transition-all duration-500"
                />
              </div>

              <div className="text-center relative z-10">
                <h3 className="font-bold text-xl text-theme-text group-hover:text-wine-glow transition-colors duration-300 line-clamp-1">
                  {sub.subscribedChannel.fullName}
                </h3>
                <p className="text-theme-muted text-sm mb-4">@{sub.subscribedChannel.username}</p>
                
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full bg-theme-soft border-2 border-[#0f0f12]"></div>
                    ))}
                  </div>
                  <span className="text-xs text-theme-muted font-medium">
                    {sub.subscribedChannel.subscribersCount?.toLocaleString() || 0} subscribers
                  </span>
                </div>

                <button
                  onClick={(e) => handleUnsubscribe(e, sub.subscribedChannel._id)}
                  className="w-full py-2.5 rounded-xl bg-theme-soft hover:bg-wine-glow/10 text-theme-muted hover:text-wine-glow border border-theme-border hover:border-wine-glow/30 text-sm font-semibold transition-all duration-300"
                >
                  Unsubscribe
                </button>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-theme-border">
          <div className="w-20 h-20 bg-wine-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-wine-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
          </div>
          <h2 className="text-2xl font-bold text-theme-text mb-2">No subscriptions found</h2>
          <p className="text-theme-muted max-w-sm mx-auto">
            {searchTerm ? "Try searching for something else." : "Start following some awesome creators to see them here!"}
          </p>
          {!searchTerm && (
            <Link to="/" className="inline-block mt-8 btn-primary">
              Discover Creators
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

