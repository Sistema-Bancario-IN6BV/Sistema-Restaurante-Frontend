import { useState } from "react";
import { resetPassword as resetPasswordRequest } from "../../../shared/api/auth";
import { showError, showSuccess } from "../../../shared/utils/toast";

export const useResetPassword = () => {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const submit = async (token, password) => {
    if (!token) {
      setStatus("error");
      setMessage("Token inválido.");
      showError("Token inválido.");
      return { status: "error", message: "Token inválido." };
    }
    if (!password || password.length < 6) {
      setStatus("error");
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      showError("La contraseña debe tener al menos 6 caracteres.");
      return { status: "error", message: "La contraseña debe tener al menos 6 caracteres." };
    }

    setStatus("loading");
    try {
      const res = await resetPasswordRequest(token, password);
      if (res.status === 200) {
        const successMessage = "Contraseña restablecida correctamente. Puedes iniciar sesión.";
        setStatus("success");
        setMessage(successMessage);
        showSuccess(successMessage);
        return { status: "success", message: successMessage };
      }
      const errorMessage = "No se pudo restablecer la contraseña.";
      setStatus("error");
      setMessage(errorMessage);
      showError(errorMessage);
      return { status: "error", message: errorMessage };
    } catch (e) {
      const errorMessage = e?.response?.data?.message || "No se pudo restablecer la contraseña.";
      setStatus("error");
      setMessage(errorMessage);
      showError(errorMessage);
      return { status: "error", message: errorMessage };
    }
  };

  return { submit, status, message };
};