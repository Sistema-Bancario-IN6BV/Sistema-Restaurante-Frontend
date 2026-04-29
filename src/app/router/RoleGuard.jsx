import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/authStore";

export const RoleGuard = ({ children, allowedRole = []}) => {
    
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const hasAccess = isAuthenticated && allowedRole.includes(user?.role);

    if(!hasAccess){
        return <Navigate to="/unauthorized" replace/>
    }

    return children;
}