import api from "./axios";

export const getAllVideos = (params) =>
  api.get("/videos", { params });

export const getVideoById = (id) =>
  api.get(`/videos/${id}`);

export const updateVideo = (id, data) =>
  api.patch(`/videos/${id}`, data);

export const deleteVideo = (id) =>
  api.delete(`/videos/${id}`);

export const togglePublishStatus = (id) =>
  api.patch(`/videos/toggle/publish/${id}`);

export const generateSignature = () =>
  api.get("/videos/generate-signature");

export const uploadVideo = (data) =>
  api.post("/videos", data);

export const uploadEditedVideo = (data) =>
  api.post("/videos/edited", data);