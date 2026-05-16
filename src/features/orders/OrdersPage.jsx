import { useEffect, useState } from "react"
import { useOrderStore } from "../orders/store/useOrderStore"
import { Spinner } from "../../shared/components/layouts/Spinner.jsx"
import { showError, showSuccess } from "../../shared/utils/toast.js"
import { CreateOrderModal } from "./components/CreateOrderModal.jsx"
import { OrderDetailModal } from "./components/OrderDetailModal.jsx"

export const OrdersPage = () => {

    const {
        orders,
        fetchOrders,
        createOrder,
        updateOrderStatus,
        loading,
        error
    } = useOrderStore()

    const [openModal, setOpenModal] = useState(false)

    const [openDetail, setOpenDetail] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(null)

    useEffect(() => {
        fetchOrders()
    }, [])

    useEffect(() => {
        if (error) showError(error)
    }, [error])

    // 👉 Crear pedido
    const handleCreate = async (data) => {
        const res = await createOrder(data)

        if (res.success) {
            showSuccess("Pedido creado")
            setOpenModal(false)
        } else {
            showError(res.error)
        }
    }

    // 👉 Abrir modal detalle
    const handleOpenDetail = (order) => {
        setSelectedOrder(order)
        setOpenDetail(true)
    }

    // 👉 Guardar estado desde modal
    const handleUpdateStatus = async (orderId, status) => {
        const res = await updateOrderStatus(orderId, status)

        if (res.success) {
            showSuccess("Estado actualizado")
            setOpenDetail(false)
            setSelectedOrder(null)
        } else {
            showError("No se pudo actualizar")
        }
    }

    return (
        <div className="p-4">

            {/* HEADER */}
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold text-accent">Pedidos</h1>

                <button
                    onClick={() => setOpenModal(true)}
                    className="bg-accent px-4 py-2 rounded-lg font-bold"
                >
                    + Nuevo Pedido
                </button>
            </div>

            {/* TABLA */}
            {loading ? <Spinner /> : (
                <div className="bg-bg-card rounded-xl overflow-hidden border border-accent/10">
                    <table className="w-full text-sm">

                        <thead className="bg-bg-page border-b border-accent/10">
                            <tr>
                                <th className="px-4 py-3 text-left">ID</th>
                                <th className="px-4 py-3 text-left">Tipo</th>
                                <th className="px-4 py-3 text-left">Total</th>
                                <th className="px-4 py-3 text-left">Estado</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-6 text-text-muted">
                                        No hay pedidos
                                    </td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id} className="border-b border-accent/10">

                                        <td className="px-4 py-3">{order.id}</td>
                                        <td className="px-4 py-3">{order.type}</td>
                                        <td className="px-4 py-3">Q{order.total}</td>
                                        <td className="px-4 py-3">{order.status}</td>

                                        <td className="px-4 py-3 text-right flex gap-2 justify-end">

                                            {/* VER DETALLE */}
                                            <button
                                                onClick={() => handleOpenDetail(order)}
                                                className="px-3 py-1 rounded bg-bg-page border border-accent/20 text-accent text-xs"
                                            >
                                                Ver / Editar
                                            </button>

                                            {/* COMPLETAR RÁPIDO */}
                                            <button
                                                onClick={() => handleUpdateStatus(order.id, "DELIVERED")}
                                                className="px-3 py-1 rounded bg-success/20 text-success text-xs"
                                            >
                                                Completar
                                            </button>

                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>

                    </table>
                </div>
            )}

            {/* MODAL CREAR */}
            <CreateOrderModal
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                onCreate={handleCreate}
            />

            {/* MODAL DETALLE */}
            <OrderDetailModal
                isOpen={openDetail}
                onClose={() => {
                    setOpenDetail(false)
                    setSelectedOrder(null)
                }}
                order={selectedOrder}
                onUpdateStatus={handleUpdateStatus}
                loading={loading}
            />

        </div>
    )
}