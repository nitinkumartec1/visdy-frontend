import api from "./axios";

export const createPlaylist = (data) => api.post("/playlist", data);
export const getUserPlaylists = (userId) => api.get(`/playlist/user/${userId}`);
export const getPlaylistById = (playlistId) => api.get(`/playlist/${playlistId}`);
export const updatePlaylist = (playlistId, data) => api.patch(`/playlist/${playlistId}`, data);
export const deletePlaylist = (playlistId) => api.delete(`/playlist/${playlistId}`);
export const addVideoToPlaylist = (playlistId, videoId) => api.post(`/playlist/${playlistId}/videos/${videoId}`);
export const removeVideoFromPlaylist = (playlistId, videoId) => api.delete(`/playlist/${playlistId}/videos/${videoId}`);
