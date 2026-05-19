import { useAuth } from '../../context/useAuth';
import './Dashboard.css';

const IconShoppingBag = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);
const IconPackage = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
  </svg>
);
const IconBarChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconLayers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
);

const STATS = [
  { icon: <IconShoppingBag />, value: '—', label: 'Ventas del día', sub: 'Módulo próximo' },
  { icon: <IconPackage />, value: '—', label: 'Productos en stock', sub: 'Módulo próximo' },
  { icon: <IconBarChart />, value: '—', label: 'Ingresos del mes', sub: 'Módulo próximo' },
  { icon: <IconUsers />, value: '—', label: 'Clientes activos', sub: 'Módulo próximo' },
];

export default function Dashboard() {
  const { session } = useAuth();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <main id="dashboard-content" className="dashboard-content">
      <section className="dashboard-welcome">
        <p className="dashboard-welcome-eyebrow">
          {greeting()}, {session?.name?.split(' ')[0]}
        </p>
        <h1 className="dashboard-welcome-title">Panel Principal</h1>
        <p className="dashboard-welcome-subtitle">
          Bienvenido al sistema de gestión de{' '}
          <strong style={{ color: 'var(--color-text-primary)' }}>
            Memo's Style &amp; Luca Fashion
          </strong>
          . Los módulos se irán habilitando próximamente.
        </p>
      </section>

      <section aria-label="Estadísticas generales">
        <div className="dashboard-placeholder-grid">
          {STATS.map((stat, i) => (
            <div key={i} className="dashboard-stat-card">
              <div className="dashboard-stat-icon">{stat.icon}</div>
              <div className="dashboard-stat-value">{stat.value}</div>
              <div className="dashboard-stat-label">{stat.label}</div>
              <div className="dashboard-stat-sublabel">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-coming-soon">
        <div className="dashboard-coming-soon-icon"><IconLayers /></div>
        <h3>Módulos en desarrollo</h3>
        <p>
          El sistema está listo para recibir los módulos de ventas, inventario,
          reportes y más. Cada uno se integrará de forma progresiva.
        </p>
      </section>
    </main>
  );
}
