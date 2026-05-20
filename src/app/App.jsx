import { useEffect } from "react";
import { Toaster } from "react-hot-toast"
import { AppRoutes } from "./router/AppRoutes.jsx"
import { ConfirmModal } from "../shared/components/ui/ConfirmModal.jsx"
import { useAuthStore } from "../features/auth/store/authStore";
import { CustomerNavbar } from "../shared/components/layouts/CustomerNavbar";
import { useLocation } from "react-router-dom";

export const App = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const isAuthPage = location.pathname === "/" || location.pathname.startsWith("/register");

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={
        {
          style: {
            fontFamily: "inherit",
            fontWeight: 600,
            fontSize: "1rem",
            borderRadius: "8px",
          }
        }
        }
      />
      {(user && user.role === "CUSTOMER" && !isAuthPage) && <CustomerNavbar />}
      <AppRoutes />
      <ConfirmModal />
    </>
  )
}
