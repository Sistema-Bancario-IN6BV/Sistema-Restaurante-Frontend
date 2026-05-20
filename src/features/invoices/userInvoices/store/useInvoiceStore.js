import { create } from "zustand";

import {
  getMyInvoices as getMyInvoicesRequest,
  payInvoice as payInvoiceRequest,
  deleteInvoice as deleteInvoiceRequest,
} from "../../../../shared/api/invoices";

export const useInvoiceStore = create((set, get) => ({
  invoices: [],
  loading: false,
  error: null,

  getInvoices: async () => {
    try {
      set({ loading: true });

      const response = await getMyInvoicesRequest();

      set({
        invoices: response.data.data,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message,
      });
    }
  },
  
  deleteInvoice: async (id) => {
    try {
      await deleteInvoiceRequest(id);
      set({ invoices: get().invoices.filter(i => i._id !== id) });
    } catch (error) {
      set({ error: error.response?.data?.message });
    }
  },

  payInvoice: async (id, paymentMethod) => {
    try {
      const response = await payInvoiceRequest(id, paymentMethod);

      const updated = response.data.data;

      set({
        invoices: get().invoices.map((i) =>
          i._id === id ? updated : i
        ),
      });
    } catch (error) {
      set({
        error: error.response?.data?.message,
      });
    }
  },
}));