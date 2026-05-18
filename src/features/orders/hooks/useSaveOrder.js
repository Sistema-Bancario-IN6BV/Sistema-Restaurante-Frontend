import { useOrderStore } from "../store/useOrderStore.js";

export const useSaveOrder = () => {
  const createOrder = useOrderStore((state) => state.createOrder);

  const saveOrder = async (data) => {
    await createOrder(data);
  };

  return { saveOrder };
};