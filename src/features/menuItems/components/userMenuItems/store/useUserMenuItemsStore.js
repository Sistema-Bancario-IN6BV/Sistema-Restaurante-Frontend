import { create } from "zustand";

import { getAllMenuItems } from "../../../../../shared/api/menuItems.js";

export const useUserMenuItemsStore = create((set) => ({

    items: [],
    loading: false,

    getMenuItems: async (restaurantId) => {

        try {

            set({ loading: true });

            const response =
                await getAllMenuItems(restaurantId);

            const data =
                response.data || response;

            const itemList = Array.isArray(data)
                ? data
                : Object.values(data).flat();

            set({
                items: itemList,
                loading: false,
            });

        } catch (error) {

            console.log(error);

            set({
                items: [],
                loading: false,
            });
        }
    },
}));