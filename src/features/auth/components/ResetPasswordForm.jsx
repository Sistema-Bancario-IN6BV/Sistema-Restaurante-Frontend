import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/authStore";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const ResetPasswordForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Obtener token de la URL, por ejemplo ?token=XYZ
    const token = new URLSearchParams(location.search).get("token");

    const resetPassword = useAuthStore((state) => state.resetPassword);
    const loading = useAuthStore((state) => state.loading);
    const error = useAuthStore((state) => state.error);

    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const password = watch("newPassword");

    const onSubmit = async (data) => {
        if (!token) {
            toast.error("El enlace es inválido o ha expirado.");
            return;
        }

        const res = await resetPassword(token, data.newPassword);
        
        if (res.success) {
            toast.success("¡Tu contraseña ha sido restablecida exitosamente!", {
                duration: 4000,
                style: {
                    background: "#1C1008",
                    color: "#F5C842",
                    border: "1px solid #C8860A"
                },
                iconTheme: {
                    primary: "#F5C842",
                    secondary: "#1C1008",
                },
            });
            navigate("/"); // volver al login
        }
    };

    if (!token) {
        return (
            <div className="text-center py-6">
                <p className="text-error font-medium mb-4">El enlace es inválido o el token de recuperación no se encuentra.</p>
                <button
                    onClick={() => navigate("/")}
                    className="text-accent hover:text-accent-deep transition-colors underline underline-offset-4"
                >
                    Volver al inicio de sesión
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
                <div className="relative pt-2">
                    <label className="block text-xs font-medium text-text-body tracking-wide mb-1.5">
                        NUEVA CONTRASEÑA
                    </label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 text-sm bg-bg-page border border-text-mid/30 rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text-dark placeholder:text-text-muted transition-all duration-300 shadow-sm"
                        {...register("newPassword", { 
                            required: "La contraseña es obligatoria",
                            minLength: { value: 6, message: "Mínimo 6 caracteres" }
                        })}
                    />
                    {errors.newPassword && <p className="text-error text-[10px] mt-1 absolute font-medium">* {errors.newPassword.message}</p>}
                </div>

                <div className="relative pt-2 mt-4">
                    <label className="block text-xs font-medium text-text-body tracking-wide mb-1.5">
                        CONFIRMA TU CONTRASEÑA
                    </label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 text-sm bg-bg-page border border-text-mid/30 rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text-dark placeholder:text-text-muted transition-all duration-300 shadow-sm"
                        {...register("confirmPassword", { 
                            required: "Confirma tu contraseña",
                            validate: value => value === password || "Las contraseñas no coinciden"
                        })}
                    />
                    {errors.confirmPassword && <p className="text-error text-[10px] mt-1 absolute font-medium">* {errors.confirmPassword.message}</p>}
                </div>
            </div>

            {error && (
                <div className="bg-error/10 border border-error/30 text-error p-3 rounded-lg text-sm flex items-center gap-3 mt-4 shadow-sm animate-fade-in">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-bg-dark hover:bg-[#0a0502] text-accent font-semibold py-3.5 px-4 rounded-lg
                           transition-all duration-300 shadow-md hover:shadow-lg border border-accent/20 
                           hover:border-accent/40 active:transform active:scale-[0.98] disabled:opacity-70 flex justify-center items-center mt-8 relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                {loading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-accent relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <span className="relative z-10 tracking-wider">RESTABLECER CONTRASEÑA</span>
                )}
            </button>
            <div className="text-center pt-6 border-t border-accent/10">
                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="text-sm text-accent-deep hover:text-accent font-medium transition-colors underline-offset-4 hover:underline"
                >
                    Volver al inicio
                </button>
            </div>
        </form>
    );
};