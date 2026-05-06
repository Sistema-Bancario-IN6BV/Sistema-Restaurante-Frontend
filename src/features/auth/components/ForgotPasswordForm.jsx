
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export const ForgotPasswordForm = ({ onSwitch }) => {
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const res = await forgotPassword({ email: data.email });
    
    if (res.success) {
      toast.success("Si el correo existe, recibirás instrucciones pronto.", {
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
      <div className="space-y-2 relative">
        <label className="block text-xs font-medium text-text-body tracking-wide mb-1.5">
          CORREO ASOCIADO
        </label>

        <div className="relative">
          <input
            type="email"
            placeholder="usuario@noiregrill.com"
            className="w-full px-4 py-3 text-sm bg-bg-page border border-text-mid/30 rounded-lg 
                       focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent 
                       text-text-dark placeholder:text-text-muted transition-all duration-300 shadow-sm"
            {...register("email", {
              required: "El correo es obligatorio",
              pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Dirección de correo inválida"
              }
            })}
          />
          {/* Decorative icon */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-muted">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
        </div>

        {errors.email && (
          <p className="text-error text-[10px] absolute -bottom-5 left-0 font-medium">
            * {errors.email.message}
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
        disabled={loading}
        className="w-full bg-bg-dark hover:bg-[#0a0502] text-accent font-semibold py-3.5 px-4 rounded-lg
                   transition-all duration-300 shadow-md hover:shadow-lg border border-accent/20 
                   hover:border-accent/40 active:transform active:scale-[0.98] disabled:opacity-70 flex justify-center items-center mt-8 relative overflow-hidden group"
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {loading ? (
             <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-accent relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
        ) : (
            <span className="relative z-10 tracking-wider">ENVIAR INSTRUCCIONES</span>
        )}
      </button>

      <div className="text-center pt-6 border-t border-accent/10">
        <p className="text-sm text-text-muted">
          ¿Recordaste tu contraseña?{" "}
          <button
            type="button"
            className="text-accent-deep hover:text-accent font-medium ml-1 transition-colors underline-offset-4 hover:underline"
            onClick={onSwitch}
          >
            Iniciar sesión
          </button>
        </p>
      </div>
    </form>
  )
}
