import { useState, useEffect } from "react";
import { useAuthStore } from "../../auth/store/authStore";
import { getUserProfile, updateProfile } from "../../../shared/api/userProfile";
import { Typography, Input, Button, Card, CardBody } from "@material-tailwind/react";
import { Save, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import defaultAvatarImg from "../../../assets/img/avatarDefault.png";
import toast from "react-hot-toast";

export const Profile = () => {
    const { user, token, logout } = useAuthStore();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        surname: user?.surname || "",
        username: user?.username || "",
        email: user?.email || "",
        phone: user?.phone || "",
        profilePicture: user?.profilePicture || "" // opcional, url for view
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(
        user?.profilePicture && !user.profilePicture.includes("default-avatar") 
        ? user.profilePicture 
        : defaultAvatarImg
    );

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id) return;
            try {
                const data = await getUserProfile(user.id);
                if (data) {
                    setFormData({
                        name: data.name || "",
                        surname: data.surname || "",
                        username: data.username || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        profilePicture: data.profilePicture || ""
                    });
                    if (data.profilePicture && !data.profilePicture.includes("default-avatar")) {
                        setImagePreview(data.profilePicture);
                    }
                }
            } catch (error) {
                console.error("Error al cargar perfil", error);
            }
        };
        fetchProfile();
    }, [user?.id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const dataToUpdate = new FormData();
            dataToUpdate.append("name", formData.name);
            dataToUpdate.append("surname", formData.surname);
            dataToUpdate.append("username", formData.username);
            dataToUpdate.append("phone", formData.phone);
            
            if (imageFile) {
                dataToUpdate.append("profilePicture", imageFile);
            }

            await updateProfile(user.id, dataToUpdate);
            
            toast.success("Perfil actualizado con éxito.");
            
        } catch (error) {
            console.error("Error actualizando", error);
            const msg = error.response?.data?.message || "Error al actualizar perfil";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn mt-6">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Typography variant="h3" className="font-serif text-accent font-bold">
                        Mi Perfil
                    </Typography>
                    <Typography className="text-text-muted text-sm mt-1">
                        Actualiza tu información personal
                    </Typography>
                </div>
                <Button 
                    variant="text" 
                    className="text-text-muted hover:bg-bg-card flex items-center gap-2"
                    onClick={() => navigate(-1)}
                >
                    Volver
                </Button>
            </div>

            <Card className="bg-white border border-gray-200 shadow-sm w-full mb-8">
                <CardBody className="p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                        {/* Avatar Section */}
                        <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-gray-100">
                            <div className="relative group cursor-pointer w-28 h-28">
                                <img
                                    src={imagePreview}
                                    alt="Profile"
                                    className="w-full h-full rounded-full object-cover border-4 border-gray-100 group-hover:border-accent transition-colors"
                                />
                                <label className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                    <User className="w-8 h-8 text-white" />
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>
                            <div className="text-center md:text-left">
                                <Typography variant="h5" className="text-gray-900 font-semibold">
                                    {formData.name} {formData.surname}
                                </Typography>
                                <Typography className="text-gray-600 font-medium text-xs px-3 py-1.5 mt-2 inline-block bg-gray-100 rounded-lg">
                                    {user?.role?.replace(/_/g, " ") || "Usuario"}
                                </Typography>
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
                            <div>
                                <Typography variant="small" className="text-gray-700 font-bold mb-2">Nombre</Typography>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="!text-gray-900 !border-gray-300 focus:!border-accent bg-white"
                                    labelProps={{ className: "hidden" }}
                                    placeholder="Tu nombre"
                                />
                            </div>
                            <div>
                                <Typography variant="small" className="text-gray-700 font-bold mb-2">Apellido</Typography>
                                <Input
                                    name="surname"
                                    value={formData.surname}
                                    onChange={handleChange}
                                    className="!text-gray-900 !border-gray-300 focus:!border-accent bg-white"
                                    labelProps={{ className: "hidden" }}
                                    placeholder="Tu apellido"
                                />
                            </div>
                            <div>
                                <Typography variant="small" className="text-gray-700 font-bold mb-2">Usuario</Typography>
                                <Input
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="!text-gray-900 !border-gray-300 focus:!border-accent bg-white"
                                    labelProps={{ className: "hidden" }}
                                    placeholder="Tu usuario"
                                />
                            </div>
                            <div>
                                <Typography variant="small" className="text-gray-700 font-bold mb-2">Teléfono</Typography>
                                <Input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="!text-gray-900 !border-gray-300 focus:!border-accent bg-white"
                                    labelProps={{ className: "hidden" }}
                                    placeholder="Tu teléfono"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Typography variant="small" className="text-gray-700 font-bold mb-2">Correo Electrónico (No editable)</Typography>
                                <Input
                                    name="email"
                                    value={formData.email}
                                    className="!text-gray-500 bg-gray-50 !border-gray-200"
                                    disabled
                                    labelProps={{ className: "hidden" }}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="bg-accent text-white hover:bg-gold-amber shadow-md flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {loading ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
};