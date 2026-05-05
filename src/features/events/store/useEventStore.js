import { create } from "zustand";
import * as eventsApi from "../../../shared/api/events.js";

export const useEventStore = create((set, get) => ({
    events: [],
    currentEvent: null,
    loading: false,
    error: null,
    pagination: {
        page: 1,
        pages: 1,
        total: 0
    },
    filters: {
        restaurantId: null,
        from: null,
        to: null
    },

    setFilters: (filters) => set({ filters }),

    setCurrentEvent: (event) => set({ currentEvent: event }),

    fetchEvents: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const state = get();
            const result = await eventsApi.getAllEvents({
                ...state.filters,
                ...params
            });
            set({
                events: result.data || [],
                pagination: result.pagination || { page: 1, pages: 1, total: 0 },
                loading: false
            });
        } catch (err) {
            set({
                error: err.response?.data?.message || err.message,
                loading: false
            });
        }
    },

    fetchEventById: async (id) => {
        set({ loading: true, error: null });
        try {
            const result = await eventsApi.getEventById(id);
            set({
                currentEvent: result.data,
                loading: false
            });
            return { success: true, data: result.data };
        } catch (err) {
            set({
                error: err.response?.data?.message || err.message,
                loading: false
            });
            return {
                success: false,
                error: err.response?.data?.message || err.message
            };
        }
    },

    createEvent: async (eventData) => {
        set({ loading: true, error: null });
        try {
            const result = await eventsApi.createEvent(eventData);
            const state = get();
            set({
                events: [result.data, ...state.events],
                loading: false
            });
            return { success: true, data: result.data };
        } catch (err) {
            set({
                error: err.response?.data?.message || err.message,
                loading: false
            });
            return {
                success: false,
                error: err.response?.data?.message || err.message
            };
        }
    },

    updateEvent: async (id, eventData) => {
        set({ loading: true, error: null });
        try {
            const result = await eventsApi.updateEvent(id, eventData);
            const state = get();
            set({
                events: state.events.map((e) =>
                    e.id === id ? { ...e, ...result.data } : e
                ),
                loading: false
            });
            return { success: true, data: result.data };
        } catch (err) {
            set({
                error: err.response?.data?.message || err.message,
                loading: false
            });
            return {
                success: false,
                error: err.response?.data?.message || err.message
            };
        }
    },

    cancelEvent: async (id, reason) => {
        set({ loading: true, error: null });
        try {
            const result = await eventsApi.cancelEvent(id, reason);
            const state = get();
            set({
                events: state.events.map((e) =>
                    e.id === id ? { ...e, status: "CANCELLED", cancelReason: reason } : e
                ),
                loading: false
            });
            return { success: true, data: result.data };
        } catch (err) {
            set({
                error: err.response?.data?.message || err.message,
                loading: false
            });
            return {
                success: false,
                error: err.response?.data?.message || err.message
            };
        }
    },

    deleteEvent: async (id) => {
        set({ loading: true, error: null });
        try {
            await eventsApi.deleteEvent(id);
            const state = get();
            set({
                events: state.events.filter((e) => e.id !== id),
                loading: false
            });
            return { success: true };
        } catch (err) {
            set({
                error: err.response?.data?.message || err.message,
                loading: false
            });
            return {
                success: false,
                error: err.response?.data?.message || err.message
            };
        }
    },

    uploadCover: async (id, file) => {
        set({ loading: true, error: null });
        try {
            const result = await eventsApi.uploadEventCover(id, file);
            const state = get();
            set({
                events: state.events.map((e) =>
                    e.id === id ? { ...e, coverImage: result.data.coverImage } : e
                ),
                loading: false
            });
            return { success: true, data: result.data };
        } catch (err) {
            set({
                error: err.response?.data?.message || err.message,
                loading: false
            });
            return {
                success: false,
                error: err.response?.data?.message || err.message
            };
        }
    }
}));
