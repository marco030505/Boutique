import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGetInventoryMovements } from "../../services/api";
import type { InventoryMovement } from "../../services/api";
import "./InventoryMovements.css";

const TYPES = ["Todos", "Entrada", "Salida"];

const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconPlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default function InventoryMovementsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<string>("Todos");

  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMovements = async () => {
    setError("");
    try {
      setLoading(true);
      const data = await apiGetInventoryMovements(
        activeType !== "Todos" ? activeType : undefined,
        search ? search : undefined
      );
      setMovements(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar movimientos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      loadMovements();
    }, 300);
    return () => clearTimeout(timer);
  }, [activeType, search]);

  const handleOpenCreate = () => {
    navigate("/dashboard/inventory-movements/create");
  };

  const handleViewDetails = (mov: InventoryMovement) => {
    navigate(`/dashboard/inventory-movements/${mov.id}`);
  };

  return (
    <div className="im-page">
      <div className="im-header">
        <div className="im-search-wrapper">
          <span className="im-search-icon">
            <IconSearch />
          </span>
          <input
            className="im-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código..."
          />
        </div>
        <button className="im-add-btn" onClick={handleOpenCreate}>
          <IconPlus /> Crear Movimiento
        </button>
      </div>

      <div className="im-filters">
        <span className="im-filter-label">Tipo:</span>
        {TYPES.map((t) => (
          <span
            key={t}
            className={`im-chip ${activeType === t ? "im-chip--active" : ""}`}
            onClick={() => setActiveType(t)}
          >
            {t}
          </span>
        ))}
        <span className="im-count">({movements.length} registros)</span>
      </div>

      {error && <div className="im-error">{error}</div>}

      <div className="im-table-wrapper">
        {loading ? (
          <div className="im-loading">Cargando movimientos…</div>
        ) : movements.length === 0 ? (
          <div className="im-empty">No se encontraron movimientos.</div>
        ) : (
          <table className="im-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Tipo</th>
                <th>Concepto</th>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id} className="im-table-row">
                  <td className="im-code">{m.code}</td>
                  <td>
                    <span className={`im-type-badge im-type-badge--${m.type.toLowerCase()}`}>
                      {m.type}
                    </span>
                  </td>
                  <td>{m.concept}</td>
                  <td>{new Date(m.created_at).toLocaleString()}</td>
                  <td>{m.user_name || "Sistema"}</td>
                  <td>
                    <button className="im-action-btn" onClick={() => handleViewDetails(m)}>
                      <IconEye /> Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
