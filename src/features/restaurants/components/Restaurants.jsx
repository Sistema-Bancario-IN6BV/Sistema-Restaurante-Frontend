import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../../../shared/components/layouts/Spinner.jsx";
import { showError, showSuccess } from "../../../shared/utils/toast.js";
import { axiosAdmin } from "../../../shared/api/api.js";
import { getAllUsers } from "../../../shared/api/auth.js";
import { CreateRestaurantModal } from "./CreateRestaurantModal.jsx";
import { RestaurantDetailModal } from "./RestaurantDetailModal.jsx";


const PAGE_SIZE = 8;

const CATEGORY_OPTIONS = [
	"ITALIANA",
	"MEXICANA",
	"JAPONESA",
	"CHINA",
	"FRANCESA",
	"AMERICANA",
	"GUATEMALTECA",
	"MARISCOS",
	"VEGETARIANA",
	"VEGANA",
	"PARRILLA",
	"PIZZERIA",
	"CAFE",
	"SUSHI",
	"TAPAS",
	"FUSION",
	"PERUANA",
	"OTRA",
];

const statusBadgeClass = {
	true: "bg-success/20 text-success border border-success/30",
	false: "bg-error/20 text-error border border-error/30",
};

const categoryBadgeClass = {
	ITALIANA: "bg-accent/20 text-accent border border-accent/30",
	MEXICANA: "bg-warning/20 text-warning border border-warning/30",
	JAPONESA: "bg-info/20 text-info border border-info/30",
	CHINA: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
	FRANCESA: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
	AMERICANA: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
	GUATEMALTECA: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
	MARISCOS: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
	VEGETARIANA: "bg-lime-500/20 text-lime-300 border border-lime-500/30",
	VEGANA: "bg-green-500/20 text-green-300 border border-green-500/30",
	PARRILLA: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
	PIZZERIA: "bg-red-500/20 text-red-300 border border-red-500/30",
	CAFE: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
	SUSHI: "bg-pink-500/20 text-pink-300 border border-pink-500/30",
	TAPAS: "bg-violet-500/20 text-violet-300 border border-violet-500/30",
	FUSION: "bg-teal-500/20 text-teal-300 border border-teal-500/30",
	PERUANA: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
	OTRA: "bg-bg-page text-text-muted border border-accent/20",
};

const normalizeRestaurants = (responseData) => {
	if (Array.isArray(responseData)) return responseData;
	if (Array.isArray(responseData?.data)) return responseData.data;
	if (Array.isArray(responseData?.restaurants)) return responseData.restaurants;
	return [];
};

const formatCurrency = (value) => {
	if (value === null || value === undefined || value === "") return "-";
	return new Intl.NumberFormat("es-ES", {
		style: "currency",
		currency: "GTQ",
		maximumFractionDigits: 0,
	}).format(Number(value));
};




const restaurantCoverUrl = (path) => {
	if (!path) return null;
	const value = typeof path === "object"
		? path.secure_url || path.url || path.path || path.location || path.filename || null
		: path;
	if (!value) return null;
	const raw = String(value).trim();
	// Absolute URLs with protocol
	if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
	// Protocol-relative URLs (//res.cloudinary.com/...)
	if (raw.startsWith("//")) return `https:${raw}`;
	// If it already contains cloudinary domain without protocol
	if (raw.includes("res.cloudinary.com")) return `https://${raw.replace(/^\/+/, "")}`;

	const cloudinaryBase = import.meta.env.VITE_CLOUDINARY_BASE_URL || "https://res.cloudinary.com/db5rnorf/image/upload/";
	const url = `${cloudinaryBase}${raw.replace(/^\/+/, "")}`;
	try { console.debug("resolved cover url:", url); } catch (e) {}
	return url;
};

const getRestaurantAdminId = (restaurant) =>
	restaurant?.adminId?._id ||
	restaurant?.adminId?.id ||
	restaurant?.adminId?.userId ||
	restaurant?.adminId ||
	restaurant?.admin?.id ||
	restaurant?.admin?.userId ||
	restaurant?.admin?._id ||
	null;

