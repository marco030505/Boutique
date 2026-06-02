import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGetInventoryMovements, apiGetInventoryMovementsReport, apiGetUsers } from "../../services/api";
import type { InventoryMovement } from "../../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./InventoryMovements.css";

const IconFileText = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

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

  // Report Modal States
  const [showReportModal, setShowReportModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [reportUserId, setReportUserId] = useState("all");
  const [reportType, setReportType] = useState("Todos");
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersData = await apiGetUsers();
      setUsers(usersData);
    } catch (err) {
      console.error("Error al cargar usuarios", err);
    }
  };

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

  const generatePDFReport = async () => {
    setGeneratingReport(true);
    try {
      // 1. Fetch filtered detailed data
      const filters: any = {};
      if (reportStartDate) filters.startDate = reportStartDate;
      if (reportEndDate) filters.endDate = reportEndDate;
      if (reportUserId && reportUserId !== "all") filters.userId = reportUserId;
      if (reportType && reportType !== "Todos") filters.type = reportType;

      const reportData = await apiGetInventoryMovementsReport(filters);

      // 2. Initialize PDF
      const doc = new jsPDF();
      
      // 3. Header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text("Memo's Style & Lucia Fashion", 14, 22);
      
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text("Reporte de Movimientos de Inventario", 14, 30);

      doc.setFontSize(10);
      doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 14, 38);
      
      let filterText = "Filtros aplicados: ";
      const activeFilters = [];
      if (reportStartDate) activeFilters.push(`Desde: ${reportStartDate}`);
      if (reportEndDate) activeFilters.push(`Hasta: ${reportEndDate}`);
      if (reportUserId !== "all") {
        const userName = users.find(u => u.id.toString() === reportUserId)?.name || "Usuario Específico";
        activeFilters.push(`Usuario: ${userName}`);
      } else {
        activeFilters.push("Usuario: Todos");
      }
      activeFilters.push(`Tipo: ${reportType}`);
      
      doc.text(filterText + activeFilters.join(" | "), 14, 44);

      // 4. Table Data & Calculations
      let totalEntradas = 0;
      let totalSalidas = 0;

      const tableRows = reportData.map((row: any) => {
        const qty = parseInt(row.quantity, 10);
        if (row.movement_type === 'Entrada') {
          totalEntradas += qty;
        } else if (row.movement_type === 'Salida') {
          totalSalidas += qty;
        }

        return [
          new Date(row.date).toLocaleDateString(),
          row.code,
          row.movement_type,
          row.product_name || "N/A",
          row.size || "N/A",
          row.quantity,
          row.user_name || "Sistema"
        ];
      });

      autoTable(doc, {
        startY: 50,
        head: [['Fecha', 'Código', 'Tipo', 'Producto', 'Talla', 'Cantidad', 'Usuario']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [212, 168, 67], textColor: [255, 255, 255] },
        styles: { fontSize: 8 },
      });

      // 5. Footer summary
      const finalY = (doc as any).lastAutoTable.finalY || 50;
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.setFont("helvetica", "bold");
      
      let summaryY = finalY + 10;
      doc.text(`Total de Artículos Movidos:`, 14, summaryY);
      
      doc.setFont("helvetica", "normal");
      if (reportType === "Todos" || reportType === "Entrada") {
        summaryY += 6;
        doc.text(`Entradas: ${totalEntradas} unidades`, 14, summaryY);
      }
      if (reportType === "Todos" || reportType === "Salida") {
        summaryY += 6;
        doc.text(`Salidas: ${totalSalidas} unidades`, 14, summaryY);
      }

      // 6. Save PDF
      doc.save("reporte-movimientos.pdf");
      setShowReportModal(false);

    } catch (error) {
      console.error("Error al generar el reporte PDF:", error);
      alert("Hubo un error al generar el reporte. Inténtelo de nuevo.");
    } finally {
      setGeneratingReport(false);
    }
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
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="im-btn-secondary" onClick={() => setShowReportModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconFileText /> Reporte PDF
          </button>
          <button className="im-add-btn" onClick={handleOpenCreate}>
            <IconPlus /> Crear Movimiento
          </button>
        </div>
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

      {/* Report Filters Modal */}
      {showReportModal && (
        <div className="payment-modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'left', padding: '24px', maxWidth: '450px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--color-text-primary)' }}>Generar Reporte de Inventario</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Desde (Fecha de Inicio)</label>
              <input 
                type="date"
                value={reportStartDate}
                onChange={(e) => setReportStartDate(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Hasta (Fecha de Fin)</label>
              <input 
                type="date"
                value={reportEndDate}
                onChange={(e) => setReportEndDate(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Filtrar por Usuario</label>
              <select 
                value={reportUserId}
                onChange={(e) => setReportUserId(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}
              >
                <option value="all">Todos los usuarios</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Tipo de Movimiento</label>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}
              >
                {TYPES.map(t => (
                  <option key={t} value={t}>{t === "Todos" ? "Entradas y Salidas" : t}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowReportModal(false)}
                style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={generatePDFReport}
                disabled={generatingReport}
                style={{ flex: 1, padding: '10px', background: 'var(--color-gold-500)', border: 'none', color: '#000', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {generatingReport ? "Generando..." : "Descargar PDF"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
