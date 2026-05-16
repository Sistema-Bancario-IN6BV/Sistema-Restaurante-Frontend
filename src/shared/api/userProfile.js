import { axiosAuth } from "../api";

export const getUserProfile = async (id) => {
    const { data } = await axiosAuth.get(`/auth/profile`);
    // Assuming backend returns { data: { user details } } or similar
    // Si getUserProfile usaba el id, devolvemos data.data
    return data.data || data;
};

export const updateProfile = async (id, data) => {
    const { data: res } = await axiosAuth.put(`/users/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return res;
};
