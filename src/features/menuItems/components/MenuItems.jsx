import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { useAuthStore } from "../../../features/auth/store/authStore.js";

import { Spinner } from "../../../shared/components/layouts/Spinner.jsx";

import {
	showError,
	showSuccess,
} from "../../../shared/utils/toast.js";

import { axiosAdmin } from "../../../shared/api/api.js";

import {
	getAllMenuItems,
	deleteMenuItem,
	createMenuItem,
	updateMenuItem,
	uploadMenuItemPhoto,
} from "../../../shared/api/menuItems.js";

import { CreateMenuItemModal } from "./CreateMenuItemModal.jsx";
import { MenuItemDetailModal } from "./MenuItemDetailModal.jsx";

import {
	MENU_TYPES,
	MENU_TYPE_LABELS,
} from "../../../shared/constants/menuTypes";

const PAGE_SIZE = 8;

const typeColors = {
	STARTER:
		"bg-purple-500/20 text-purple-300 border border-purple-500/30",

	MAIN:
		"bg-accent/20 text-accent border border-accent/30",

	DESSERT:
		"bg-pink-500/20 text-pink-300 border border-pink-500/30",

	DRINK:
		"bg-blue-500/20 text-blue-300 border border-blue-500/30",

	SIDE:
		"bg-green-500/20 text-green-300 border border-green-500/30",

	SOUP:
		"bg-orange-500/20 text-orange-300 border border-orange-500/30",

	SALAD:
		"bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",

	APPETIZER:
		"bg-amber-500/20 text-amber-300 border border-amber-500/30",
};

const availabilityBadge = {
	true:
		"bg-success/20 text-success border border-success/30",

	false:
		"bg-error/20 text-error border border-error/30",
};

const menuItemImageUrl = (path) => {
	if (!path) return null;

	const raw = String(path).trim();

	if (
		raw.startsWith("http://") ||
		raw.startsWith("https://")
	) {
		return raw;
	}

	if (raw.includes("res.cloudinary.com")) {
		return `https://${raw.replace(/^\/+/, "")}`;
	}

	const cloudinaryBase =
		import.meta.env
			.VITE_CLOUDINARY_BASE_URL ||
		"https://res.cloudinary.com/db5rnorif/image/upload/";

	return `${cloudinaryBase}${raw.replace(
		/^\/+/,
		""
	)}`;
};

const formatCurrency = (value) => {
	if (
		value === null ||
		value === undefined ||
		value === ""
	) {
		return "-";
	}

	return new Intl.NumberFormat(
		"es-GT",
		{
			style: "currency",
			currency: "GTQ",
			maximumFractionDigits: 2,
		}
	).format(Number(value));
};

