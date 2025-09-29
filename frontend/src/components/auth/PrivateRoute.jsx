// src/components/auth/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore.js";

export default function PrivateRoute({ children }) {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();
  if (isCheckingAuth) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

