import { useState } from "react"
import { Spinner } from "../../../shared/components/layouts/Spinner.jsx"

export const CreateOrderModal = ({ isOpen, onClose, onCreate }) => {
    const [type, setType] = useState("TAKEAWAY")
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const data = { type, total: Number(total), items: [] }
            await onCreate(data)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-3 sm:px-4">
            <form onSubmit={handleSubmit} className="bg-bg-dark rounded-2xl shadow-2xl border border-accent/20 w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-3">Crear Pedido</h2>

                <label className="block text-sm font-medium mb-2">Tipo</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-3 rounded-lg mb-4 bg-bg-page border border-accent/10">
                    <option value="TAKEAWAY">TAKEAWAY</option>
                    <option value="DINING">DINING</option>
                    <option value="DELIVERY">DELIVERY</option>
                </select>

                <label className="block text-sm font-medium mb-2">Total</label>
                <input type="number" value={total} onChange={(e) => setTotal(e.target.value)} className="w-full p-3 rounded-lg mb-4 bg-bg-page border border-accent/10" />

                <div className="flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-bg-page border">Cancelar</button>
                    <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-accent text-bg-dark flex items-center gap-2">
                        {loading ? <Spinner small /> : "Crear"}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default CreateOrderModal
