import api from "./axios";

export const getVideoComments = (videoId) =>
  api.get(`/comments/${videoId}`);

export const addComment = (videoId, content) =>
  api.post(`/comments/${videoId}`, { content });

export const getTweetComments = (tweetId) =>
  api.get(`/comments/t/${tweetId}`);

export const addTweetComment = (tweetId, content) =>
  api.post(`/comments/t/${tweetId}`, { content });

export const deleteComment = (commentId) =>
  api.delete(`/comments/c/${commentId}`);

export const updateComment = (commentId, content) =>
  api.patch(`/comments/c/${commentId}`, { content });