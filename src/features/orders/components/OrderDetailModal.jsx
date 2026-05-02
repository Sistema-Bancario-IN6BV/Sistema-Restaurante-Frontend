import { useState } from "react"
import { Spinner } from "../../../shared/components/layouts/Spinner.jsx"

export const OrderDetailModal = ({
    isOpen,
    onClose,
    order,
    onUpdateStatus,
    loading
}) => {

    if (!isOpen || !order) return null

    const [status, setStatus] = useState(order.status)

    const hasChanges = status !== order.status

    const handleSave = async () => {
        if (!hasChanges) {
            onClose()
            return
        }

        await onUpdateStatus(order.id, status)
    }

    const total = order.items?.reduce(
        (acc, item) => acc + item.quantity * item.unitPrice,
        0
    )

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-3 sm:px-4">
            <div className="bg-bg-dark rounded-2xl shadow-2xl border border-accent/20 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* HEADER */}
                <div className="p-4 sm:p-5 bg-accent text-bg-dark">
                    <h2 className="text-xl sm:text-2xl font-bold">
                        Detalle del Pedido
                    </h2>
                    <p className="text-sm font-semibold mt-1">
                        ID: {order.id}
                    </p>
                </div>

                {/* BODY */}
                <div className="p-5 space-y-4 overflow-y-auto">

                    {/* INFO GENERAL */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                        <div className="bg-bg-page p-3 rounded-lg">
                            <p className="text-xs text-text-muted">Tipo</p>
                            <p className="font-bold">{order.type}</p>
                        </div>

                        <div className="bg-bg-page p-3 rounded-lg">
                            <p className="text-xs text-text-muted">Estado</p>
                            <p className="font-bold">{order.status}</p>
                        </div>

                        <div className="bg-bg-page p-3 rounded-lg">
                            <p className="text-xs text-text-muted">Total</p>
                            <p className="font-bold">Q{total}</p>
                        </div>

                        <div className="bg-bg-page p-3 rounded-lg">
                            <p className="text-xs text-text-muted">Fecha</p>
                            <p className="font-bold">
                                {new Date(order.createdAt).toLocaleString()}
                            </p>
                        </div>

                    </div>

                    {/* ITEMS */}
                    <div>
                        <h3 className="font-bold mb-2">Platos</h3>

                        <div className="space-y-2">
                            {order.items?.map((item, i) => (
                                <div
                                    key={i}
                                    className="flex justify-between bg-bg-page p-3 rounded-lg"
                                >
                                    <div>
                                        <p className="font-semibold">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-text-muted">
                                            Cantidad: {item.quantity}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-bold">
                                            Q{item.unitPrice}
                                        </p>
                                        <p className="text-xs text-text-muted">
                                            Subtotal: Q{item.quantity * item.unitPrice}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CAMBIAR ESTADO */}
                    <div>
                        <label className="block text-sm font-bold mb-2">
                            Cambiar estado
                        </label>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full p-3 rounded-lg bg-bg-page border border-accent/20"
                        >
                            <option value="PENDING">PENDING</option>
                            <option value="PREPARING">PREPARING</option>
                            <option value="READY">READY</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                        </select>
                    </div>

                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-3 p-4 border-t border-accent/10">

                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg bg-bg-page border"
                    >
                        Cerrar
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={loading || !hasChanges}
                        className="px-6 py-2 rounded-lg bg-accent text-bg-dark flex items-center gap-2"
                    >
                        {loading ? <Spinner small /> : "Guardar"}
                    </button>

                </div>
            </div>
        </div>
    )
}