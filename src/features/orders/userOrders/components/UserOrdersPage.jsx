import {
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";

import { Spinner } from "../../../../shared/components/layouts/Spinner.jsx";

import { useUserOrderStore } from "../../userOrders/store/useUserOrderStore.js";

import {
  createInvoice as createInvoiceRequest,
  getMyInvoices as getMyInvoicesRequest,
  getInvoiceByOrder,
} from "../../../../shared/api/invoices";
import { createReview as createReviewRequest } from '../../../../shared/api/reviews';

import { getMenuItemById } from "../../../../shared/api/menuItems";

import {
  showSuccess,
  showError,
} from "../../../../shared/utils/toast";

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
  } = useUserOrderStore();

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [
    invoiceOrderIds,
    setInvoiceOrderIds,
  ] = useState(new Set());

  useEffect(() => {
    const loadData = async () => {
      try {
        await getOrders();

        const inv =
          await getMyInvoicesRequest();

        const list =
          inv?.data?.data ||
          inv?.data ||
          inv ||
          [];

        const ids = new Set(
          (list || []).map((i) =>
            String(
              i?.orderId?._id ||
                i?.order?._id ||
                i?.orderId ||
                i?.order ||
                ""
            )
          )
        );

        setInvoiceOrderIds(ids);
      } catch (error) {
        console.log(error);
      }
    };

    loadData();
  }, []);

  const filteredOrders =
    useMemo(() => {
      const value =
        search.toLowerCase();

      return (
        orders || []
      ).filter((order) => {
        return (
          (order?.status || "")
            .toLowerCase()
            .includes(value) ||

          (order?.type || "")
            .toLowerCase()
            .includes(value) ||

          (
            order?.restaurantId
              ?.name || ""
          )
            .toLowerCase()
            .includes(value)
        );
      });
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
            Gestión de pedidos y
            estados
          </p>
        </div>
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
          placeholder="Buscar por estado o restaurante..."
          className="w-full px-4 py-3 rounded-xl border border-accent/20 bg-bg-page text-text-body"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-10 flex justify-center">
            <Spinner />
          </div>
        ) : paginatedOrders.length ===
          0 ? (
          <div className="col-span-full text-center py-10 text-text-muted">
            No hay pedidos
          </div>
        ) : (
          paginatedOrders.map(
            (order) => (
              <OrderCard
                key={order._id}
                order={order}
                invoiceOrderIds={
                  invoiceOrderIds
                }
                setInvoiceOrderIds={
                  setInvoiceOrderIds
                }
              />
            )
          )
        )}
      </div>
    </div>
  );
};

const OrderCard = ({
  order,
  invoiceOrderIds,
  setInvoiceOrderIds,
}) => {
  const {
    deleteOrder,
    getOrders,
  } = useUserOrderStore();

  const [imageUrl, setImageUrl] =
    useState(null);

  const ref = useRef(null);

  const [visible, setVisible] =
    useState(false);

  useEffect(() => {
    const el = ref.current;

    if (!el) return;

    const obs =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((e) =>
            setVisible(
              e.isIntersecting
            )
          );
        },
        {
          threshold: 0.1,
        }
      );

    obs.observe(el);

    return () =>
      obs.disconnect();
  }, []);

  useEffect(() => {
    const loadImage = async () => {
      try {
        if (!visible) return;

        const first =
          (
            order?.items || []
          )[0];

        const localRaw =
          first?.image ||
          first?.photo ||
          first?.imageUrl;

        if (localRaw) {
          if (
            String(
              localRaw
            ).startsWith(
              "http"
            )
          ) {
            setImageUrl(
              localRaw
            );
          } else {
            const base =
              import.meta.env
                .VITE_CLOUDINARY_BASE_URL ||
              "https://res.cloudinary.com/db5rnorif/image/upload/";

            setImageUrl(
              `${base}${String(
                localRaw
              ).replace(
                /^\/+/,
                ""
              )}`
            );
          }

          return;
        }

        const menuItemId =
          first?.menuItemId ||
          first?.menuItem ||
          first?._id;

        if (!menuItemId) return;

        const res =
          await getMenuItemById(
            menuItemId
          );

        const raw =
          res?.image ||
          res?.photo ||
          res?.imageUrl;

        if (!raw) return;

        if (
          String(raw).startsWith(
            "http"
          )
        ) {
          setImageUrl(raw);
        } else {
          const base =
            import.meta.env
              .VITE_CLOUDINARY_BASE_URL ||
            "https://res.cloudinary.com/db5rnorif/image/upload/";

          setImageUrl(
            `${base}${String(
              raw
            ).replace(
              /^\/+/,
              ""
            )}`
          );
        }
      } catch (e) {
        console.log(e);
      }
    };

    loadImage();
  }, [order, visible]);

  const total = (
    order?.items || []
  ).reduce(
    (s, it) =>
      s +
      (it.price ||
        it.unitPrice ||
        0) *
        (it.quantity || 1),
    0
  );

  const handleCancel =
    async () => {
      const ok =
        window.confirm(
          "¿Confirmar eliminar el pedido?"
        );

      if (!ok) return;

      try {
        const res =
          await deleteOrder(
            order._id
          );

        if (res?.remote) {
          await getOrders();
        }

        showSuccess(
          "Pedido eliminado"
        );
      } catch (e) {
        showError(
          "Error al eliminar pedido"
        );
      }
    };

