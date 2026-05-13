import { useForm } from "react-hook-form";
import { Spinner } from "../../../shared/components/layouts/Spinner";
import { useState, useEffect } from "react";

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

const restaurantCoverUrl = (path) => {
    if (!path) return null;
    const value = typeof path === "object"
        ? path.secure_url || path.url || path.path || path.location || path.filename || null
        : path;
    if (!value) return null;
    if (value.startsWith("http://") || value.startsWith("https://")) {
        return value;
    }
    const cloudinaryBase =
        import.meta.env.VITE_CLOUDINARY_BASE_URL ||
        "https://res.cloudinary.com/db5rnorf/image/upload/";
    return `${cloudinaryBase}${String(value).replace(/^\/+/, "")}`;
};

export const RestaurantDetailModal = ({
    isOpen,
    onClose,
    restaurant,
    onSave,
    loading,
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        watch,
    } = useForm({
        mode: "onChange",
        defaultValues: {
            name: restaurant?.name || "",
            category: restaurant?.category || "",
            email: restaurant?.email || "",
            phone: restaurant?.phone || "",
            street: restaurant?.address?.street || "",
            city: restaurant?.address?.city || "",
            state: restaurant?.address?.state || "",
            zipCode: restaurant?.address?.zipCode || "",
            avgPrice: restaurant?.avgPrice || "",
            schedule: restaurant?.schedule || "",
            tags: Array.isArray(restaurant?.tags) ? restaurant.tags.join(", ") : "",
            active: restaurant?.active ?? true,
        }
    });

    // Watch para sincronizar valores en tiempo real
    const formValues = watch();

    const [photoPreview, setPhotoPreview] = useState(null);

    // Actualizar los campos del formulario cuando cambie el restaurante
    useEffect(() => {
        if (restaurant && isOpen) {
            reset({
                name: restaurant?.name || "",
                category: restaurant?.category || "",
                email: restaurant?.email || "",
                phone: restaurant?.phone || "",
                street: restaurant?.address?.street || "",
                city: restaurant?.address?.city || "",
                state: restaurant?.address?.state || "",
                zipCode: restaurant?.address?.zipCode || "",
                avgPrice: restaurant?.avgPrice || "",
                schedule: restaurant?.schedule || "",
                tags: Array.isArray(restaurant?.tags) ? restaurant.tags.join(", ") : "",
                active: restaurant?.active ?? true,
            });
        }
    }, [restaurant, isOpen, reset]);

    if (!isOpen || !restaurant) return null;

    const submit = async (values) => {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("category", values.category);
        formData.append("email", values.email || "");
        formData.append("phone", values.phone || "");
        formData.append("avgPrice", values.avgPrice || 0);
        formData.append("schedule", values.schedule || "");
        formData.append("active", values.active === true || values.active === "true");

        // Address fields using bracket notation (parseMultipartFields middleware will convert to nested object)
        formData.append("address[street]", values.street || "");
        formData.append("address[city]", values.city || "");
        formData.append("address[state]", values.state || "");
        formData.append("address[zipCode]", values.zipCode || "");

        // Tags as JSON array string
        const tagsArray = values.tags ? values.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
        formData.append("tags", JSON.stringify(tagsArray));

        // Photo if selected
        if (values.photo?.[0]) {
            formData.append("image", values.photo[0]);
        }

        const ok = await onSave(restaurant.id || restaurant._id, formData);
        if (ok) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-3 sm:px-4">
            <div className="bg-[#f6f1e8] rounded-2xl shadow-2xl border border-accent/20 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="p-4 sm:p-5 text-bg-dark sticky top-0 z-10 bg-accent">
                    <h2 className="text-xl sm:text-2xl font-bold font-serif">Editar Restaurante</h2>
                    <p className="text-xs sm:text-sm font-semibold opacity-90 mt-1">
                        Actualiza la información del restaurante
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit(submit)}
                    className="p-4 sm:p-6 space-y-4 overflow-y-auto bg-[#fffaf2]"
                >
                    {/* SECCIÓN DE EDICIÓN */}
                    {/* Información básica */}
                    <div>
                        <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                            Nombre del Restaurante
                        </label>
                        <input
                            {...register("name", { required: "El nombre es obligatorio" })}
                            type="text"
                            placeholder="Ej: La Casita"
                            className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                        />
                        {errors.name && (
                            <p className="text-error text-xs font-semibold mt-1">{errors.name.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                            Categoría
                        </label>
                        <select
                            {...register("category", { required: "La categoría es obligatoria" })}
                            className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors cursor-pointer"
                        >
                            <option value="">Selecciona una categoría</option>
                            {CATEGORY_OPTIONS.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        {errors.category && (
                            <p className="text-error text-xs font-semibold mt-1">{errors.category.message}</p>
                        )}
                    </div>

                    {/* Contacto */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Email
                            </label>
                            <input
                                {...register("email", {
                                    pattern: {
                                        value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                                        message: "Formato de email inválido",
                                    },
                                })}
                                type="email"
                                placeholder={restaurant?.email || "contacto@restaurante.com"}
                                defaultValue={restaurant?.email || ""}
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                            {errors.email && (
                                <p className="text-error text-xs font-semibold mt-1">{errors.email.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Teléfono
                            </label>
                            <input
                                {...register("phone", {
                                    pattern: {
                                        value: /^[0-9]{8}$/,
                                        message: "Debe ser un número de 8 dígitos",
                                    },
                                })}
                                type="tel"
                                placeholder={restaurant?.phone || "12345678"}
                                defaultValue={restaurant?.phone || ""}
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                            {errors.phone && (
                                <p className="text-error text-xs font-semibold mt-1">{errors.phone.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Dirección */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Calle
                            </label>
                            <input
                                {...register("street")}
                                type="text"
                                placeholder={restaurant?.address?.street || "Calle principal 123"}
                                defaultValue={restaurant?.address?.street || ""}
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Ciudad
                            </label>
                            <input
                                {...register("city", { required: "La ciudad es obligatoria" })}
                                type="text"
                                placeholder={restaurant?.address?.city || "Guatemala"}
                                defaultValue={restaurant?.address?.city || ""}
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                            {errors.city && (
                                <p className="text-error text-xs font-semibold mt-1">{errors.city.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Departamento/Estado
                            </label>
                            <input
                                {...register("state")}
                                type="text"
                                placeholder={restaurant?.address?.state || "Guatemala"}
                                defaultValue={restaurant?.address?.state || ""}
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Código Postal
                            </label>
                            <input
                                {...register("zipCode")}
                                type="text"
                                placeholder={restaurant?.address?.zipCode || "01001"}
                                defaultValue={restaurant?.address?.zipCode || ""}
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                        </div>
                    </div>

                    {/* Información comercial */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Precio Promedio (GTQ)
                            </label>
                            <input
                                {...register("avgPrice")}
                                type="number"
                                placeholder={restaurant?.avgPrice || "150.50"}
                                defaultValue={restaurant?.avgPrice || ""}
                                step="0.01"
                                min="0"
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Horario
                            </label>
                            <input
                                {...register("schedule")}
                                type="text"
                                placeholder={restaurant?.schedule || "Lun-Dom: 11:00 - 22:00"}
                                defaultValue={restaurant?.schedule || ""}
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                        </div>
                    </div>

                    {/* Etiquetas */}
                    <div>
                        <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                            Etiquetas (separadas por comas)
                        </label>
                        <input
                            {...register("tags")}
                            type="text"
                            placeholder="comida rápida, ambiente, música"
                            className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                        />
                    </div>

                    {/* Foto */}
                    <div>
                        <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                            Foto del Restaurante
                        </label>
                        <input
                            {...register("photo")}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    setPhotoPreview(URL.createObjectURL(e.target.files[0]));
                                }
                            }}
                            className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-bg-dark hover:file:bg-gold-light"
                        />
                    </div>

                    {/* Estado */}
                    <div>
                        <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                            Estado
                        </label>
                        <select
                            {...register("active")}
                            className="w-full px-4 py-3 rounded-lg border border-accent/20 bg-bg-page text-text-body focus:outline-none focus:border-accent transition-colors cursor-pointer"
                        >
                            <option value="true">Activo</option>
                            <option value="false">Inactivo</option>
                        </select>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-accent/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-accent/20 bg-bg-page hover:bg-accent/10 text-text-body font-bold transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-accent text-bg-dark font-bold hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg"
                        >
                            {loading ? <Spinner /> : "Guardar cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
