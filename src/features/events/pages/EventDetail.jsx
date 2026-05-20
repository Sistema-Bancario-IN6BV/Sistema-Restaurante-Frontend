import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as eventsApi from '../../../shared/api/events.js';
import { Spinner } from '../../../shared/components/layouts/Spinner.jsx';
import { showError, showSuccess } from '../../../shared/utils/toast.js';

export const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await eventsApi.getEventById(id);
        const payload = res?.data ?? res;
        setEvent(payload?.data ?? payload);
      } catch (e) {
        showError('No se pudo obtener el evento');
        navigate('/customer/events');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleRegister = async () => {
    setError(null);
    setActionLoading(true);
    try {
      const res = await eventsApi.registerToEvent(id);
      showSuccess(res?.data?.message || 'Inscripción exitosa');
      
      const r = await eventsApi.getEventById(id);
      const payload = r?.data ?? r;
      setEvent(payload?.data ?? payload);
    } catch (e) {
      const resp = e?.response?.data;
      let msg = e?.message || 'Error al inscribirse';
      if (resp) {
        if (Array.isArray(resp.errors) && resp.errors.length > 0) {
          msg = resp.errors.map((er) => (er.field ? `${er.field}: ${er.message}` : er.message)).join('; ');
        } else if (resp.message) {
          msg = resp.message;
        }
      }
      setError(msg);
      showError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><Spinner /></div>;

  if (!event) return null;

  return (
    <div className="px-6 md:px-10 py-8">
      <button onClick={() => navigate('/customer/events')} className="mb-4 px-3 py-2 rounded border">Volver</button>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="h-64 w-full relative">
          {event.coverImage ? (
            <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute left-8 bottom-8 text-white">
            <h1 className="text-3xl font-bold drop-shadow">{event.title}</h1>
            <p className="text-sm opacity-90">{event.restaurantId?.name}</p>
          </div>
        </div>

        <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-2">Descripción</h2>
            <p className="text-gray-700 mb-6">{event.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Fecha</div>
                <div className="font-semibold">{new Date(event.date).toLocaleDateString()}</div>
                <div className="text-sm text-gray-600">{event.startTime} - {event.endTime}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Capacidad</div>
                <div className="font-semibold">{event.registeredCount || 0} / {event.capacity}</div>
                <div className="text-sm text-gray-600">{event.availableSpots > 0 ? `${event.availableSpots} disponibles` : 'Lleno'}</div>
              </div>
            </div>
          </div>

          <aside className="bg-gray-50 rounded-xl p-4 flex flex-col gap-4">
            <div>
              <div className="text-xs text-gray-500">Precio</div>
              <div className="text-2xl font-bold">Q {event.price?.toFixed(2) || '0.00'}</div>
            </div>

            <button disabled={actionLoading} onClick={handleRegister} className="mt-auto px-4 py-3 rounded-md bg-[#C8860A] text-white font-semibold hover:bg-[#b07008]">{actionLoading ? 'Procesando...' : 'Inscribirse'}</button>

            {error && <div className="text-sm text-red-600">{error}</div>}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