const handleGenerateInvoice =
  async () => {
    try {
      await createInvoiceRequest(
        order._id
      );

      showSuccess(
        "Factura generada"
      );

      setInvoiceOrderIds(
        (prev) =>
          new Set([
            ...prev,
            String(order._id),
          ])
      );

      await getOrders();
    } catch (e) {
      console.error(
        "Factura error:",
        e?.response || e
      );

      const serverMsg =
        e?.response?.data?.message ||
        e?.response?.data ||
        e.message;

      const status = e?.response?.status;

      
      if (status === 409) {
        try {
          const invRes = await getInvoiceByOrder(order._id);
          const invoice = invRes?.data?.data || invRes?.data || invRes;
          console.info('Factura existente:', invoice);
          showSuccess('Factura ya existente. Abriendo vista de facturas...');
          
          window.location.href = '/customer/invoices';
          return;
        } catch (inner) {
          console.error('Error fetching existing invoice:', inner?.response || inner);
          showError(serverMsg || 'Error al generar factura');
          return;
        }
      }

      showError(serverMsg || 'Error al generar factura');
    }
  };

  return (
    <div
      ref={ref}
      className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100"
    >
      <div className="h-44 bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Pedido"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Sin imagen
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold">
          {order?.restaurantId
            ?.name ||
            `Pedido #${order?._id?.slice(
              -6
            )}`}
        </h3>

        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
          {(
            order?.items || []
          )
            .map(
              (it) => it.name
            )
            .join(", ")}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-yellow-600">
              Q{" "}
              {total.toFixed(2)}
            </div>

            <div className="mt-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  statusStyle[
                    order?.status
                  ] ||
                  "bg-gray-500/20 text-gray-300"
                }`}
              >
                {order?.status}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {order?.status !==
              "CANCELLED" &&
              order?.status !==
                "DELIVERED" && (
                <button
                  onClick={
                    handleCancel
                  }
                  className="px-4 py-2 rounded-xl border text-sm text-error"
                >
                  Cancelar
                </button>
              )}

            {order?.status ===
              "DELIVERED" && (
              <div className="flex gap-2">
                <button
                  onClick={
                    handleGenerateInvoice
                  }
                  className="px-4 py-2 rounded-xl bg-accent text-bg-dark"
                >
                  Generar factura
                </button>

                <button
                  onClick={async () => {
                    try {
                      const rawRating = window.prompt('Calificación (1-5):');
                      if (!rawRating) return;
                      const rating = Math.max(1, Math.min(5, Number(rawRating)));
                      if (!rating || rating < 1 || rating > 5) {
                        alert('Calificación inválida');
                        return;
                      }
                      const comment = window.prompt('Comentario (opcional):') || '';

                      const payload = {
                        orderId: order._id,
                        restaurantId: order.restaurantId?._id || order.restaurantId,
                        rating,
                        comment,
                      };

                      await createReviewRequest(payload);
                      showSuccess('Gracias por calificar el restaurante');
                    } catch (e) {
                      const status = e?.response?.status;
                      if (status === 409) {
                        showError('Ya existe una reseña para esta orden');
                      } else {
                        showError('Error al enviar reseña');
                      }
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-green-600 text-white"
                >
                  Calificar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;