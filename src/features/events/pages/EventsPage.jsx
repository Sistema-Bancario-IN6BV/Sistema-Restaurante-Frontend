import React, { useEffect, useState } from 'react';
import { useEventsStore } from '../store/useEventsStore';
import { Spinner } from '../../../shared/components/layouts/Spinner.jsx';
import { EventCard } from '../components/EventCard';

export const EventsPage = () => {
  const { events, loading, getEvents } = useEventsStore();

  const [search, setSearch] = useState('');

  useEffect(() => {
    getEvents();
  }, []);

  // Debounce para búsqueda por nombre
  useEffect(() => {
    const id = setTimeout(() => {
      getEvents(search ? { q: search } : {});
    }, 400);

    return () => clearTimeout(id);
  }, [search, getEvents]);

  return (
    <div className="px-6 md:px-10 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-[#C8860A]">
          Eventos Especiales
        </h1>

        <p className="text-sm text-gray-600">
          Descubre y participa en experiencias únicas
        </p>
      </div>

      <div className="mb-6 flex gap-3 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar evento por nombre..."
          className="w-full md:w-1/2 px-4 py-3 border rounded-lg bg-bg-page focus:outline-none focus:border-accent"
        />
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {(events || []).map((ev) => (
            <EventCard key={ev._id} event={ev} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;