import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
    login as loginRequest,
    register as registerRequest,
    forgotPassword as forgotPasswordRequest,
    resetPassword as resetPasswordRequest
} from "../../../shared/api"

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            userId: null,
            token: null,
            refreshToken: null,
            expiresAt: null,
            loading: false,
            error: null,
            isAuthenticated: false,
            isLoadingAuth: true,

            checkAuth: () => {
                const token = get().token;
                // If token exists, keep user authenticated regardless of role.
                set({
                    isLoadingAuth: false,
                    isAuthenticated: Boolean(token)
                })
            },

            logout: () => {
                set({
                    user: null,
                    userId: null,
                    token: null,
                    expiresAt: null,
                    isAuthenticated: false
                })
            },

            register: async (formData) => {
                try {
                    set({ loading: true, error: null });
                    const { data } = await registerRequest(formData);
                    set({ loading: false });
                    return {
                        success: true,
                        emailVerificationRequired: data?.emailVerificationRequired,
                        data
                    }
                } catch (err) {
                    const message = err.response?.data.message || "Error al registrarse";
                    set({ error: message, loading: false});
                    return { success: false, error: message}
                }
            },

            login: async ({ emailOrUsername, password }) => {
                try {
                    set({ loading: true, error: null });

                    const normalizedEmailOrUsername = String(emailOrUsername || "").trim();
                    const normalizedPassword = String(password || "");

                    const { data } = await loginRequest({
                        emailOrUsername: normalizedEmailOrUsername,
                        password: normalizedPassword
                    })
                    console.log(data)

                    set({
                        user: data.userDetails,
                        userId: data.userDetails?.id,
                        token: data.token,
                        expiresAt: data.expiresAt || null,
                        loading: false,
                        isAuthenticated: true
                    })

                    return { success: true }

                } catch (err) {
                    console.error("Login error: ", err);
                    const message =
                        err.response?.data?.message || "Error de autenticación";
                    set({ error: message, loading: false })
                    return { success: false, error: message }
                }
            },

            forgotPassword: async (email) => {
                try {
                    set({ loading: true, error: null });
                    const { data } = await forgotPasswordRequest(email);
                    set({ loading: false });
                    return { success: true, message: data.message };
                } catch (err) {
                    const message = err.response?.data.message || "Error al enviar correo de recuperación";
                    set({ error: message, loading: false });
                    return { success: false, error: message };
                }
            },

            resetPassword: async (token, newPassword) => {
                try {
                    set({ loading: true, error: null });
                    const { data } = await resetPasswordRequest(token, newPassword);
                    set({ loading: false });
                    return { success: true, message: data.message };
                } catch (err) {
                    const message = err.response?.data.message || "Error al restablecer la contraseña";
                    set({ error: message, loading: false });
                    return { success: false, error: message };
                }
            }
        }),
        { name: "auth-storage" }
    )
)
