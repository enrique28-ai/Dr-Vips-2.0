// src/components/auth/AuthOnlyRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore.js";

export default function AuthOnlyRoute({ children }) {
  const { isAuthenticated, isCheckingAuth, user } = useAuthStore();
  if (isCheckingAuth) return null;

  // Si ya estás logueado, no deberías ver páginas públicas:
  // - si estás verificado -> manda a /patients
  // - si NO estás verificado -> manda a /verify-email
  if (isAuthenticated) {
    return user?.isVerified ? (
      <Navigate to="/patients" replace />
    ) : (
      <Navigate to="/verify-email" replace />
    );
  }

  // Si NO estás logueado, muestra la página pública (login/signup/forgot/reset)
  return children;
}

