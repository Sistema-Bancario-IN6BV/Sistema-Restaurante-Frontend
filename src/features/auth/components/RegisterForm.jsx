import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export const RegisterForm = ({ onSwitch }) => {
    const registerStore = useAuthStore((state) => state.register);
    const loading = useAuthStore((state) => state.loading);
    const error = useAuthStore((state) => state.error);

    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("surname", data.surname);
        formData.append("username", data.username);
        formData.append("phone", data.phone);
        formData.append("email", data.email);
        formData.append("password", data.password);
        
        if (data.profilePicture && data.profilePicture.length > 0) {
            formData.append("profilePicture", data.profilePicture[0]);
        }

        const res = await registerStore(formData);
        if (res.success) {
            toast.success("¡Cuenta creada exitosamente! Revisa tu correo electrónico para verificar tu cuenta.", {
                duration: 4000,
                style: {
                    background: '#1C1008',
                    color: '#F5C842',
                    border: '1px solid #C8860A'
                },
                iconTheme: {
                    primary: '#F5C842',
                    secondary: '#1C1008',
                },
            });
            onSwitch();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <label className="block text-xs font-medium text-text-body tracking-wide mb-1.5">
                            NOMBRE
                        </label>
                        <input
                            type="text"
                            placeholder="Juan"
                            className="w-full px-4 py-2.5 text-sm bg-bg-page border border-text-mid/30 rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text-dark placeholder:text-text-muted transition-all duration-300 shadow-sm"
                            {...register("name", { required: "Obligatorio" })}
                        />
                        {errors.name && <p className="text-error text-[10px] mt-1 absolute font-medium">* {errors.name.message}</p>}
                    </div>

                    <div className="relative flex-1">
                        <label className="block text-xs font-medium text-text-body tracking-wide mb-1.5">
                            APELLIDO
                        </label>
                        <input
                            type="text"
                            placeholder="Pérez"
                            className="w-full px-4 py-2.5 text-sm bg-bg-page border border-text-mid/30 rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text-dark placeholder:text-text-muted transition-all duration-300 shadow-sm"
                            {...register("surname", { required: "Obligatorio" })}
                        />
                        {errors.surname && <p className="text-error text-[10px] mt-1 absolute font-medium">* {errors.surname.message}</p>}
                    </div>
                </div>

                <div className="flex gap-4 pt-2">
                    <div className="relative flex-1">
                        <label className="block text-xs font-medium text-text-body tracking-wide mb-1.5">
                            USUARIO
                        </label>
                        <input
                            type="text"
                            placeholder="juanp"
                            className="w-full px-4 py-2.5 text-sm bg-bg-page border border-text-mid/30 rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text-dark placeholder:text-text-muted transition-all duration-300 shadow-sm"
                            {...register("username", { required: "Obligatorio" })}
                        />
                        {errors.username && <p className="text-error text-[10px] mt-1 absolute font-medium">* {errors.username.message}</p>}
                    </div>

                    <div className="relative flex-1">
                        <label className="block text-xs font-medium text-text-body tracking-wide mb-1.5">
                            TELÉFONO (8 dígitos)
                        </label>
                        <input
                            type="tel"
                            placeholder="12345678"
                            className="w-full px-4 py-2.5 text-sm bg-bg-page border border-text-mid/30 rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text-dark placeholder:text-text-muted transition-all duration-300 shadow-sm"
                            {...register("phone", { 
                                required: "Obligatorio",
                                minLength: { value: 8, message: "Exactamente 8 dígitos" },
                                maxLength: { value: 8, message: "Exactamente 8 dígitos" }
                            })}
                        />
                        {errors.phone && <p className="text-error text-[10px] mt-1 absolute font-medium">* {errors.phone.message}</p>}
                    </div>
                </div>

                <div className="relative pt-2">
                    <label className="block text-xs font-medium text-text-body tracking-wide mb-1.5">
                        CORREO ELECTRÓNICO
                    </label>
                    <input
                        type="email"
                        placeholder="usuario@noiregrill.com"
                        className="w-full px-4 py-2.5 text-sm bg-bg-page border border-text-mid/30 rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text-dark placeholder:text-text-muted transition-all duration-300 shadow-sm"
                        {...register("email", { 
                            required: "El correo es obligatorio",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Correo inválido"
                            }
                        })}
                    />
                    {errors.email && <p className="text-error text-[10px] mt-1 absolute font-medium">* {errors.email.message}</p>}
                </div>

                <div className="relative pt-2">
                    <label className="block text-xs font-medium text-text-body tracking-wide mb-1.5">
                        FOTO DE PERFIL
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        className="w-full px-4 py-2.5 text-sm bg-bg-page border border-text-mid/30 rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text-dark placeholder:text-text-muted transition-all duration-300 shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20 cursor-pointer"
                        {...register("profilePicture", { required: "Obligatorio" })}
                    />
                    {errors.profilePicture && <p className="text-error text-[10px] mt-1 absolute font-medium">* {errors.profilePicture.message}</p>}
                </div>

                <div className="relative pt-2">
                    <label className="block text-xs font-medium text-text-body tracking-wide mb-1.5">
                        CONTRASEÑA
                    </label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 text-sm bg-bg-page border border-text-mid/30 rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text-dark placeholder:text-text-muted transition-all duration-300 shadow-sm"
                        {...register("password", { 
                            required: "Obligatoria",
                            minLength: { value: 8, message: "Mínimo 8 caracteres" }
                        })}
                    />
                    {errors.password && <p className="text-error text-[10px] mt-1 absolute font-medium">* {errors.password.message}</p>}
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
                className="w-full bg-bg-dark hover:bg-[#0a0502] text-accent font-semibold py-3.5 px-4 rounded-lg
                           transition-all duration-300 shadow-md hover:shadow-lg border border-accent/20 
                           hover:border-accent/40 active:transform active:scale-[0.98] disabled:opacity-70 flex justify-center items-center mt-8 relative overflow-hidden group"
                disabled={loading}
            >
                <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                {loading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-accent relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <span className="relative z-10 tracking-wider">CREAR CUENTA</span>
                )}
            </button>

            <div className="text-center pt-6 border-t border-accent/10 mt-6 md:mt-8">
                <p className="text-sm text-text-muted">
                    ¿Ya tienes una cuenta?{" "}
                    <button
                        type="button"
                        className="text-accent-deep hover:text-accent font-medium ml-1 transition-colors underline-offset-4 hover:underline"
                        onClick={onSwitch}
                    >
                        Inicia sesión aquí
                    </button>
                </p>
            </div>
        </form>
    );
};
