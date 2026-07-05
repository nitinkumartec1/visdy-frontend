import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserChannelProfile } from "../api/user.api";
import { getAllVideos } from "../api/video.api";
import { getUserTweets } from "../api/tweet.api";
import VideoCard from "../components/VideoCard";
import SubscribeButton from "../components/SubscribeButton";
import TweetCard from "../components/TweetCard";

export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [activeTab, setActiveTab] = useState("videos");
  const [error, setError] = useState("");
  const [loadingTweets, setLoadingTweets] = useState(false);

  useEffect(() => {
    if (!username) return;
    
    // Fetch Profile
    getUserChannelProfile(username)
      .then(res => {
        const userProfile = res.data.data;
        setProfile(userProfile);
        
        // Fetch User's videos
        getAllVideos({ userId: userProfile._id })
           .then(vidRes => {
               setVideos(vidRes.data.data.videos);
           })
           .catch(() => {
               console.error("Failed to fetch user videos");
           });

        // Fetch User's tweets
        setLoadingTweets(true);
        getUserTweets(userProfile._id)
          .then(tweetRes => {
            setTweets(tweetRes.data.data || []);
          })
          .catch(() => {
            console.error("Failed to fetch user tweets");
          })
          .finally(() => setLoadingTweets(false));
      })
      .catch(() => setError("Channel not found"));

  }, [username]);

  const handleTweetDelete = (tweetId) => {
    setTweets((prev) => prev.filter((t) => t._id !== tweetId));
  };

  if (error) return <div className="p-8 text-center text-wine-glow">{error}</div>;
  if (!profile) return <div className="p-8 text-center font-medium">Loading profile...</div>;

  return (
    <div className="w-full">
      {/* Cover Image */}
      <div className="h-40 md:h-60 w-full bg-gray-200 overflow-hidden relative">
        {profile.coverImage ? (
             <img src={profile.coverImage} alt="Cover" className="w-full h-full object-cover" />
        ) : (
            <div className="w-full h-full bg-gradient-to-r from-wine-primary to-pink-500"></div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center -mt-12 md:-mt-16 mb-8 relative z-10">
            {/* Avatar */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white overflow-hidden bg-gray-100 flex-shrink-0">
                <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
            </div>
            
            <div className="mt-4 md:mt-16 md:ml-6 flex-1">
                <h1 className="text-2xl font-bold text-theme-text">{profile.fullName}</h1>
                <p className="text-theme-muted">@{profile.username}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-theme-muted">
                    <span>{profile.subscribersCount} subscribers</span>
                    <span>{profile.channelsSubscribedToCount} subscribed</span>
                </div>
            </div>

            <div className="mt-4 md:mt-16">
                 <SubscribeButton channelId={profile._id} />
            </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-theme-border mb-8">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab("videos")}
              className={`px-6 py-3 text-sm font-semibold transition-all duration-300 relative ${
                activeTab === "videos"
                  ? "text-wine-glow"
                  : "text-theme-muted hover:text-theme-text"
              }`}
            >
              Videos
              {activeTab === "videos" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-wine-primary rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("tweets")}
              className={`px-6 py-3 text-sm font-semibold transition-all duration-300 relative ${
                activeTab === "tweets"
                  ? "text-wine-glow"
                  : "text-theme-muted hover:text-theme-text"
              }`}
            >
              Tweets
              {tweets.length > 0 && (
                <span className="ml-1.5 text-xs text-theme-muted">({tweets.length})</span>
              )}
              {activeTab === "tweets" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-wine-primary rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "videos" && (
          <div>
            {videos && videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {videos.map(video => (
                        <VideoCard key={video._id} video={video} />
                    ))}
                </div>
            ) : (
                <div className="p-8 text-center bg-theme-soft rounded-xl border border-theme-border">
                  <p className="text-theme-muted">This user hasn't uploaded any videos yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "tweets" && (
          <div className="max-w-2xl">
            {loadingTweets ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-wine-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : tweets.length > 0 ? (
              <div className="space-y-4">
                {tweets.map((tweet) => {
                  // Attach owner info if not already populated
                  const tweetWithOwner = {
                    ...tweet,
                    owner: typeof tweet.owner === "object" ? tweet.owner : {
                      _id: profile._id,
                      username: profile.username,
                      avatar: profile.avatar,
                    },
                  };
                  return (
                    <TweetCard
                      key={tweet._id}
                      tweet={tweetWithOwner}
                      onDelete={handleTweetDelete}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-theme-soft rounded-xl border border-theme-border">
              <p className="text-theme-muted">This user hasn't posted any tweets yet.</p>
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
