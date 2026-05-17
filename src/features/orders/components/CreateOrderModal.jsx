import {
  useEffect,
  useState,
} from "react";

import {
  useForm,
  useFieldArray,
} from "react-hook-form";

import {
  getRestaurantsByAdmin,
} from "../../../shared/api/restaurants.js";

import {
  getMenuByRestaurant,
} from "../../../shared/api/menu.js";

import {
  getTablesByRestaurant,
} from "../../../shared/api/tables.js";

import {
  useSaveOrder,
} from "../hooks/useSaveOrder.js";

import {
  showError,
  showSuccess,
} from "../../../shared/utils/toast";

export const CreateOrderModal = ({
  isOpen,
  onClose,
}) => {

  const [restaurantId, setRestaurantId] =
    useState("");

  const [menuItems, setMenuItems] =
    useState([]);

  const [tables, setTables] =
    useState([]);

  const [loadingRestaurant, setLoadingRestaurant] =
    useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
  } = useForm({
    defaultValues: {
      type: "DINE_IN",
      items: [
        {
          menuItemId: "",
          quantity: 1,
        },
      ],
    },
  });

  const orderType =
    watch("type");

  const {
    fields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "items",
  });

  const { saveOrder } =
    useSaveOrder();

  useEffect(() => {

    const loadRestaurant =
      async () => {

        try {

          setLoadingRestaurant(
            true
          );

          const user =
            JSON.parse(
              localStorage.getItem(
                "user"
              )
            );

          if (!user?._id) {
            return;
          }

          const response =
            await getRestaurantsByAdmin(
              user._id
            );

          const restaurants =
            response?.data ||
            response?.restaurants ||
            [];

          if (
            restaurants.length > 0
          ) {

            const restaurant =
              restaurants[0];

            setRestaurantId(
              restaurant._id
            );

            const menuResponse =
              await getMenuByRestaurant(
                restaurant._id
              );

            const tablesResponse =
              await getTablesByRestaurant(
                restaurant._id
              );

            setMenuItems(
              menuResponse?.data
                ?.data || []
            );

            setTables(
              tablesResponse?.data
                ?.data || []
            );
          }

        } catch (error) {

          console.log(error);

          showError(
            "Error al obtener datos del restaurante"
          );

        } finally {

          setLoadingRestaurant(
            false
          );

        }

      };

    if (isOpen) {
      loadRestaurant();
    }

  }, [isOpen]);

  const onSubmit =
    async (data) => {

      try {

        const payload = {
          ...data,
          restaurantId,
        };

        await saveOrder(
          payload
        );

        showSuccess(
          "Pedido creado correctamente"
        );

        reset();

        onClose();

      } catch (error) {

        showError(
          error.response?.data
            ?.message ||
          "Error al crear pedido"
        );

      }

    };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">

      <div className="bg-bg-card border border-accent/10 rounded-2xl w-full max-w-3xl p-6 shadow-2xl">

        <div className="flex justify-between items-center mb-6">

          <div>

            <h2 className="text-2xl font-bold text-accent font-serif">
              Crear Pedido
            </h2>

            <p className="text-sm text-accent/70 mt-1">
              Agrega múltiples platos al pedido
            </p>

          </div>

          <button
            onClick={onClose}
            className="text-xl text-text-muted hover:text-white"
          >
            ✕
          </button>

        </div>

        {loadingRestaurant ? (

          <div className="py-10 text-center text-white">
            Cargando restaurante...
          </div>

        ) : (

          <form
            onSubmit={handleSubmit(
              onSubmit
            )}
          >

            <div className="grid md:grid-cols-2 gap-4 mb-5">

              <select
                {...register(
                  "type"
                )}
                className="w-full px-4 py-3 rounded-xl border border-accent/20 bg-bg-page text-text-body"
              >

                <option value="DINE_IN">
                  Mesa
                </option>

                <option value="DELIVERY">
                  Domicilio
                </option>

                <option value="TAKEOUT">
                  Para llevar
                </option>

              </select>

              {orderType ===
                "DINE_IN" && (

                <select
                  {...register(
                    "tableId"
                  )}
                  className="w-full px-4 py-3 rounded-xl border border-accent/20 bg-bg-page text-text-body"
                >

                  <option value="">
                    Seleccionar mesa
                  </option>

                  {tables.map(
                    (table) => (

                      <option
                        key={
                          table._id
                        }
                        value={
                          table._id
                        }
                      >
                        Mesa{" "}
                        {
                          table.number
                        }
                      </option>

                    )
                  )}

                </select>

              )}

              {orderType ===
                "DELIVERY" && (

                <input
                  placeholder="Dirección de entrega"
                  {...register(
                    "deliveryAddress"
                  )}
                  className="w-full px-4 py-3 rounded-xl border border-accent/20 bg-bg-page text-text-body"
                />

              )}

            </div>

            <div className="space-y-4">

              {fields.map(
                (
                  field,
                  index
                ) => (

                  <div
                    key={
                      field.id
                    }
                    className="border border-accent/10 rounded-xl p-4 bg-bg-page/30"
                  >

                    <div className="grid md:grid-cols-2 gap-4">

                      <select
                        {...register(
                          `items.${index}.menuItemId`
                        )}
                        className="w-full px-4 py-3 rounded-xl border border-accent/20 bg-bg-page text-text-body"
                      >

                        <option value="">
                          Seleccionar plato
                        </option>

                        {menuItems.map(
                          (
                            item
                          ) => (

                            <option
                              key={
                                item._id
                              }
                              value={
                                item._id
                              }
                            >
                              {
                                item.name
                              }{" "}
                              - Q
                              {
                                item.price
                              }
                            </option>

                          )
                        )}

                      </select>

                      <input
                        type="number"
                        min="1"
                        placeholder="Cantidad"
                        {...register(
                          `items.${index}.quantity`
                        )}
                        className="w-full px-4 py-3 rounded-xl border border-accent/20 bg-bg-page text-text-body"
                      />

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        remove(
                          index
                        )
                      }
                      className="mt-3 text-red-400 text-sm hover:text-red-300"
                    >
                      Eliminar Plato
                    </button>

                  </div>

                )
              )}

            </div>

            <button
              type="button"
              onClick={() =>
                append({
                  menuItemId:
                    "",
                  quantity: 1,
                })
              }
              className="mt-5 bg-accent text-bg-dark font-bold px-5 py-2 rounded-xl hover:bg-gold-light transition"
            >
              + Agregar Plato
            </button>

            <div className="flex justify-end gap-3 mt-8">

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl border border-accent/20 text-text-body"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-xl font-bold transition"
              >
                Crear Pedido
              </button>

            </div>

          </form>

        )}

      </div>

    </div>
  );
};