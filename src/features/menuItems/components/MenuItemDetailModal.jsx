import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Spinner } from "../../../shared/components/layouts/Spinner";
import { MENU_TYPES, MENU_TYPE_LABELS } from "../../../shared/constants/menuTypes";

const menuItemImageUrl = (path) => {
	if (!path) return null;
	const raw = String(path).trim();
	if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
	if (raw.startsWith("//")) return `https:${raw}`;
	if (raw.includes("res.cloudinary.com")) return `https://${raw.replace(/^\/+/, "")}`;
	const cloudinaryBase = import.meta.env.VITE_CLOUDINARY_BASE_URL || "https://res.cloudinary.com/db5rnorif/image/upload/";
	return `${cloudinaryBase}${raw.replace(/^\/+/, "")}`;
};

export const MenuItemDetailModal = ({ isOpen, onClose, item, onSave, loading }) => {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
		watch,
	} = useForm({
		mode: "onChange",
		defaultValues: {
			name: item?.name || "",
			type: item?.type || "",
			description: item?.description || "",
			price: item?.price || "",
			ingredients: Array.isArray(item?.ingredients) ? item.ingredients.join(", ") : "",
			allergens: Array.isArray(item?.allergens) ? item.allergens.join(", ") : "",
			available: item?.available ?? true,
		}
	});

	const [photoPreview, setPhotoPreview] = useState(null);
	const [photoFile, setPhotoFile] = useState(null);

	useEffect(() => {
		if (item && isOpen) {
			reset({
				name: item?.name || "",
				type: item?.type || "",
				description: item?.description || "",
				price: item?.price || "",
				ingredients: Array.isArray(item?.ingredients) ? item.ingredients.join(", ") : "",
				allergens: Array.isArray(item?.allergens) ? item.allergens.join(", ") : "",
				available: item?.available ?? true,
			});
		}
	}, [item, isOpen, reset]);

	if (!isOpen || !item) return null;

	const submit = async (values) => {
		const payload = {
			name: values.name || "",
			description: values.description || "",
			type: values.type || "",
			price: Number(values.price || 0),
			available: values.available === true || values.available === "true",
			ingredients: values.ingredients ? values.ingredients.split(",").map((i) => i.trim()).filter(Boolean) : [],
			allergens: values.allergens ? values.allergens.split(",").map((a) => a.trim()).filter(Boolean) : [],
		};

		const ok = await onSave(item.id || item._id, payload, photoFile);
		if (ok) {
			onClose();
		}
	};

	const coverUrl = menuItemImageUrl(item.image);

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-3 sm:px-4">
			<div className="bg-[#f6f1e8] rounded-2xl shadow-2xl border border-accent/20 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
				<div className="p-4 sm:p-5 text-bg-dark sticky top-0 z-10 bg-accent">
					<h2 className="text-xl sm:text-2xl font-bold font-serif">Editar Plato</h2>
					<p className="text-xs sm:text-sm font-semibold opacity-90 mt-1">
						Actualiza la información del plato
					</p>
				</div>

				<form
					onSubmit={handleSubmit(submit)}
					className="p-4 sm:p-6 space-y-4 overflow-y-auto bg-[#fffaf2]"
				>
					{coverUrl && (
						<div className="w-full rounded-lg overflow-hidden border border-accent/20">
							<img src={coverUrl} alt={item.name} className="w-full h-48 object-cover" />
						</div>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
								Nombre del Plato
							</label>
							<input
								{...register("name", { required: "El nombre es obligatorio" })}
								type="text"
								placeholder="Ej: Ceviche"
								className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
							/>
							{errors.name && (
								<p className="text-error text-xs font-semibold mt-1">{errors.name.message}</p>
							)}
						</div>
						<div>
							<label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
								Tipo
							</label>
							<select
								{...register("type", { required: "El tipo es obligatorio" })}
								className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors cursor-pointer"
							>
								<option value="">Selecciona un tipo</option>
								{MENU_TYPES.map((type) => (
									<option key={type} value={type}>{MENU_TYPE_LABELS[type] || type}</option>
								))}
							</select>
							{errors.type && (
								<p className="text-error text-xs font-semibold mt-1">{errors.type.message}</p>
							)}
						</div>
					</div>

					<div>
						<label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
							Descripción
						</label>
						<textarea
							{...register("description")}
							placeholder="Describe el plato"
							className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors resize-none h-24"
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
								Precio (GTQ)
							</label>
							<input
								{...register("price", {
									required: "El precio es obligatorio",
									pattern: {
										value: /^[0-9]+(\.[0-9]{1,2})?$/,
										message: "Debe ser un número válido",
									},
								})}
								type="number"
								placeholder="0.00"
								step="0.01"
								min="0"
								className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
							/>
							{errors.price && (
								<p className="text-error text-xs font-semibold mt-1">{errors.price.message}</p>
							)}
						</div>
						<div>
							<label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
								Nueva Imagen
							</label>
							<input
								{...register("image")}
								type="file"
								accept="image/*"
								onChange={(e) => {
									if (e.target.files?.[0]) {
										const f = e.target.files[0];
										setPhotoPreview(URL.createObjectURL(f));
										setPhotoFile(f);
									} else {
										setPhotoPreview(null);
										setPhotoFile(null);
									}
								}}
								className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-bg-dark hover:file:bg-gold-light"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
								Ingredientes
							</label>
							<input
								{...register("ingredients")}
								type="text"
								placeholder="Ej: Camarón, lima, cebolla"
								className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
							/>
						</div>
						<div>
							<label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
								Alérgenos
							</label>
							<input
								{...register("allergens")}
								type="text"
								placeholder="Ej: Mariscos, gluten"
								className="w-full px-4 py-3 bg-bg-page border border-accent/20 rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-bold text-text-body mb-1.5 uppercase tracking-wide">
							Disponibilidad
						</label>
						<select
							{...register("available")}
							className="w-full px-4 py-3 rounded-lg border border-accent/20 bg-bg-page text-text-body focus:outline-none focus:border-accent transition-colors cursor-pointer"
						>
							<option value="true">Disponible</option>
							<option value="false">No disponible</option>
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
