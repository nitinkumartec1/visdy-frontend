import api from "./axios";

export const changePassword = (data) => api.post("/users/change-password", data);
export const getCurrentUser = () => api.get("/users/current-user");
export const updateAccountDetails = (data) => api.patch("/users/update-account", data);
export const updateUserAvatar = (data) => api.patch("/users/avatar", data);
export const updateUserCoverImage = (data) => api.patch("/users/cover-image", data);
export const getUserChannelProfile = (username) => api.get(`/users/c/${username}`);
export const getWatchHistory = () => api.get("/users/history");
export const toggleWatchLater = (videoId) => api.post(`/users/watch-later/${videoId}`);
export const getWatchLaterVideos = () => api.get("/users/watch-later");