export const MenuItems = () => {
	const {
		restaurantId:
			paramRestaurantId,
	} = useParams();

	const user = useAuthStore(
		(state) => state.user
	);

	const role = user?.role;

	const [restaurants, setRestaurants] =
		useState([]);

	const [
		selectedRestaurant,
		setSelectedRestaurant,
	] = useState(
		paramRestaurantId || ""
	);

	const [items, setItems] =
		useState([]);

	const [loading, setLoading] =
		useState(false);

	const [
		loadingRestaurants,
		setLoadingRestaurants,
	] = useState(false);

	const [error, setError] =
		useState(null);

	const [search, setSearch] =
		useState("");

	const [typeFilter, setTypeFilter] =
		useState("ALL");

	const [
		availabilityFilter,
		setAvailabilityFilter,
	] = useState("ALL");

	const [page, setPage] =
		useState(1);

	const [
		openCreateModal,
		setOpenCreateModal,
	] = useState(false);

	const [
		openDetailModal,
		setOpenDetailModal,
	] = useState(false);

	const [selectedItem, setSelectedItem] =
		useState(null);

	const isFetchingRef =
		useRef(false);

	const restaurantId =
		paramRestaurantId ||
		selectedRestaurant;

	const fetchRestaurants =
		useCallback(async () => {
			if (paramRestaurantId)
				return;

			setLoadingRestaurants(
				true
			);

			try {
				const { data } =
					await axiosAdmin.get(
						"/restaurants/get"
					);

				const restaurantList =
					Array.isArray(data)
						? data
						: Array.isArray(
								data?.data
						  )
						? data.data
						: [];

				setRestaurants(
					restaurantList
				);

				if (
					role ===
						"RESTAURANT_ADMIN" &&
					restaurantList.length > 0
				) {
					setSelectedRestaurant(
						restaurantList[0]
							._id ||
							restaurantList[0]
								.id
					);
				}
			} catch (err) {
				console.error(
					"Error fetching restaurants:",
					err
				);

				setError(
					"Error al cargar restaurantes"
				);
			} finally {
				setLoadingRestaurants(
					false
				);
			}
		}, [
			paramRestaurantId,
			role,
		]);

	useEffect(() => {
		fetchRestaurants();
	}, [fetchRestaurants]);

	const fetchMenuItems =
		useCallback(
			async (force = false) => {
				if (
					isFetchingRef.current &&
					!force
				)
					return;

				if (!restaurantId)
					return;

				isFetchingRef.current =
					true;

				setLoading(true);
				setError(null);

				try {
					const response =
						await getAllMenuItems(
							restaurantId
						);

					const data =
						response.data ||
						response;

					const itemList =
						Array.isArray(data)
							? data
							: Object.values(
									data
							  ).flat();

					setItems(itemList);
				} catch (err) {
					const message =
						err.response?.data
							?.message ||
						err.message ||
						"Error al cargar platos";

					setError(message);
				} finally {
					isFetchingRef.current =
						false;

					setLoading(false);
				}
			},
			[restaurantId]
		);

	useEffect(() => {
		fetchMenuItems();
	}, [fetchMenuItems]);

	useEffect(() => {
		if (error) {
			showError(error);
		}
	}, [error]);

	const filteredItems =
		useMemo(() => {
			const normalizedSearch =
				search
					.trim()
					.toLowerCase();

			return items.filter(
				(item) => {
					const matchesSearch =
						!normalizedSearch ||
						(
							item.name || ""
						)
							.toLowerCase()
							.includes(
								normalizedSearch
							) ||
						(
							item.description ||
							""
						)
							.toLowerCase()
							.includes(
								normalizedSearch
							);

					const matchesType =
						typeFilter ===
						"ALL"
							? true
							: item.type ===
							  typeFilter;

					const matchesAvailability =
						availabilityFilter ===
						"ALL"
							? true
							: availabilityFilter ===
							  "AVAILABLE"
							? Boolean(
									item.available
							  )
							: !Boolean(
									item.available
							  );

					return (
						matchesSearch &&
						matchesType &&
						matchesAvailability
					);
				}
			);
		}, [
			items,
			search,
			typeFilter,
			availabilityFilter,
		]);

	const totalPages = Math.max(
		1,
		Math.ceil(
			filteredItems.length /
				PAGE_SIZE
		)
	);

	const currentPage =
		Math.min(page, totalPages);

	const paginatedItems =
		useMemo(() => {
			const start =
				(currentPage - 1) *
				PAGE_SIZE;

			return filteredItems.slice(
				start,
				start + PAGE_SIZE
			);
		}, [
			filteredItems,
			currentPage,
		]);

	const handleCreate = async (
		formData,
		file
	) => {
		setLoading(true);

		try {
			const created =
				await createMenuItem(
					restaurantId,
					formData
				);

			if (
				file &&
				(created?._id ||
					created?.id)
			) {
				try {
					await uploadMenuItemPhoto(
						created._id ||
							created.id,
						file
					);
				} catch (
					uploadErr
				) {
					console.error(
						"Error uploading photo:",
						uploadErr
					);

					showError(
						"El plato se creó pero la imagen no pudo subirse"
					);
				}
			}

			showSuccess(
				"Plato creado correctamente"
			);

			await fetchMenuItems(
				true
			);

			return true;
		} catch (err) {
			const message =
				err.response?.data
					?.message ||
				err.message ||
				"Error al crear plato";

			showError(message);

			return false;
		} finally {
			setLoading(false);
		}
	};

	const handleUpdate = async (
		itemId,
		formData,
		file
	) => {
		setLoading(true);

		try {
			await updateMenuItem(
				itemId,
				formData
			);

			if (file) {
				try {
					await uploadMenuItemPhoto(
						itemId,
						file
					);
				} catch (
					uploadErr
				) {
					console.error(
						"Error uploading photo:",
						uploadErr
					);

					showError(
						"El plato se actualizó pero la imagen no pudo subirse"
					);
				}
			}

			showSuccess(
				"Plato actualizado correctamente"
			);

			setOpenDetailModal(
				false
			);

			setSelectedItem(null);

			await fetchMenuItems(
				true
			);

			return true;
		} catch (err) {
			const message =
				err.response?.data
					?.message ||
				err.message ||
				"Error al actualizar plato";

			showError(message);

			return false;
		} finally {
			setLoading(false);
		}
	};

	const handleDelete =
		async (itemId) => {
			const confirmDelete =
				window.confirm(
					"¿Está seguro de que desea eliminar este plato?"
				);

			if (!confirmDelete)
				return;

			setLoading(true);

			try {
				await deleteMenuItem(
					itemId
				);

				showSuccess(
					"Plato eliminado correctamente"
				);

				await fetchMenuItems(
					true
				);
			} catch (err) {
				const message =
					err.response?.data
						?.message ||
					err.message ||
					"Error al eliminar plato";

				showError(message);
			} finally {
				setLoading(false);
			}
		};

	const handleOpenDetail = (
		item
	) => {
		setSelectedItem(item);
		setOpenDetailModal(true);
	};

	const handleOpenCreate = () => {
		if (!restaurantId) {
			showError(
				"Selecciona un restaurante primero"
			);

			return;
		}

		setOpenCreateModal(true);
	};

	return (
		<div className="p-4">
			<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
				<div>
					<h1 className="text-3xl font-bold text-accent font-serif">
						Platos del Menú
					</h1>

					<p className="text-accent/80 mt-1 text-sm font-medium">
						Gestiona los platos y bebidas del restaurante
					</p>
				</div>

				<button
					className="bg-accent px-6 py-2 rounded-xl text-bg-dark font-bold hover:bg-gold-light shadow-lg transition flex items-center gap-2"
					onClick={
						handleOpenCreate
					}
					disabled={
						!restaurantId
					}
				>
					+ Agregar Plato
				</button>
			</div>

			{!paramRestaurantId && (
				<div className="mb-6 bg-bg-card rounded-xl border border-accent/10 shadow-lg p-4">
					<label className="block text-sm font-semibold text-text-body mb-2">
						Seleccionar Restaurante
					</label>

					{loadingRestaurants ? (
						<div className="flex items-center gap-2">
							<Spinner />

							<span className="text-text-muted">
								Cargando restaurantes...
							</span>
						</div>
					) : (
						<select
							value={
								selectedRestaurant
							}
							onChange={(
								e
							) => {
								setSelectedRestaurant(
									e
										.target
										.value
								);

								setPage(
									1
								);

								setSearch(
									""
								);

								setTypeFilter(
									"ALL"
								);

								setAvailabilityFilter(
									"ALL"
								);
							}}
							className="w-full px-4 py-2 border border-accent/20 bg-bg-page rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors cursor-pointer"
						>
							<option value="">
								-- Selecciona un restaurante --
							</option>

							{restaurants.map(
								(
									rest
								) => (
									<option
										key={
											rest._id ||
											rest.id
										}
										value={
											rest._id ||
											rest.id
										}
									>
										{
											rest.name
										}
									</option>
								)
							)}
						</select>
					)}
				</div>
			)}

			<div className="bg-bg-card rounded-xl border border-accent/10 shadow-lg p-4 mb-4">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<input
						value={search}
						onChange={(
							e
						) => {
							setSearch(
								e.target
									.value
							);

							setPage(
								1
							);
						}}
						placeholder="Buscar por nombre o descripción..."
						className="md:col-span-2 w-full px-4 py-2 border border-accent/20 bg-bg-page rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
					/>

					<select
						value={
							typeFilter
						}
						onChange={(
							e
						) => {
							setTypeFilter(
								e.target
									.value
							);

							setPage(
								1
							);
						}}
						className="w-full px-4 py-2 border border-accent/20 bg-bg-page rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors cursor-pointer"
					>
						<option value="ALL">
							Todos los tipos
						</option>

						{MENU_TYPES.map(
							(
								type
							) => (
								<option
									key={
										type
									}
									value={
										type
									}
								>
									{MENU_TYPE_LABELS[
										type
									] ||
										type}
								</option>
							)
						)}
					</select>

					<select
						value={
							availabilityFilter
						}
						onChange={(
							e
						) => {
							setAvailabilityFilter(
								e.target
									.value
							);

							setPage(
								1
							);
						}}
						className="w-full px-4 py-2 border border-accent/20 bg-bg-page rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors cursor-pointer"
					>
						<option value="ALL">
							Todos los estados
						</option>

						<option value="AVAILABLE">
							Disponibles
						</option>

						<option value="UNAVAILABLE">
							No disponibles
						</option>
					</select>
				</div>
			</div>

			<div className="bg-bg-card rounded-xl border border-accent/10 shadow-lg overflow-hidden p-4">
				{loading &&
				items.length ===
					0 ? (
					<div className="flex items-center justify-center py-12">
						<Spinner />
					</div>
				) : paginatedItems.length ===
				  0 ? (
					<div className="py-12 text-center text-text-muted">
						No hay platos para mostrar.
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{paginatedItems.map(
							(
								item
							) => {
								const imageUrl =
									menuItemImageUrl(
										item.image
									);

								return (
									<div
										key={
											item.id ||
											item._id
										}
										className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition"
									>
										<div className="w-full h-44 bg-gray-100 relative">
											{imageUrl ? (
												<img
													src={
														imageUrl
													}
													alt={
														item.name ||
														"Imagen"
													}
													className="w-full h-full object-cover"
													onError={(
														e
													) => {
														e.currentTarget.style.display =
															"none";
													}}
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center text-text-muted">
													Sin imagen
												</div>
											)}

											<div className="absolute top-3 left-3">
												<span
													className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
														typeColors[
															item.type
														] ||
														"bg-bg-page text-text-muted border border-accent/20"
													}`}
												>
													{MENU_TYPE_LABELS[
														item.type
													] ||
														item.type ||
														"-"}
												</span>
											</div>

											<div className="absolute top-3 right-3">
												<span
													className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
														availabilityBadge[
															String(
																Boolean(
																	item.available
																)
															)
														]
													}`}
												>
													{item.available
														? "Disponible"
														: "No disponible"}
												</span>
											</div>
										</div>

										<div className="p-4">
											<h3 className="text-sm font-bold text-text-body">
												{item.name ||
													"-"}
											</h3>

											<p className="text-xs text-text-muted mt-1 line-clamp-2">
												{item.description ||
													"-"}
											</p>

											<div className="flex items-center justify-between mt-3">
												<span className="text-lg font-bold text-accent">
													{formatCurrency(
														item.price
													)}
												</span>
											</div>

											<div className="mt-4 flex gap-2 justify-end">
												<button
													className="px-3 py-1 rounded-lg bg-bg-page/50 hover:bg-accent/10 border border-accent/20 text-accent text-xs font-semibold transition-colors"
													onClick={() =>
														handleOpenDetail(
															item
														)
													}
												>
													Editar
												</button>

												<button
													className="px-3 py-1 rounded-lg bg-error/10 hover:bg-error/20 border border-error/20 text-error text-xs font-semibold transition-colors"
													onClick={() =>
														handleDelete(
															item.id ||
																item._id
														)
													}
												>
													Eliminar
												</button>
											</div>
										</div>
									</div>
								);
							}
						)}
					</div>
				)}

				<div className="flex items-center justify-between mt-4 px-2">
					<p className="text-xs text-text-muted">
						Mostrando{" "}
						{(currentPage -
							1) *
							PAGE_SIZE +
							(paginatedItems.length
								? 1
								: 0)}{" "}
						-{" "}
						{(currentPage -
							1) *
							PAGE_SIZE +
							paginatedItems.length}{" "}
						de{" "}
						{
							filteredItems.length
						}
					</p>

					<div className="flex gap-2">
						<button
							onClick={() =>
								setPage(
									(
										current
									) =>
										Math.max(
											1,
											current -
												1
										)
								)
							}
							disabled={
								currentPage ===
								1
							}
							className="px-3 py-1 rounded-lg border border-accent/20 bg-bg-page hover:bg-accent/10 text-text-body text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							Anterior
						</button>

						<span className="px-3 py-1 text-sm font-semibold text-text-body">
							{
								currentPage
							}{" "}
							/{" "}
							{
								totalPages
							}
						</span>

						<button
							onClick={() =>
								setPage(
									(
										current
									) =>
										Math.min(
											totalPages,
											current +
												1
										)
								)
							}
							disabled={
								currentPage ===
								totalPages
							}
							className="px-3 py-1 rounded-lg border border-accent/20 bg-bg-page hover:bg-accent/10 text-text-body text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							Siguiente
						</button>
					</div>
				</div>
			</div>

			<CreateMenuItemModal
				isOpen={
					openCreateModal
				}
				onClose={() =>
					setOpenCreateModal(
						false
					)
				}
				onCreate={
					handleCreate
				}
				loading={loading}
			/>

			<MenuItemDetailModal
				isOpen={
					openDetailModal
				}
				onClose={() => {
					setOpenDetailModal(
						false
					);

					setSelectedItem(
						null
					);
				}}
				item={selectedItem}
				onSave={
					handleUpdate
				}
				loading={loading}
			/>
		</div>
	);
};

export default MenuItems;