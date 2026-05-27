import { useState } from "react";
import { forgotPassword as forgotPasswordRequest } from "../../../shared/api/auth";
import { showError, showSuccess } from "../../../shared/utils/toast";

// Evita múltiples requests en React StrictMode (montaje doble).
const promiseByEmail = new Map();
const resultByEmail = new Map();
const toastShownByEmail = new Map();

export const useForgotPassword = () => {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const send = async (email) => {
    if (!email) {
      setStatus("error");
      setMessage("Email inválido.");
      showError("Email inválido.");
      return { status: "error", message: "Email inválido." };
    }

    const cached = resultByEmail.get(email);
    if (cached) {
      setStatus(cached.status);
      setMessage(cached.message);
      if (!toastShownByEmail.get(email)) {
        toastShownByEmail.set(email, true);
        cached.status === "success" ? showSuccess(cached.message) : showError(cached.message);
      }
      return cached;
    }

    let promise = promiseByEmail.get(email);
    if (!promise) {
      setStatus("loading");
      promise = forgotPasswordRequest(email)
        .then((res) => {
          if (res.status === 200) {
            const successMessage = "Si el correo existe, recibirás un enlace para restablecer tu contraseña.";
            resultByEmail.set(email, { status: "success", message: successMessage });
            return { status: "success", message: successMessage };
          }

          const errorMessage = "Ocurrió un error al solicitar el restablecimiento.";
          resultByEmail.set(email, { status: "error", message: errorMessage });
          return { status: "error", message: errorMessage };
        })
        .catch((err) => {
          // Surface server validation / error payload so developer can inspect details
          try {
            console.error("ForgotPassword error response:", err.response?.data ?? err);
            const serverMessage = err.response?.data?.message || err.response?.data || null;
            const errorMessage = serverMessage || "Ocurrió un error al solicitar el restablecimiento.";
            resultByEmail.set(email, { status: "error", message: errorMessage });
            return { status: "error", message: errorMessage };
          } catch (e) {
            const errorMessage = "Ocurrió un error al solicitar el restablecimiento.";
            resultByEmail.set(email, { status: "error", message: errorMessage });
            return { status: "error", message: errorMessage };
          }
        })
        .finally(() => {
          promiseByEmail.delete(email);
        });

      promiseByEmail.set(email, promise);
    }

    const result = await promise;

    setStatus(result.status);
    setMessage(result.message);

    if (!toastShownByEmail.get(email)) {
      toastShownByEmail.set(email, true);
      result.status === "success" ? showSuccess(result.message) : showError(result.message);
    }

    return result;
  };

  return { send, status, message };
};