import { axiosAdmin } from "./api.js";

export const getAllEvents = async (params = {}) => {
  const { data } = await axiosAdmin.get("/events", {
    params,
  });

  return data;
};

export const getEventById = async (id) => {
  const { data } = await axiosAdmin.get(
    `/events/${id}`
  );

  return data;
};

export const registerToEvent = async (id) => {
  const { data } = await axiosAdmin.post(
    `/events/${id}/register`
  );

  return data;
};

export const unregisterFromEvent = async (id) => {
  const { data } = await axiosAdmin.delete(
    `/events/${id}/register`
  );

  return data;
};

export const createEvent = async (eventData) => {
  const { data } = await axiosAdmin.post(
    "/events",
    eventData
  );

  return data;
};

export const updateEvent = async (
  id,
  eventData
) => {
  const { data } = await axiosAdmin.put(
    `/events/${id}`,
    eventData
  );

  return data;
};

export const cancelEvent = async (
  id,
  reason
) => {
  const { data } = await axiosAdmin.patch(
    `/events/${id}/cancel`,
    { reason }
  );

  return data;
};

export const deleteEvent = async (id) => {
  const { data } = await axiosAdmin.delete(
    `/events/${id}`
  );

  return data;
};

export const uploadEventCover = async (
  id,
  file
) => {
  const formData = new FormData();

  formData.append("cover", file);

  const { data } = await axiosAdmin.put(
    `/events/${id}/cover`,
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return data;
};

export default {
  getAllEvents,
  getEventById,
  registerToEvent,
  unregisterFromEvent,
  createEvent,
  updateEvent,
  cancelEvent,
  deleteEvent,
  uploadEventCover,
};