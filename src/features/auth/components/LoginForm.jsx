
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const LoginForm = ({ onForgot, onRegister }) => {
    const navigate = useNavigate();

    const login = useAuthStore((state) => state.login);
    const loading = useAuthStore((state) => state.loading);
    const error = useAuthStore((state) => state.error);

    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        //Mandar información al backend para iniciar sesión
        console.log(data);
        const res = await login(data)
        if(res.success){
            navigate("/dashboard")
            toast.success("¡Bienvenido a Noir & Grill!", {
                duration: 2000,
                style: {
                    background: '#1C1008',
                    color: '#F5C842',
                    border: '1px solid #C8860A'
                },
                iconTheme: {
                    primary: '#F5C842',
                    secondary: '#1C1008',
                },
            })
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2 relative">
                <label
                    htmlFor="emailOrUsername"
                    className="block text-xs font-medium text-text-body tracking-wide mb-1.5"
                >
                    CORREO O USUARIO
                </label>

                <div className="relative">
                    <input
                        id="emailOrUsername"
                        type="text"
                        placeholder="usuario@noiregrill.com"
                        className="w-full px-4 py-3 text-sm bg-bg-page border border-text-mid/30 rounded-lg 
                                   focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent 
                                   text-text-dark placeholder:text-text-muted transition-all duration-300 shadow-sm"
                        {...register("emailOrUsername", {
                            required: "Este campo es obligatorio",
                        })}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-muted">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                    </div>
                </div>

                {errors.emailOrUsername && (
                    <p className="text-error text-[10px] absolute -bottom-5 left-0 font-medium">
                        * {errors.emailOrUsername.message}
                    </p>
                )}
            </div>

            <div className="space-y-2 relative mt-4">
                <div className="flex justify-between items-center mb-1.5">
                    <label
                        htmlFor="password"
                        className="block text-xs font-medium text-text-body tracking-wide"
                    >
                        CONTRASEÑA
                    </label>
                    <button
                        type="button"
                        onClick={onForgot}
                        className="text-xs text-accent-deep hover:text-accent transition-colors underline-offset-4 hover:underline"
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
                </div>

                <div className="relative">
                    <input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-3 text-sm bg-bg-page border border-text-mid/30 rounded-lg 
                                   focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent 
                                   text-text-dark placeholder:text-text-muted transition-all duration-300 shadow-sm"
                        {...register("password", {
                            required: "La contraseña es obligatoria"
                        })}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-muted">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </div>
                </div>
                
                {errors.password && (
                    <p className="text-error text-[10px] absolute -bottom-5 left-0 font-medium">
                        * {errors.password.message}
                    </p>
                )}
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
                    <span className="relative z-10 tracking-wider">INGRESAR AL SISTEMA</span>
                )}
            </button>

            <div className="text-center pt-6 border-t border-accent/10 mt-6 md:mt-8">
                <p className="text-sm text-text-muted">
                    ¿No tienes una cuenta?{" "}
                    <button
                        type="button"
                        className="text-accent-deep hover:text-accent font-medium ml-1 transition-colors underline-offset-4 hover:underline"
                        onClick={onRegister}
                    >
                        Regístrate aquí
                    </button>
                </p>
            </div>
        </form>
    )
}