const getRestaurantAdminName = (restaurant, adminMap) => {
	const adminId = getRestaurantAdminId(restaurant);
	if (!adminId) return "Sin asignar";

	const admin = adminMap[adminId];
	if (admin) {
		return [admin.name, admin.surname].filter(Boolean).join(" ") || admin.username || admin.email || adminId;
	}

	// Try a best-effort search across available admin entries in case keys differ
	const possible = Object.values(adminMap).find((a) => {
		const ids = [a.id, a._id, a.userId].map((v) => (v == null ? null : String(v))).filter(Boolean);
		return ids.includes(String(adminId));
	});

	if (possible) return [possible.name, possible.surname].filter(Boolean).join(" ") || possible.username || possible.email || adminId;

	// If admin data is embedded in the restaurant object, prefer that
	const embedded = restaurant?.adminId || restaurant?.admin;
	if (embedded && typeof embedded === "object") {
		const name = [embedded.name, embedded.surname].filter(Boolean).join(" ");
		if (name) return name;
		if (embedded.username) return embedded.username;
		if (embedded.email) return embedded.email;
	}

	// Fallback: show id (last resort)
	return adminId;
};

export const Restaurants = () => {
	const navigate = useNavigate();

	const [restaurants, setRestaurants] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [search, setSearch] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("ALL");
	const [statusFilter, setStatusFilter] = useState("ALL");
	const [page, setPage] = useState(1);
	const [openCreateModal, setOpenCreateModal] = useState(false);
	const [openDetailModal, setOpenDetailModal] = useState(false);
	const [selectedRestaurant, setSelectedRestaurant] = useState(null);
	const [adminMap, setAdminMap] = useState({});
	const isFetchingRef = useRef(false);

	const fetchRestaurants = useCallback(async (force = false) => {
		if (isFetchingRef.current && !force) return;

		isFetchingRef.current = true;
		setLoading(true);
		setError(null);

		try {
			const response = await axiosAdmin.get("/restaurants/get");
			const restaurantList = normalizeRestaurants(response.data);
			setRestaurants(restaurantList);
		} catch (err) {
			const message = err.response?.data?.message || err.message || "Error al cargar restaurantes";
			setError(message);
		} finally {
			isFetchingRef.current = false;
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchRestaurants();
	}, [fetchRestaurants]);

	useEffect(() => {
		let alive = true;

		const loadAdmins = async () => {
			try {
				const result = await getAllUsers();
				const users = Array.isArray(result?.users) ? result.users : Array.isArray(result) ? result : [];
				const restaurantAdmins = users.filter((user) => (user?.role || "").toUpperCase() === "RESTAURANT_ADMIN");
				const map = restaurantAdmins.reduce((accumulator, admin) => {
					const keys = [admin.id, admin._id, admin.userId].filter(Boolean);
					keys.forEach((k) => {
						accumulator[k] = admin;
					});
					return accumulator;
				}, {});

				if (alive) setAdminMap(map);
			} catch (error) {
				if (alive) setAdminMap({});
			}
		};

		loadAdmins();

		return () => {
			alive = false;
		};
	}, []);

	useEffect(() => {
		if (error) {
			showError(error);
		}
	}, [error]);

	const filteredRestaurants = useMemo(() => {
		const normalizedSearch = search.trim().toLowerCase();

		return restaurants.filter((restaurant) => {
			const address = restaurant.address || {};
			const tags = Array.isArray(restaurant.tags) ? restaurant.tags.join(" ") : "";
			const ratingText = `${restaurant.rating?.average ?? 0} ${restaurant.rating?.count ?? 0}`;

			const matchesSearch =
				!normalizedSearch ||
				(restaurant.name || "").toLowerCase().includes(normalizedSearch) ||
				(address.city || "").toLowerCase().includes(normalizedSearch) ||
				(restaurant.email || "").toLowerCase().includes(normalizedSearch) ||
				(restaurant.phone || "").toLowerCase().includes(normalizedSearch) ||
				(restaurant.category || "").toLowerCase().includes(normalizedSearch) ||
				tags.toLowerCase().includes(normalizedSearch) ||
				ratingText.toLowerCase().includes(normalizedSearch);

			const matchesCategory =
				categoryFilter === "ALL" ? true : restaurant.category === categoryFilter;

			const matchesStatus =
				statusFilter === "ALL"
					? true
					: statusFilter === "ACTIVE"
						? Boolean(restaurant.active)
						: !Boolean(restaurant.active);

			return matchesSearch && matchesCategory && matchesStatus;
		});
	}, [restaurants, search, categoryFilter, statusFilter]);

	const totalPages = Math.max(1, Math.ceil(filteredRestaurants.length / PAGE_SIZE));
	const currentPage = Math.min(page, totalPages);

	const paginatedRestaurants = useMemo(() => {
		const start = (currentPage - 1) * PAGE_SIZE;
		return filteredRestaurants.slice(start, start + PAGE_SIZE);
	}, [filteredRestaurants, currentPage]);

	const handleCreate = async (formData) => {
		setLoading(true);
		try {
			const response = await axiosAdmin.post("/restaurants/create", formData);
			if (response.data?.success || response.status === 201) {
				showSuccess("Restaurante creado correctamente");
				await fetchRestaurants(true);
				return true;
			} else {
				showError(response.data?.message || "Error al crear restaurante");
				return false;
			}
		} catch (err) {
			try {
				console.error('Create restaurant error response:', JSON.stringify(err.response?.data || err, null, 2));
			} catch (e) {
				console.error('Create restaurant error response:', err.response?.data || err);
			}
			const resp = err.response?.data;
			if (resp?.errors && Array.isArray(resp.errors)) {
				const details = resp.errors.map(e => `${e.field}: ${e.message}`).join(" — ");
				showError(details || resp.message || "Error al crear restaurante");
			} else {
				const message = resp?.message || err.message || "Error al crear restaurante";
				showError(message);
			}
			return false;
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateRestaurant = async (restaurantId, formData) => {
		setLoading(true);
		try {
			const response = await axiosAdmin.put(`/restaurants/${restaurantId}`, formData);
			if (response.data?.success || response.status === 200) {
				showSuccess("Restaurante actualizado correctamente");
				setOpenDetailModal(false);
				setSelectedRestaurant(null);
				await fetchRestaurants(true);
				return true;
			} else {
				showError(response.data?.message || "Error al actualizar restaurante");
				return false;
			}
		} catch (err) {
			try {
				console.error('Update restaurant error response:', JSON.stringify(err.response?.data || err, null, 2));
			} catch (e) {
				console.error('Update restaurant error response:', err.response?.data || err);
			}
			const resp = err.response?.data;
			if (resp?.errors && Array.isArray(resp.errors)) {
				const details = resp.errors.map(e => `${e.field}: ${e.message}`).join(" — ");
				showError(details || resp.message || "Error al actualizar restaurante");
			} else {
				const message = resp?.message || err.message || "Error al actualizar restaurante";
				showError(message);
			}
			return false;
		} finally {
			setLoading(false);
		}
	};

	const handleOpenDetail = (restaurant) => {
		setSelectedRestaurant(restaurant);
		setOpenDetailModal(true);
	};

	return (
		<div className="p-4">
			<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
				<div>
					<h1 className="text-3xl font-bold text-accent font-serif">Restaurantes</h1>
					<p className="text-accent/80 mt-1 text-sm font-medium">
						Consulta restaurantes, filtra por categoría y revisa su información principal
					</p>
				</div>

				<button
					className="bg-accent px-6 py-2 rounded-xl text-bg-dark font-bold hover:bg-gold-light shadow-lg transition flex items-center gap-2"
					onClick={() => setOpenCreateModal(true)}
				>
						+ Agregar Restaurante
				</button>


			</div>

			<div className="bg-bg-card rounded-xl border border-accent/10 shadow-lg p-4 mb-4">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<input
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(1);
						}}
						placeholder="Buscar por nombre, ciudad, categoría o tags..."
						className="md:col-span-2 w-full px-4 py-2 border border-accent/20 bg-bg-page rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
					/>
					<select
						value={categoryFilter}
						onChange={(e) => {
							setCategoryFilter(e.target.value);
							setPage(1);
						}}
						className="w-full px-4 py-2 border border-accent/20 bg-bg-page rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors cursor-pointer"
					>
						<option value="ALL">Todas las categorías</option>
						{CATEGORY_OPTIONS.map((category) => (
							<option key={category} value={category}>{category}</option>
						))}
					</select>
					<select
						value={statusFilter}
						onChange={(e) => {
							setStatusFilter(e.target.value);
							setPage(1);
						}}
						className="w-full px-4 py-2 border border-accent/20 bg-bg-page rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors cursor-pointer"
					>
						<option value="ALL">Todos los estados</option>
						<option value="ACTIVE">Activos</option>
						<option value="INACTIVE">Inactivos</option>
					</select>
				</div>
			</div>

			<div className="bg-bg-card rounded-xl border border-accent/10 shadow-lg overflow-hidden p-4">
				{loading && restaurants.length === 0 ? (
					<div className="flex items-center justify-center py-12">
						<Spinner />
					</div>
				) : paginatedRestaurants.length === 0 ? (
					<div className="py-12 text-center text-text-muted">No hay restaurantes para mostrar.</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{paginatedRestaurants.map((restaurant) => {
							const cover = restaurantCoverUrl(restaurant.image || restaurant.photo || restaurant.cover || restaurant.imagePath || restaurant.imageUrl || "");
							return (
								<div key={restaurant.id || restaurant._id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition">
									<div className="w-full h-44 bg-gray-100 relative">
										{cover ? (
											<img src={cover} alt={restaurant.name || "Portada"} className="w-full h-full object-cover" />
										) : (
											<div className="w-full h-full flex items-center justify-center text-text-muted">Sin portada</div>
										)}
										<div className="absolute top-3 left-3">
											<span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${categoryBadgeClass[restaurant.category] || "bg-bg-page text-text-muted border border-accent/20"}`}>
												{restaurant.category || "-"}
											</span>
										</div>
										<div className="absolute top-3 right-3">
											<span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusBadgeClass[String(Boolean(restaurant.active))]}`}>
												{restaurant.active ? "Activo" : "Inactivo"}
											</span>
										</div>
									</div>
									<div className="p-4">
										<div className="flex items-start justify-between">
											<div>
												<h3 className="text-sm font-bold text-text-body">{restaurant.name || "-"}</h3>
												<p className="text-xs text-text-muted">{restaurant.address?.city || "-"}</p>
											</div>
											<div className="text-right text-xs text-text-muted">{formatCurrency(restaurant.avgPrice)}</div>
										</div>
										<p className="text-xs text-text-muted mt-2">Administrador: <span className="font-semibold text-text-body">{getRestaurantAdminName(restaurant, adminMap)}</span></p>
										<div className="mt-4 flex justify-end">
											<button
												className="px-3 py-1 rounded-lg bg-bg-page/50 hover:bg-accent/10 border border-accent/20 text-accent text-xs font-semibold transition-colors"
												onClick={() => handleOpenDetail(restaurant)}
											>
												Ver detalles
											</button>
										</div>
									</div>
								</div>
							);
							})}
						</div>
				) }

				{/* Pagination */}
				<div className="flex items-center justify-between mt-4 px-2">
					<p className="text-xs text-text-muted">
						Mostrando {(currentPage - 1) * PAGE_SIZE + (paginatedRestaurants.length ? 1 : 0)} - {(currentPage - 1) * PAGE_SIZE + paginatedRestaurants.length} de {filteredRestaurants.length}
					</p>
					<div className="flex gap-2">
						<button
							onClick={() => setPage((current) => Math.max(1, current - 1))}
							disabled={currentPage === 1}
							className="px-3 py-1 rounded-lg border border-accent/20 bg-bg-page hover:bg-accent/10 text-text-body text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							Anterior
						</button>
						<span className="px-3 py-1 text-sm font-semibold text-text-body">{currentPage} / {totalPages}</span>
						<button
							onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
							disabled={currentPage === totalPages}
							className="px-3 py-1 rounded-lg border border-accent/20 bg-bg-page hover:bg-accent/10 text-text-body text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							Siguiente
						</button>
					</div>
				</div>
			</div>

<CreateRestaurantModal
			isOpen={openCreateModal}
			onClose={() => setOpenCreateModal(false)}
			onCreate={handleCreate}
			loading={loading}
			error={error}
		/>

		<RestaurantDetailModal
			isOpen={openDetailModal}
			onClose={() => {
				setOpenDetailModal(false);
				setSelectedRestaurant(null);
			}}
			restaurant={selectedRestaurant}
			onSave={handleUpdateRestaurant}
			loading={loading}
			/>
		</div>
	);
};
