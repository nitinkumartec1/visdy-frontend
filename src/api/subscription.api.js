import api from "./axios";

export const toggleSubscription = (channelId) =>
  api.post(`/subscriptions/c/${channelId}`);

export const getSubscribers = (channelId) =>
  api.get(`/subscriptions/c/${channelId}/subscribers`);

export const getSubscribedChannels = (subscriberId) =>
  api.get(`/subscriptions/u/${subscriberId}/subscriptions`);
