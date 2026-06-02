import { useNavigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "./DashboardLayout.css";

/* ---- SVG Icons ---- */
const IconBoutique = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3C12 3 8 5 8 9C8 11.2 9.8 13 12 13C14.2 13 16 11.2 16 9C16 5 12 3 12 3Z" />
    <path d="M5 9H8M16 9H19" />
    <path d="M5 9L4 20H20L19 9" />
  </svg>
);
const IconGrid = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const IconShoppingBag = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);
const IconPackage = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
const IconTag = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);
const IconBarChart = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);
const IconUsers = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconSettings = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const IconLogOut = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconSwitchUser = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 21a8 8 0 0 1 13.292-6" />
    <circle cx="10" cy="8" r="5" />
    <path d="M19 16V8m0 0l-3 3m3-3l3 3" />
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

const PAGE_TITLES: Record<string, { title: string; breadcrumb: string }> = {
  "/dashboard": { title: "Dashboard", breadcrumb: "Inicio" },
  "/dashboard/ventas": { title: "Punto de Venta", breadcrumb: "Ventas" },
  "/dashboard/historial-ventas": { title: "Historial de Ventas", breadcrumb: "Historial" },
  "/dashboard/devoluciones": { title: "Devoluciones", breadcrumb: "Devoluciones" },
  "/dashboard/inventario": { title: "Inventario", breadcrumb: "Inventario" },
  "/dashboard/productos": { title: "Productos", breadcrumb: "Catálogo" },
  "/dashboard/inventory-movements": { title: "Movimiento de Inventario", breadcrumb: "Movimientos" },
  // "/dashboard/reportes": { title: "Reportes", breadcrumb: "Reportes" },
  "/dashboard/usuarios": {
    title: "Usuarios",
    breadcrumb: "Gestión de usuarios",
  },
  "/dashboard/configuracion": {
    title: "Configuración",
    breadcrumb: "Configuración del sistema",
  },
};

export default function DashboardLayout() {
  const { session, activeSessions, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = session?.role === "administrador";

  const handleLogout = () => {
    logout();
    if (activeSessions.length > 1) {
      navigate("/switch-user", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  };

  const pageInfo = PAGE_TITLES[location.pathname] ?? {
    title: "Panel",
    breadcrumb: location.pathname,
  };

  return (
    <div className="dashboard-layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar" aria-label="Menú principal">
        <div className="sidebar-header">
          <div className="sidebar-logo-icon" aria-hidden="true">
            <IconBoutique />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">Memo's Style</span>
            <span className="sidebar-brand-sub">&amp; Lucia Fashion</span>
          </div>
        </div>

        <nav className="sidebar-nav" role="navigation">
          <div className="sidebar-nav-section">
            <p className="sidebar-nav-section-label">General</p>

            <NavLink
              id="nav-dashboard"
              to="/dashboard"
              end
              className={({ isActive }) =>
                `sidebar-nav-item${isActive ? " active" : ""}`
              }
            >
              <span className="sidebar-nav-icon">
                <IconGrid />
              </span>
              Dashboard
            </NavLink>

            <NavLink
              id="nav-ventas"
              to="/dashboard/ventas"
              className={({ isActive }) =>
                `sidebar-nav-item${isActive ? " active" : ""}`
              }
            >
              <span className="sidebar-nav-icon">
                <IconShoppingBag />
              </span>
              Ventas
            </NavLink>

            <NavLink
              id="nav-historial-ventas"
              to="/dashboard/historial-ventas"
              className={({ isActive }) =>
                `sidebar-nav-item${isActive ? " active" : ""}`
              }
            >
              <span className="sidebar-nav-icon">
                <IconBarChart />
              </span>
              Historial de Ventas
            </NavLink>

            <NavLink
              id="nav-devoluciones"
              to="/dashboard/devoluciones"
              className={({ isActive }) =>
                `sidebar-nav-item${isActive ? " active" : ""}`
              }
            >
              <span className="sidebar-nav-icon">
                <IconShoppingBag />
              </span>
              Devoluciones
            </NavLink>

            <NavLink
              id="nav-inventario"
              to="/dashboard/inventario"
              className={({ isActive }) =>
                `sidebar-nav-item${isActive ? " active" : ""}`
              }
            >
              <span className="sidebar-nav-icon">
                <IconPackage />
              </span>
              Inventario
            </NavLink>

            <NavLink
              id="nav-productos"
              to="/dashboard/productos"
              className={({ isActive }) =>
                `sidebar-nav-item${isActive ? " active" : ""}`
              }
            >
              <span className="sidebar-nav-icon">
                <IconTag />
              </span>
              Productos
            </NavLink>

            <NavLink
              id="nav-inventory-movements"
              to="/dashboard/inventory-movements"
              className={({ isActive }) =>
                `sidebar-nav-item${isActive ? " active" : ""}`
              }
            >
              <span className="sidebar-nav-icon">
                <IconBarChart />
              </span>
              Movimiento de Inv.
            </NavLink>
          </div>

          {isAdmin && (
            <div className="sidebar-nav-section">
              <p className="sidebar-nav-section-label">Administración</p>
              {[
                // { id: "reportes", label: "Reportes", icon: <IconBarChart /> },
                // { id: "usuarios", label: "Usuarios", icon: <IconUsers /> },
                {
                  id: "configuracion",
                  label: "Configuración",
                  icon: <IconSettings />,
                },
              ].map((item) => (
                <div
                  key={item.id}
                  id={`nav-${item.id}`}
                  className="sidebar-nav-item"
                >
                  <span className="sidebar-nav-icon">{item.icon}</span>
                  {item.label}
                  <span className="sidebar-nav-badge">Próximo</span>
                </div>
              ))}
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <button
            id="sidebar-switch-user-btn"
            className="sidebar-switch-user-btn"
            onClick={() => navigate("/switch-user")}
          >
            <IconSwitchUser />
            Cambio de Usuario
          </button>
          <button
            id="sidebar-logout-btn"
            className="sidebar-logout-btn"
            onClick={handleLogout}
          >
            <IconLogOut />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="dashboard-header-left">
            <span className="dashboard-header-page-title">
              {pageInfo.title}
            </span>
            <span className="dashboard-header-breadcrumb">
              Memo's Style &amp; Lucia Fashion / {pageInfo.breadcrumb}
            </span>
          </div>
          <div className="dashboard-header-right">
            <div className="user-info-pill">
              <div className={`user-avatar user-avatar--${session?.role}`}>
                {getInitials(session?.name ?? "U")}
              </div>
              <div className="user-info-text">
                <span className="user-info-name">{session?.name}</span>
                <span
                  className={`user-role-badge user-role-badge--${session?.role}`}
                >
                  {session?.role}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="layout-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
