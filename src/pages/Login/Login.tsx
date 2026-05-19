import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import "./Login.css";

/* ---- SVG Icons (inline, no extra deps) ---- */
const IconUser = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconLock = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconArrow = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconAlert = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

/* ---- Boutique Logo Icon ---- */
const BoutiqueIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M24 6C24 6 16 10 16 18C16 22.4 19.6 26 24 26C28.4 26 32 22.4 32 18C32 10 24 6 24 6Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 18H16M32 18H38"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M10 18L8 40H40L38 18"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 32H29M19 36H25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Por favor, ingresa tus credenciales.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const success = await login(username, password);
      if (success) {
        navigate("/dashboard", { replace: true });
      } else {
        setError("Usuario o contraseña incorrectos. Verifica tus datos.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      {/* ---- Brand Panel ---- */}
      <div className="login-brand-panel">
        <div
          className="login-brand-orb login-brand-orb--1"
          aria-hidden="true"
        />
        <div
          className="login-brand-orb login-brand-orb--2"
          aria-hidden="true"
        />
        <div
          className="login-brand-orb login-brand-orb--3"
          aria-hidden="true"
        />

        <div className="login-brand-content">
          <div className="login-brand-logo" aria-hidden="true">
            <BoutiqueIcon />
          </div>

          <h1 className="login-brand-name">
            Memo's Style
            <span>&amp; Luca Fashion</span>
          </h1>
          <p className="login-brand-tagline">Sistema de Punto de Venta</p>

          <div className="login-brand-divider" aria-hidden="true" />

          <ul
            className="login-brand-features"
            aria-label="Características del sistema"
          >
            <li className="login-brand-feature">
              <span className="login-brand-feature-dot" aria-hidden="true" />
              Gestión de ventas en tiempo real
            </li>
            <li className="login-brand-feature">
              <span className="login-brand-feature-dot" aria-hidden="true" />
              Control de inventario de prendas
            </li>
            <li className="login-brand-feature">
              <span className="login-brand-feature-dot" aria-hidden="true" />
              Reportes y estadísticas avanzadas
            </li>
          </ul>
        </div>

        <p className="login-brand-footer">
          © {new Date().getFullYear()} Memo's Style &amp; Luca Fashion
        </p>
      </div>

      {/* ---- Form Panel ---- */}
      <div className="login-form-panel">
        <div className="login-form-container">
          <div className="login-form-header">
            <p className="login-form-eyebrow">Bienvenido</p>
            <h2 className="login-form-title">Iniciar sesión</h2>
            <p className="login-form-subtitle">
              Ingresa tus credenciales para acceder al sistema.
            </p>
          </div>

          <form
            id="login-form"
            className="login-form"
            onSubmit={handleSubmit}
            noValidate
          >
            {/* Error message */}
            {error && (
              <div className="login-error" role="alert" aria-live="assertive">
                <IconAlert />
                {error}
              </div>
            )}

            {/* Username */}
            <div className="form-group">
              <label htmlFor="login-username" className="form-label">
                Nombre de usuario
              </label>
              <div className="form-input-wrapper">
                <span className="form-input-icon" aria-hidden="true">
                  <IconUser />
                </span>
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  className="form-input"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoFocus
                  disabled={loading}
                  aria-required="true"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="login-password" className="form-label">
                Contraseña
              </label>
              <div className="form-input-wrapper">
                <span className="form-input-icon" aria-hidden="true">
                  <IconLock />
                </span>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input form-input--with-toggle"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                  aria-required="true"
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  className="form-input-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              className="login-btn"
              disabled={loading}
              aria-label="Ingresar al sistema"
            >
              <span className="login-btn-content">
                {loading ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    Verificando…
                  </>
                ) : (
                  <>
                    Ingresar al sistema
                    <IconArrow />
                  </>
                )}
              </span>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
