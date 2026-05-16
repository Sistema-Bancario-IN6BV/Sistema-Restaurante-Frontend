import { useState } from "react";
import { LoginForm } from "../components/LoginForm";
import { ForgotPasswordForm } from "../components/ForgotPasswordForm";
import { RegisterForm } from "../components/RegisterForm";

export const AuthPage = () => {
    const [view, setView] = useState("login"); // 'login' | 'forgot' | 'register'

    const renderTitle = () => {
        if (view === 'forgot') return "Recuperar Acceso";
        if (view === 'register') return null;
        return "Iniciar Sesión";
    };

    const renderSubtitle = () => {
        if (view === 'forgot') return "Ingresa tu correo para recibir las instrucciones de recuperación";
        return null;
    };

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-bg-dark p-4 relative overflow-hidden">
            {/* Decors ornamentales para dar un aspecto más elegante */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-deep/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-xl bg-bg-card rounded-2xl shadow-xl border border-accent/20 p-8 md:p-12 relative z-10 transition-all duration-300">
                <div className="flex flex-col items-center justify-center mb-6">
                    <img 
                        src="/src/assets/img/LogoTipo.png" 
                        alt="kinalEats logo" 
                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none' }}
                        className="h-28 w-28 rounded-full object-cover drop-shadow-[0_0_15px_rgba(245,200,66,0.15)] mb-2 transform transition-transform duration-300 hover:scale-105"
                    />
                    <div className="mt-2">
                        <span className="text-xl font-black text-accent drop-shadow-[0_0_6px_rgba(245,200,66,0.35)]">kinalEats</span>
                    </div>
                </div>

                <div className="text-center mb-8">
                    {renderTitle() && (
                        <h1 className="text-2xl md:text-3xl font-bold text-text-body font-serif tracking-wide mb-2">
                            {renderTitle()}
                        </h1>
                    )}

                    {renderSubtitle() && (
                        <p className="text-text-muted text-sm md:text-base max-w-sm mx-auto">
                            {renderSubtitle()}
                        </p>
                    )}
                </div>

                <div className="bg-bg-page/50 rounded-xl p-6 border border-accent/10">
                    {view === 'forgot' && (
                        <ForgotPasswordForm onSwitch={() => setView('login')} />
                    )}
                    
                    {view === 'register' && (
                        <RegisterForm onSwitch={() => setView('login')} />
                    )}
                    
                    {view === 'login' && (
                        <LoginForm 
                            onForgot={() => setView('forgot')} 
                            onRegister={() => setView('register')}
                        />
                    )}
                </div>
            </div>
            </div>
        </>
    );
};
