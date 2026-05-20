import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventsStore } from '../store/useEventsStore';
import { showSuccess, showError } from '../../../shared/utils/toast';

export const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const { register, unregister } = useEventsStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registered, setRegistered] = useState(false);

  
  useEffect(() => {
    if (event?.isRegistered || (event?.attendees && Array.isArray(event.attendees) && event.attendees.includes?.(event?.currentUserId))) {
      setRegistered(true);
    }
  }, [event]);

  const handleRegister = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await register(event._id);
      setRegistered(true);
      showSuccess(res?.data?.message || 'Inscripción exitosa');
    } catch (e) {
      
      const resp = e?.response?.data;
      let msg = e?.message || 'Error al inscribirse';
      if (resp) {
        if (Array.isArray(resp.errors) && resp.errors.length > 0) {
          msg = resp.errors.map((er) => (er.field ? `${er.field}: ${er.message}` : er.message)).join('; ');
        } else if (resp.message) {
          msg = resp.message;
        } else if (resp.error) {
          msg = resp.error;
        }
      }
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await unregister(event._id);
      setRegistered(false);
      showSuccess(res?.data?.message || 'Se anuló la inscripción');
    } catch (e) {
      const resp = e?.response?.data;
      let msg = e?.message || 'Error al anular inscripción';
      if (resp) {
        if (Array.isArray(resp.errors) && resp.errors.length > 0) {
          msg = resp.errors.map((er) => (er.field ? `${er.field}: ${er.message}` : er.message)).join('; ');
        } else if (resp.message) {
          msg = resp.message;
        } else if (resp.error) {
          msg = resp.error;
        }
      }
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-200">
      <div className="relative h-48 w-full">
        {event.coverImage ? (
          <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">Sin imagen</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute left-4 bottom-4 text-white">
          <h3 className="font-semibold text-lg drop-shadow">{event.title}</h3>
          <p className="text-sm opacity-90">{event.restaurantId?.name}</p>
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">{event.description}</p>

        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()} · {event.startTime}</div>
            <div className="text-sm text-gray-800 font-semibold">Q {event.price?.toFixed(2) || '0.00'}</div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button onClick={() => navigate(`/customer/events/${event._id}`)} className="px-4 py-2 rounded-md border border-gray-200 text-sm hover:shadow">Ver</button>

            {!registered ? (
              <button onClick={handleRegister} disabled={loading} className="px-4 py-2 rounded-md bg-[#C8860A] text-white font-semibold text-sm hover:bg-[#b07008]">{loading ? 'Inscribiendo...' : 'Inscribirse'}</button>
            ) : (
              <button onClick={handleUnregister} disabled={loading} className="px-4 py-2 rounded-md border border-red-200 text-red-600 text-sm">{loading ? 'Procesando...' : 'Anular inscripción'}</button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-3 text-sm text-red-600">{error}</div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
