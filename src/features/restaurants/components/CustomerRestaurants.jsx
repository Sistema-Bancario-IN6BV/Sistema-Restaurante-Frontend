import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRestaurants } from "../../../shared/api/restaurants.js";
import { Spinner } from "../../../shared/components/layouts/Spinner.jsx";

import { resolveImageUrl } from "../../../shared/utils/imageUrl.js";

const restaurantImageUrl = (path) => {
    if (!path) return null;
    const raw = typeof path === "object" ? (path.secure_url || path.url || path.path || path.location || path.filename) : String(path).trim();
    if (!raw) return null;
    return resolveImageUrl(raw);
};

export const CustomerRestaurants = () => {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const resp = await getRestaurants();
                const data = resp?.data ?? resp;
                const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
                setRestaurants(list);
            } catch (err) {
                setError(err.response?.data?.message || err.message || "Error al cargar restaurantes");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="p-6"><Spinner /></div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Restaurantes</h1>
            {error && <div className="text-error mb-4">{error}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {restaurants.map((r) => {
                    const imageUrl = restaurantImageUrl(r.photo || r.image);
                    return (
                        <div key={r._id || r.id} className="bg-white rounded-lg shadow p-4 flex flex-col">
                            <div className="h-40 bg-gray-100 rounded overflow-hidden mb-3">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={r.name || 'Imagen'}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            console.debug('Image load failed for customer view', { raw: r.photo || r.image, resolved: imageUrl });
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-text-muted">Sin imagen</div>
                                )}
                            </div>

                            <div className="flex-1">
                                <h2 className="font-semibold text-lg">{r.name}</h2>
                                <p className="text-sm text-text-muted">{r.category}</p>
                                <p className="text-sm mt-2 text-text-body">{Array.isArray(r.tags) ? r.tags.join(', ') : (r.tags || '')}</p>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <button className="flex-1 bg-accent text-bg-dark py-2 rounded" onClick={() => setSelected(r)}>Ver informacion</button>
                                <button className="flex-1 bg-gray-300 text-gray-700 py-2 rounded cursor-not-allowed" disabled title="Pendiente de implementacion">Reservar</button>
                                <button className="flex-1 bg-bg-dark text-accent py-2 rounded" onClick={() => navigate(`/customer/menu/${r._id || r.id}`)}>Ver menu</button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selected && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold">{selected.name}</h3>
                            <button className="text-gray-500" onClick={() => setSelected(null)}>Cerrar</button>
                        </div>
                        <div className="mt-4">
                            <p><strong>Categoría:</strong> {selected.category}</p>
                            <p className="mt-2"><strong>Dirección:</strong> {selected.address?.street || ''} {selected.address?.city ? `, ${selected.address.city}` : ''}</p>
                            <p className="mt-2"><strong>Teléfono:</strong> {selected.phone || '-'}</p>
                            <p className="mt-2"><strong>Tags:</strong> {Array.isArray(selected.tags) ? selected.tags.join(', ') : selected.tags}</p>
                        </div>
                        <div className="mt-6 text-right">
                            <button className="bg-accent text-bg-dark px-4 py-2 rounded" onClick={() => setSelected(null)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerRestaurants;
