import { useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { getAllUsers } from "../../../shared/api/auth.js";
import { Spinner } from "../../../shared/components/layouts/Spinner";

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

export const CreateRestaurantModal = ({
    isOpen,
    onClose,
    onCreate,
    loading,
    error,
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const [admins, setAdmins] = useState([]);
    const [adminsLoading, setAdminsLoading] = useState(false);
    const [adminsError, setAdminsError] = useState(null);

    useEffect(() => {
        if (!isOpen) return;

        const loadAdmins = async () => {
            setAdminsLoading(true);
            setAdminsError(null);

            try {
                const result = await getAllUsers();
                const users = Array.isArray(result?.users) ? result.users : Array.isArray(result) ? result : [];
                const adminUsers = users.filter((user) => {
                    const role = (user?.role || "").toUpperCase();
                    return role === "RESTAURANT_ADMIN";
                });

                setAdmins(adminUsers);
            } catch (error) {
                setAdminsError(error.response?.data?.message || error.message || "No se pudieron cargar los administradores");
                setAdmins([]);
            } finally {
                setAdminsLoading(false);
            }
        };

        loadAdmins();
    }, [isOpen]);

    const adminOptions = useMemo(() => admins, [admins]);

    const validateBeforeSubmit = (values) => {
        if (!values.name) return 'El nombre es requerido';
        if (!values.city && !values.street) return 'La ciudad es requerida en la dirección';
        if (!values.category) return 'La categoría es requerida';
        if (!values.adminId) return 'El ID del administrador es requerido';
        return null;
    }

    if (!isOpen) return null;

    const submit = async (values) => {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("category", values.category);
        formData.append("email", values.email || "");
        formData.append("phone", values.phone || "");
        formData.append("avgPrice", values.avgPrice || 0);
        formData.append("schedule", values.schedule || "");

        // Address fields using bracket notation (parseMultipartFields middleware will convert to nested object)
        formData.append("address[street]", values.street || "");
        formData.append("address[city]", values.city || "");
        formData.append("address[state]", values.state || "");
        formData.append("address[zipCode]", values.zipCode || "");

        // Normalize tags: accept JSON string or comma-separated input and send JSON stringified array once
        let tagsArray = [];
        if (values.tags) {
            const s = values.tags.trim();
            if (s.startsWith("[")) {
                try {
                    const parsed = JSON.parse(s);
                    if (Array.isArray(parsed)) tagsArray = parsed.map(t => String(t).trim()).filter(Boolean);
                } catch (e) {
                    tagsArray = s.split(",").map(t => t.trim()).filter(Boolean);
                }
            } else {
                tagsArray = s.split(",").map(t => t.trim()).filter(Boolean);
            }
        }
        formData.append("tags", JSON.stringify(tagsArray));

        // AdminId (string)
        formData.append("adminId", values.adminId);

        // Photo
        if (values.photo?.[0]) {
            formData.append("image", values.photo[0]);
        }

        const clientErr = validateBeforeSubmit(values);
        if (clientErr) {
            alert(clientErr);
            return;
        }

        const ok = await onCreate(formData);
        if (ok) {
            reset();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-3 sm:px-4">
            <div className="bg-[#f6f1e8] rounded-2xl shadow-2xl border border-accent/20 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="p-4 sm:p-5 text-bg-dark sticky top-0 z-10 bg-accent">
                    <h2 className="text-xl sm:text-2xl font-bold font-serif">Nuevo Restaurante</h2>
                    <p className="text-xs sm:text-sm font-semibold opacity-90 mt-1">
                        Completa la información para registrar un nuevo restaurante
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit(submit)}
                    className="p-4 sm:p-6 space-y-4 overflow-y-auto bg-[#fffaf2]"
                >
                    {/* Información básica */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                placeholder="contacto@restaurante.com"
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
                                placeholder="12345678"
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
                                placeholder="Calle principal 123"
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
                                placeholder="Guatemala"
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
                                placeholder="Guatemala"
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
                                placeholder="01001"
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
                                {...register("avgPrice", {
                                    pattern: {
                                        value: /^[0-9]+(\.[0-9]{1,2})?$/,
                                        message: "Debe ser un número válido",
                                    },
                                })}
                                type="number"
                                placeholder="150.50"
                                step="0.01"
                                min="0"
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                            {errors.avgPrice && (
                                <p className="text-error text-xs font-semibold mt-1">{errors.avgPrice.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                                Horario
                            </label>
                            <input
                                {...register("schedule")}
                                type="text"
                                placeholder="Lun-Dom: 11:00 - 22:00"
                                className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                            />
                        </div>
                    </div>

                    {/* Admin y etiquetas */}
                    <div>
                        <label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
                            Administrador asignado
                        </label>
                        <select
                            {...register("adminId", { required: "El administrador es obligatorio" })}
                            className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors cursor-pointer"
                            defaultValue=""
                            disabled={adminsLoading || adminOptions.length === 0}
                        >
                            <option value="">
                                {adminsLoading
                                    ? "Cargando administradores..."
                                    : adminOptions.length === 0
                                        ? "No hay administradores disponibles"
                                        : "Selecciona un administrador"}
                            </option>
                            {adminOptions.map((admin) => (
                                <option key={admin.id || admin._id || admin.userId} value={admin.id || admin._id || admin.userId}>
                                    {[admin.name, admin.surname].filter(Boolean).join(" ") || admin.username || admin.email || admin.id}
                                    {admin.role ? ` (${admin.role})` : ""}
                                </option>
                            ))}
                        </select>
                        {errors.adminId && (
                            <p className="text-error text-xs font-semibold mt-1">{errors.adminId.message}</p>
                        )}
                        {adminsError && (
                            <p className="text-error text-xs font-semibold mt-1">{adminsError}</p>
                        )}
                    </div>

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
                            className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-bg-dark hover:file:bg-gold-light"
                        />
                    </div>

                    {error && <p className="text-error text-sm font-bold text-center">{error}</p>}

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
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-accent text-bg-dark font-bold hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {loading ? <Spinner /> : "Crear restaurante"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
