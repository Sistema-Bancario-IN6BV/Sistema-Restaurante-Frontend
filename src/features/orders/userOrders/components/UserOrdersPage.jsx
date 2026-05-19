/*import {
  useEffect,
  useMemo,
  useState,
} from "react";


import { Spinner } from "../../../../shared/components/layouts/Spinner.jsx";
import { useUserOrderStore } from "../../userOrders/store/useUserOrderStore.js";
import { UserCreateOrderModal } from "./UserCreateOrderModal.jsx";
import { UserEditOrderModal } from "../../userOrders/components/UserEditOrderModal.jsx";

const PAGE_SIZE = 6;

const statusStyle = {
  PENDING:
    "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",

  PREPARING:
    "bg-blue-500/20 text-blue-300 border border-blue-500/30",

  READY:
    "bg-purple-500/20 text-purple-300 border border-purple-500/30",

  DELIVERED:
    "bg-green-500/20 text-green-300 border border-green-500/30",

  CANCELLED:
    "bg-red-500/20 text-red-300 border border-red-500/30",
};

export const OrdersPage = () => {

  const {
    orders = [],
    getOrders,
    loading,
  } = useOrderStore();

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [openModal, setOpenModal] =
    useState(false);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [editOrder, setEditOrder] = useState(null);

  useEffect(() => {

    const loadOrders = async () => {
      try {
        await getOrders();
      } catch (error) {
        console.log(error);
      }
    };

    loadOrders();

    // Start realtime polling
    if (typeof window !== 'undefined') {
      try {
        useOrderStore.getState().startRealtime();
      } catch (e) {}
    }

    return () => {
      try {
        useOrderStore.getState().stopRealtime();
      } catch (e) {}
    };

  }, []);

  const filteredOrders = useMemo(() => {

    const value =
      search.toLowerCase();

    return (orders || [])
      .filter(
        (order) =>
          order.status !== "CANCELLED" &&
          order.status !== "DELIVERED"
      )
      .filter(
        (order) =>
          order?.status
            ?.toLowerCase()
            .includes(value) ||
          order?.type
            ?.toLowerCase()
            .includes(value)
      );

  }, [orders, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredOrders.length /
      PAGE_SIZE
    )
  );

  const paginatedOrders =
    useMemo(() => {

      const start =
        (page - 1) *
        PAGE_SIZE;

      return filteredOrders.slice(
        start,
        start + PAGE_SIZE
      );

    }, [filteredOrders, page]);

  return (
    <div className="p-4">

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">

        <div>

          <h1 className="text-3xl font-bold text-accent font-serif">
            Pedidos
          </h1>

          <p className="text-sm text-accent/70 mt-1">
            Gestión de pedidos y estados
          </p>

        </div>

        <button
          onClick={() =>
            setOpenModal(true)
          }
          className="bg-accent px-6 py-2 rounded-xl text-bg-dark font-bold hover:bg-gold-light transition"
        >
          + Nuevo Pedido
        </button>

      </div>

      <div className="bg-bg-card rounded-xl border border-accent/10 p-4 mb-5">

        <input
          value={search}
          onChange={(e) => {
            setSearch(
              e.target.value
            );
            setPage(1);
          }}
          placeholder="Buscar por estado o tipo..."
          className="w-full px-4 py-3 rounded-xl border border-accent/20 bg-bg-page text-text-body"
        />

      </div>

      <div className="bg-bg-card rounded-xl border border-accent/10 overflow-hidden shadow-lg">

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-bg-page/50 border-b border-accent/10">

              <tr>

                <th className="text-left px-6 py-4 uppercase text-xs">
                  Pedido
                </th>

                <th className="text-left px-6 py-4 uppercase text-xs">
                  Platos
                </th>

                <th className="text-left px-6 py-4 uppercase text-xs">
                  Tipo
                </th>

                <th className="text-left px-6 py-4 uppercase text-xs">
                  Estado
                </th>

                <th className="text-right px-6 py-4 uppercase text-xs">
                  Acciones
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan={4}
                    className="py-10"
                  >
                    <div className="flex justify-center">
                      <Spinner />
                    </div>
                  </td>

                </tr>

              ) : paginatedOrders.length === 0 ? (

                <tr>

                  <td
                    colSpan={4}
                    className="text-center py-10 text-text-muted"
                  >
                    No hay pedidos
                  </td>

                </tr>

              ) : (

                paginatedOrders.map((order, index) => (
                  <OrderRow
                    key={order?._id || index}
                    order={order}
                    onEdit={(o) => {
                      setEditOrder(o);
                      setOpenEditModal(true);
                    }}
                  />
                ))

              )}

            </tbody>

          </table>

        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-accent/10 bg-bg-page/20">

          <p className="text-xs text-text-muted">

            Mostrando{" "}

            {paginatedOrders.length}

            {" "}pedidos

          </p>

          <div className="flex gap-2">

            <button
              onClick={() =>
                setPage((prev) =>
                  Math.max(
                    1,
                    prev - 1
                  )
                )
              }
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-accent/20 bg-bg-page disabled:opacity-50"
            >
              Anterior
            </button>

            <span className="px-4 py-2 text-sm font-semibold">
              {page} / {totalPages}
            </span>

            <button
              onClick={() =>
                setPage((prev) =>
                  Math.min(
                    totalPages,
                    prev + 1
                  )
                )
              }
              disabled={
                page === totalPages
              }
              className="px-4 py-2 rounded-lg border border-accent/20 bg-bg-page disabled:opacity-50"
            >
              Siguiente
            </button>

          </div>

        </div>

      </div>

      <CreateOrderModal
        isOpen={openModal}
        onClose={() =>
          setOpenModal(false)
        }
      />

      <EditOrderModal
        isOpen={openEditModal}
        onClose={() => setOpenEditModal(false)}
        order={editOrder}
      />

    </div>
  );
};

const OrderRow = ({ order, onEdit }) => {
  const { updateStatus, cancelOrder } = useOrderStore();

  if (!order) return null;

  const handleCancel = async () => {
    const ok = window.confirm("¿Confirmar cancelar el pedido?");
    if (!ok) return;
    try {
      await cancelOrder(order._id);
    } catch (e) {}
  };

  return (
    <tr className="border-b border-accent/10 hover:bg-bg-page/20 transition">

      <td className="px-6 py-4 font-medium">#{order?._id?.slice(-6) || "----"}</td>

      <td className="px-6 py-4">
        {(order?.items || []).map((it) => it?.name).filter(Boolean).join(", ") || "Sin platos"}
      </td>

      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span>{order?.type || "Sin tipo"}</span>

          {order?.tableId?.number && (
            <span className="text-xs text-text-muted">
              Mesa #{order.tableId.number}
            </span>
          )}
        </div>
      </td>

      <td className="px-6 py-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            statusStyle[order?.status] || "bg-gray-500/20 text-gray-300"
          }`}
        >
          {order?.status || "SIN ESTADO"}
        </span>
      </td>

      <td className="px-6 py-4">
        <div className="flex flex-wrap items-center gap-3 md:justify-end">

          <button
            onClick={() => onEdit && onEdit(order)}
            className="inline-flex items-center gap-2 rounded-lg bg-bg-page/50 hover:bg-accent/10 border border-accent/20 px-4 py-2 text-xs font-semibold text-accent transition-colors"
          >
            Editar
          </button>

          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-2 rounded-lg border border-error/30 bg-error/5 hover:bg-error/10 px-4 py-2 text-xs font-semibold text-error transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={() => updateStatus(order?._id, "PREPARING")}
            className="inline-flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 px-4 py-2 text-xs font-semibold text-yellow-600 transition-colors"
          >
            Preparando
          </button>

          <button
            onClick={() => updateStatus(order?._id, "READY")}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 text-xs font-semibold text-blue-600 transition-colors"
          >
            Listo
          </button>

          <button
            onClick={() => updateStatus(order?._id, "DELIVERED")}
            className="inline-flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 px-4 py-2 text-xs font-semibold text-green-600 transition-colors"
          >
            Entregado
          </button>

        </div>
      </td>

    </tr>
  );
};*/