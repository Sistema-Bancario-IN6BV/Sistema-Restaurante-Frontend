import { Navigate } from "react-router-dom";
import { Spinner } from "../../shared/components/layouts/Spinner";
import { useAuthStore } from "../../features/auth/store/authStore";


export const ProtectedRoute = ({ children }) => {
    
    const isAuthenticated = useAuthStore ((state) => state.isAuthenticated);
    const isLoadingAuth = useAuthStore((state) => state.isLoadingAuth);

    if(isLoadingAuth) return <Spinner />

    if(!isAuthenticated) return <Navigate to="/" replace />

    return children;
}