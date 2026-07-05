import api from "./axios";

export const getDashboardStats = () =>
  api.get("/dashboard/stats");

export const getChannelVideos = () =>
  api.get("/dashboard/videos");