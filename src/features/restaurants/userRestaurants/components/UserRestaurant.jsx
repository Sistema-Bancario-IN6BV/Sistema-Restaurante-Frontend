import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    MapPinIcon
} from "@heroicons/react/24/outline";

import {
    useUserRestaurantStore
} from "../store/useUserRestaurantStore";

import { CreateUserRestaurantModal } from "./createUserRestaurantModal";
import { RestaurantDetailsModal } from "./RestaurantDetailsModal";

export const UserRestaurant = () => {

    const navigate = useNavigate();

    const {
        restaurants,
        loading,
        getRestaurants
    } = useUserRestaurantStore();

    const [openModal, setOpenModal] = useState(false);

    const [selectedRestaurant, setSelectedRestaurant] = useState(null);

    const [openDetails, setOpenDetails] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        getRestaurants();
    }, []);

    const handleOpenModal = (restaurant) => {
        setSelectedRestaurant(restaurant);
        setOpenModal(true);
    };

    const handleOpenDetails = (restaurant) => {
        setSelectedRestaurant(restaurant);
        setOpenDetails(true);
    };

    return (
        <div className="px-6 md:px-10 py-8">

            {/* HEADER */}
            <div className="mb-8">

                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-600">
                    Restaurantes
                </p>

                <h1 className="mt-2 text-4xl font-bold text-gray-800">
                    Explora Restaurantes
                </h1>
            </div>

            {/* LOADING */}
            {loading && (
                <div className="py-20 text-center">
                    Cargando...
                </div>
            )}

            {/* SEARCH */}
            <div className="mb-4">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar restaurante por nombre..."
                    className="w-full px-4 py-3 rounded-xl border border-accent/20 bg-bg-page text-text-body"
                />
            </div>

            {/* LIST */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                {restaurants
                    .filter(r => !search || (r.name || '').toLowerCase().includes(search.toLowerCase()))
                    .map((restaurant) => (

                    <div
                        key={restaurant._id}
                        className="overflow-hidden rounded-3xl bg-white shadow-lg border border-gray-100"
                    >

                        {/* IMAGE */}
                        <div className="relative h-52 bg-gray-100">

                            {restaurant.photo ? (
                                <img
                                    src={restaurant.photo}
                                    alt={restaurant.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-gray-400">
                                    Sin portada
                                </div>
                            )}

                            {/* CATEGORY */}
                            <div className="absolute left-4 top-4">
                                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold uppercase text-yellow-700">
                                    {restaurant.category}
                                </span>
                            </div>

                            {/* STATUS */}
                            <div className="absolute right-4 top-4">
                                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                                    restaurant.active
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                }`}>
                                    {restaurant.active
                                        ? "Activo"
                                        : "Inactivo"}
                                </span>
                            </div>
                        </div>

                        {/* CONTENT */}
                        <div className="p-5">

                            <h2 className="text-lg font-bold text-gray-800">
                                {restaurant.name}
                            </h2>

                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                                <MapPinIcon className="h-4 w-4" />
                                {restaurant.address?.city}
                            </div>

                            {/* BUTTONS */}
                            <div className="mt-5 flex gap-2">

                                <button
                                    onClick={() => handleOpenDetails(restaurant)}
                                    className="flex-1 rounded-xl border border-yellow-500 px-3 py-2 text-sm font-semibold text-yellow-600 hover:bg-yellow-50 transition"
                                >
                                    Ver Detalles
                                </button>

                                <button
                                    onClick={() => navigate(`/customer/menu/${restaurant._id}`)}
                                    className="flex-1 rounded-xl border border-yellow-500 px-3 py-2 text-sm font-semibold text-yellow-600 hover:bg-yellow-50 transition"
                                >
                                    Ir a Menú
                                </button>

                                <button
                                    onClick={() => handleOpenModal(restaurant)}
                                    className="flex-1 rounded-xl bg-yellow-500 px-3 py-2 text-sm font-bold text-white hover:bg-yellow-600 transition"
                                >
                                    Reservar
                                </button>

                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <CreateUserRestaurantModal
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                restaurant={selectedRestaurant}
            />

            <RestaurantDetailsModal
                isOpen={openDetails}
                onClose={() => setOpenDetails(false)}
                restaurant={selectedRestaurant}
            />
        </div>
    );
};