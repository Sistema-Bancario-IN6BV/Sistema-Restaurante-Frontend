import { create } from "zustand";

const STORAGE_KEY = "cart";

const readStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const useCartStore = create((set, get) => ({
  items: readStorage(),
  addItem: (item) => {
    const items = [...get().items, item];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    set({ items });
  },
  removeItem: (predicate) => {
    const items = get().items.filter((i) => !predicate(i));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    set({ items });
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ items: [] });
  },
}));

export default useCartStore;
