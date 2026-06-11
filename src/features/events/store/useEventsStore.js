import { create } from 'zustand';
import * as eventsApi from '../../../shared/api/events.js';

export const useEventsStore = create((set, get) => ({
  events: [],
  loading: false,

  getEvents: async (params = {}) => {
    try {
      set({ loading: true });
      const res = await eventsApi.getAllEvents(params);
      
      
      const payload = res?.data ?? res;
      const list = Array.isArray(payload) ? payload : (payload?.data ?? payload);
      set({ events: Array.isArray(list) ? list : [], loading: false });
    } catch (e) {
      set({ events: [], loading: false });
    }
  },

  register: async (id) => {
    try {
      set({ loading: true });
      const res = await eventsApi.registerToEvent(id);
      set({ loading: false });
      return res.data || res;
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  unregister: async (id) => {
    try {
      set({ loading: true });
      const res = await eventsApi.unregisterFromEvent(id);
      set({ loading: false });
      return res.data || res;
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  }
}));

export default useEventsStore;
