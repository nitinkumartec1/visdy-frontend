import { useEffect, useState } from "react";
import {
  toggleSubscription,
  getSubscribers
} from "../api/subscription.api";
import { useAuth } from "../context/AuthContext";

export default function SubscribeButton({ channelId }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!channelId) return;
    
    // Check if user is viewing their own channel
    if (user && String(channelId) === String(user._id)) {
       setIsSubscribed(false);
       return;
    }

    getSubscribers(channelId).then(res => {
      const subscribers = Array.isArray(res.data.data) ? res.data.data : [];
      
      if (user) {
        const isSubbed = subscribers.some(sub => {
            const subId = sub.subscriber?._id || sub.subscriber;
            return String(subId) === String(user._id);
        });
        setIsSubscribed(isSubbed);
      }
    }).catch(err => console.error("Error fetching subscribers", err));
  }, [channelId, user]);

  const handleSubscribe = async (e) => {
     if (e) {
        e.preventDefault();
        e.stopPropagation();
     }

     if (!user) {
        alert("Please login to subscribe!");
        return;
     }

     if (loading) return; 

     setLoading(true);
     // Optimistic update
     setIsSubscribed(prev => !prev);

     try {
       await toggleSubscription(channelId);
     } catch (err) {
       // Revert on failure
       console.error("Subscription failed", err);
       setIsSubscribed(prev => !prev);
     } finally {
       setLoading(false);
     }
  };

  const isOwnChannel = user && String(user._id) === String(channelId);

  if (isOwnChannel) {
    return (
      <div className="px-6 py-2 rounded-full bg-white/5 border border-theme-border text-theme-muted font-medium text-sm">
        Your Channel
      </div>
    );
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className={`relative group px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 overflow-hidden ${
        isSubscribed 
          ? "bg-white/5 text-theme-text border border-theme-border hover:bg-white/10" 
          : "bg-wine-primary text-theme-text shadow-lg shadow-wine-primary/25 hover:bg-wine-accent hover:shadow-wine-primary/40"
      } ${loading ? "opacity-70 cursor-wait" : ""}`}
    >
      <span className={`flex items-center gap-2 ${loading ? "invisible" : "visible"}`}>
        {isSubscribed ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Subscribed
          </>
        ) : "Subscribe"}
      </span>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
}
