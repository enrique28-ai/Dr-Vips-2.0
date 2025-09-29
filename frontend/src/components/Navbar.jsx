// src/components/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Stethoscope } from "lucide-react";        // 👈 ícono
import { useAuthStore } from "../stores/authStore.js";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const initial = (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg
                       bg-blue-600 text-white shadow-sm"
            aria-label="DR-VIPS Home"
          >
            <Stethoscope className="h-5 w-5" />    {/* 👈 estetoscopio */}
          </span>
          <span className="text-lg font-semibold tracking-tight text-gray-900">
            DR-VIPS
          </span>
        </Link>

        {/* Right side */}
        {!isAuthenticated ? (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-full border border-gray-300 text-gray-800 hover:bg-gray-100"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
            >
              Register
            </Link>
          </div>
        ) : (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="h-9 w-9 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold"
              aria-haspopup="menu"
              aria-expanded={open}
            >
              {initial}
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-44 rounded-md border border-gray-200 bg-white shadow-lg py-1" role="menu">
                {!user?.isVerified && (
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/verify-email");
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Verify email
                  </button>
                )}

                {user?.isVerified && (
                  <Link
                    to="/patients"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Patients
                  </Link>
                )}

                <button
                  onClick={async () => {
                    setOpen(false);
                    await logout();
                    navigate("/login");
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
