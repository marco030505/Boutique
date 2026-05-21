import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import "./SwitchUser.css";

/* ---- SVG Icons ---- */
const IconUserPlus = () => (
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
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="17" y1="11" x2="23" y2="11" />
  </svg>
);

const IconTrash = () => (
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
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const IconArrowLeft = () => (
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
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const BoutiqueIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="64" height="64">
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
  </svg>
);

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function SwitchUser() {
  const { session, activeSessions, switchSession, removeSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (activeSessions.length === 0) {
      navigate("/login", { replace: true });
    }
  }, [activeSessions, navigate]);

  const handleSelectUser = (id: number) => {
    switchSession(id);
    navigate("/dashboard");
  };

  const handleRemoveSession = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // prevent triggering user selection
    removeSession(id);
  };

  return (
    <main className="switch-user-page">
      {/* Background orbs for depth */}
      <div className="switch-user-orb switch-user-orb--1" aria-hidden="true" />
      <div className="switch-user-orb switch-user-orb--2" aria-hidden="true" />

      <div className="switch-user-container">
        <header className="switch-user-header">
          <div className="switch-user-logo" aria-hidden="true">
            <BoutiqueIcon />
          </div>
          <h1 className="switch-user-title">Cambio de Usuario</h1>
          <p className="switch-user-subtitle">
            Selecciona una sesión activa para ingresar al sistema.
          </p>
        </header>

        <section className="switch-user-list" aria-label="Sesiones activas">
          {activeSessions.map((user) => {
            const isActive = session?.id === user.id;
            return (
              <div
                key={user.id}
                className={`switch-user-card ${isActive ? "switch-user-card--active" : ""}`}
                onClick={() => handleSelectUser(user.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleSelectUser(user.id);
                  }
                }}
              >
                <div className={`switch-user-avatar switch-user-avatar--${user.role}`}>
                  {getInitials(user.name)}
                </div>
                
                <div className="switch-user-info">
                  <div className="switch-user-name-wrapper">
                    <span className="switch-user-name">{user.name}</span>
                    {isActive && (
                      <span className="switch-user-active-badge" title="Sesión activa actual">
                        <span className="switch-user-active-dot" />
                        Activo
                      </span>
                    )}
                  </div>
                  <span className="switch-user-username">@{user.username}</span>
                  <span className={`switch-user-role-badge switch-user-role-badge--${user.role}`}>
                    {user.role}
                  </span>
                </div>

                <button
                  type="button"
                  className="switch-user-remove-btn"
                  onClick={(e) => handleRemoveSession(e, user.id)}
                  aria-label={`Cerrar sesión de ${user.name}`}
                  title="Cerrar esta sesión"
                >
                  <IconTrash />
                </button>
              </div>
            );
          })}
        </section>

        <footer className="switch-user-actions">
          <button
            type="button"
            className="switch-user-btn switch-user-btn--primary"
            onClick={() => navigate("/login?addNew=true")}
            aria-label="Agregar un nuevo usuario"
          >
            <IconUserPlus />
            Agregar usuario
          </button>

          {session && (
            <button
              type="button"
              className="switch-user-btn switch-user-btn--secondary"
              onClick={() => navigate("/dashboard")}
              aria-label="Volver al panel"
            >
              <IconArrowLeft />
              Volver al Panel
            </button>
          )}
        </footer>
      </div>
    </main>
  );
}
