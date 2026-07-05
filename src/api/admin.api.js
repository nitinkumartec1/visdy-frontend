import api from "./axios";

export const getPlatformStats = () => api.get("/admin/stats");

export const getAllUsers = (params) => api.get("/admin/users", { params });
export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`);

export const getAllVideos = (params) => api.get("/admin/videos", { params });
export const deleteVideo = (videoId) => api.delete(`/admin/videos/${videoId}`);

export const getAllComments = (params) => api.get("/admin/comments", { params });
export const deleteComment = (commentId) => api.delete(`/admin/comments/${commentId}`);

export const getAllTweets = (params) => api.get("/admin/tweets", { params });
export const deleteTweet = (tweetId) => api.delete(`/admin/tweets/${tweetId}`);
