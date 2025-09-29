// src/App.jsx
import { useEffect } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./stores/authStore.js";

// Guards
import AuthOnlyRoute from "./components/auth/AuthOnlyRoute.jsx";
import PrivateRoute from "./components/auth/PrivateRoute.jsx";
import RequireVerified from "./components/auth/RequireVerified.jsx";

// UI
import Navbar from "./components/Navbar.jsx";

// Public pages
import Home from "./pages/Home.jsx";
import LoginPage from "./pages/registration/LoginPage.jsx";
import SignUpPage from "./pages/registration/SignUpPage.jsx";
import ForgotPasswordPage from "./pages/registration/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/registration/ResetPasswordPage.jsx";
import EmailVerificationPage from "./pages/registration/EmailVerificationPage.jsx";

// Patients (privadas)
import PatientsPage from "./pages/patientsrecord/PatientsPage.jsx";
import PatientCreatePage from "./pages/patientsrecord/PatientCreatePage.jsx";
import PatientDetailPage from "./pages/patientsrecord/PatientDetailPage.jsx";
import PatientEditPage from "./pages/patientsrecord/PatientEditPage.jsx";

// Diagnósticos (privadas)
import DiagnosesByPatientPage from "./pages/diagnosisrecord/DiagnosesByPatientPage.jsx";
import DiagnosisCreatePage   from "./pages/diagnosisrecord/DiagnosisCreatePage.jsx";
import DiagnosisDetailPage   from "./pages/diagnosisrecord/DiagnosisDetailPage.jsx";
import DiagnosisEditPage     from "./pages/diagnosisrecord/DiagnosisEditPage.jsx";


const WithNav = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);
const NoNav = () => <Outlet />;

export default function App() {
  const { checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return null; // o tu Spinner global

  return (
    <Routes>
      {/* Rutas sin navbar */}
      <Route element={<NoNav />}>
        {/* /verify-email: requiere sesión; permite SOLO a no verificados */}
        <Route
          path="/verify-email"
          element={
            <PrivateRoute>
              <EmailVerificationPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <AuthOnlyRoute>
              <ResetPasswordPage />
            </AuthOnlyRoute>
          }
        />
      </Route>

      {/* Rutas con navbar */}
      <Route element={<WithNav />}>
        {/* Públicas */}
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <AuthOnlyRoute>
              <LoginPage />
            </AuthOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthOnlyRoute>
              <SignUpPage />
            </AuthOnlyRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AuthOnlyRoute>
              <ForgotPasswordPage />
            </AuthOnlyRoute>
          }
        />

        {/* Privadas: requieren login + verificación */}
        <Route
          element={
            <PrivateRoute>
              <RequireVerified>
                <Outlet />
              </RequireVerified>
            </PrivateRoute>
          }
        >
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/patients/new" element={<PatientCreatePage />} />
          <Route path="/patients/:id" element={<PatientDetailPage />} />
          <Route path="/patients/:id/edit" element={<PatientEditPage />} />
          <Route path="/diagnosis/patient/:patientId" element={<DiagnosesByPatientPage />} />
          <Route path="/diagnosis/patient/:patientId/new" element={<DiagnosisCreatePage />} />
          <Route path="/diagnosis/patient/:patientId/:diagnosisId" element={<DiagnosisDetailPage />} />
          <Route path="/diagnosis/patient/:patientId/:diagnosisId/edit" element={<DiagnosisEditPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
