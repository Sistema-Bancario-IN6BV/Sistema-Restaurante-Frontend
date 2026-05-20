import { useEffect } from "react";

import { useParams } from "react-router-dom";

import { Spinner } from "../../../../../shared/components/layouts/Spinner.jsx";

import { useUserMenuItemsStore } from "../store/useUserMenuItemsStore";

import { UserMenuItemCard } from "../components/UserMenuItemCard";

export const UserMenuItems = () => {

    const { restaurantId } = useParams();

    const {
        items,
        loading,
        getMenuItems
    } = useUserMenuItemsStore();

    useEffect(() => {

        if (restaurantId) {
            getMenuItems(restaurantId);
        }

    }, [restaurantId]);

    return (

        <div className="px-6 md:px-10 py-8">

            <div className="mb-8">

                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-600">
                    Menú
                </p>

                <h1 className="mt-2 text-4xl font-bold text-gray-800">
                    Explora los Platos
                </h1>

            </div>

            {loading && (

                <div className="py-20 flex justify-center">
                    <Spinner />
                </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                {[...items]
                    .sort(() => Math.random() - 0.5)
                    .map((item) => (

                        <UserMenuItemCard
                            key={item._id}
                            item={item}
                        />
                    ))}

            </div>

        </div>
    );
};