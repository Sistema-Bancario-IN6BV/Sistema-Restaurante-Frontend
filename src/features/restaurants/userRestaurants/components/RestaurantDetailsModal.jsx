import {
    XMarkIcon,
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon,
    ClockIcon,
    StarIcon
} from "@heroicons/react/24/outline";

export const RestaurantDetailsModal = ({
    isOpen,
    onClose,
    restaurant
}) => {

    if (!isOpen || !restaurant) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">

            <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">

                {/* IMAGE */}
                <div className="relative h-72 w-full bg-gray-100">

                    {restaurant.photo ? (
                        <img
                            src={restaurant.photo}
                            alt={restaurant.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                            Sin imagen
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-full bg-white/90 p-2 shadow-md hover:bg-white"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>

                    <div className="absolute bottom-4 left-4">
                        <span className="rounded-full bg-yellow-400 px-4 py-1 text-sm font-bold text-black shadow">
                            {restaurant.category}
                        </span>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="p-6">

                    <div className="flex items-start justify-between gap-4">

                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">
                                {restaurant.name}
                            </h2>

                            <div className="mt-2 flex items-center gap-2 text-gray-500">
                                <MapPinIcon className="h-5 w-5" />

                                <span>
                                    {restaurant.address?.street},{" "}
                                    {restaurant.address?.city}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-2xl bg-yellow-50 px-4 py-2">

                            <StarIcon className="h-5 w-5 text-yellow-500" />

                            <div>
                                <p className="text-lg font-bold text-yellow-600">
                                    {restaurant.rating?.average || 0}
                                </p>

                                <p className="text-xs text-gray-500">
                                    {restaurant.rating?.count || 0} reseñas
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* INFO */}
                    <div className="mt-6 grid gap-4 md:grid-cols-2">

                        <div className="rounded-2xl border border-gray-200 p-4">

                            <div className="flex items-center gap-2 text-gray-700">
                                <PhoneIcon className="h-5 w-5 text-yellow-500" />

                                <span className="font-semibold">
                                    Teléfono
                                </span>
                            </div>

                            <p className="mt-2 text-gray-500">
                                {restaurant.phone || "No disponible"}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-gray-200 p-4">

                            <div className="flex items-center gap-2 text-gray-700">
                                <EnvelopeIcon className="h-5 w-5 text-yellow-500" />

                                <span className="font-semibold">
                                    Correo
                                </span>
                            </div>

                            <p className="mt-2 text-gray-500">
                                {restaurant.email || "No disponible"}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-gray-200 p-4">

                            <div className="flex items-center gap-2 text-gray-700">
                                <ClockIcon className="h-5 w-5 text-yellow-500" />

                                <span className="font-semibold">
                                    Horario
                                </span>
                            </div>

                            <p className="mt-2 text-gray-500">
                                {restaurant.schedule || "No disponible"}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-gray-200 p-4">

                            <div className="flex items-center gap-2 text-gray-700">
                                <StarIcon className="h-5 w-5 text-yellow-500" />

                                <span className="font-semibold">
                                    Precio promedio
                                </span>
                            </div>

                            <p className="mt-2 text-gray-500">
                                Q {restaurant.avgPrice || 0}
                            </p>
                        </div>
                    </div>

                    {/* TAGS */}
                    {restaurant.tags?.length > 0 && (

                        <div className="mt-6">

                            <h3 className="mb-3 text-lg font-bold text-gray-800">
                                Especialidades
                            </h3>

                            <div className="flex flex-wrap gap-2">

                                {restaurant.tags.map((tag) => (

                                    <span
                                        key={tag}
                                        className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};