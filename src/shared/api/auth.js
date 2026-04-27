import { axiosAuth } from "./api";

export const login = async (data) => {
    return await axiosAuth.post("/auth/login", data);
};

export const register = async (formData) => {
    return await axiosAuth.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};

export const getAllUsers = async () => {
    const { data } = await axiosAuth.get("/auth/users");
    return { users: data };
};

export const updateUserRole = async (userId, roleName) => {
    return await axiosAuth.put(`/users/${userId}/role`, { roleName });
};

export const getProfile = async () => {
    const { data } = await axiosAuth.get("/auth/profile");
    return { profile: data };
};

export const verifyEmail = async (token) => {
    return await axiosAuth.post("/auth/verify-email", { token });
};

export const resendVerification = async (email) => {
    return await axiosAuth.post("/auth/resend-verification", { email });
};

export const forgotPassword = async (email) => {
    return await axiosAuth.post("/auth/forgot-password", { email });
};

export const resetPassword = async (token, newPassword) => {
    return await axiosAuth.post("/auth/reset-password", { token, newPassword });
};
