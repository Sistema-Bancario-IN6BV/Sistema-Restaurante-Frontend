import { axiosAuth } from "./api";

export const getUnreadMessagesCount = async () => {
  try {
    const { data } = await axiosAuth.get("/messages/my/unread-count");
    return data?.data ?? data;
  } catch (err) {
    return 0;
  }
};

export const getMyMessages = async (page = 1, pageSize = 20) => {
  const { data } = await axiosAuth.get(`/messages/my?page=${page}&pageSize=${pageSize}`);
  return data?.data ?? data;
};

export const markMessageAsRead = async (messageId) => {
  const { data } = await axiosAuth.patch(`/messages/${messageId}/read`);
  return data;
};
