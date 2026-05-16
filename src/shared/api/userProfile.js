import { axiosAuth } from "../api";

export const getUserProfile = async (id) => {
    const { data } = await axiosAuth.get(`/auth/profile`);
    return data.data || data;
};

export const updateProfile = async (id, data) => {
    const { data: res } = await axiosAuth.put(`/auth/profile`, data, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return res;
};
