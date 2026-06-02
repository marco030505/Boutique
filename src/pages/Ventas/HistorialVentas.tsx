import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGetSales, apiGetUsers } from "../../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./HistorialVentas.css";

const IconFileText = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

export default function HistorialVentas() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Report Modal States
  const [showReportModal, setShowReportModal] = useState(false);
  const [sellers, setSellers] = useState<any[]>([]);
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [reportSellerId, setReportSellerId] = useState("all");
  const [generatingReport, setGeneratingReport] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadSales();
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      const users = await apiGetUsers();
      // Filter only sellers if needed, or keep all to allow filtering by any user who made a sale
      setSellers(users);
    } catch (err) {
      console.error("Error al cargar vendedores para el reporte", err);
    }
  };

  const loadSales = async () => {
    setLoading(true);
    try {
      const data = await apiGetSales();
      setSales(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDFReport = async () => {
    setGeneratingReport(true);
    try {
      // 1. Fetch filtered data
      const filters: any = {};
      if (reportStartDate) filters.startDate = reportStartDate;
      if (reportEndDate) filters.endDate = reportEndDate;
      if (reportSellerId && reportSellerId !== "all") filters.sellerId = reportSellerId;

      const reportData = await apiGetSales(filters);

      // 2. Initialize PDF
      const doc = new jsPDF();
      
      // 3. Header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text("Memo's Style & Lucia Fashion", 14, 22);
      
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text("Reporte de Ventas", 14, 30);

      doc.setFontSize(10);
      doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 14, 38);
      
      let filterText = "Filtros aplicados: ";
      const activeFilters = [];
      if (reportStartDate) activeFilters.push(`Desde: ${reportStartDate}`);
      if (reportEndDate) activeFilters.push(`Hasta: ${reportEndDate}`);
      if (reportSellerId !== "all") {
        const sellerName = sellers.find(s => s.id.toString() === reportSellerId)?.name || "Vendedor Específico";
        activeFilters.push(`Vendedor: ${sellerName}`);
      } else {
        activeFilters.push("Vendedor: Todos");
      }
      
      doc.text(filterText + activeFilters.join(" | "), 14, 44);

      // 4. Table Data
      const tableRows = reportData.map(sale => [
        new Date(sale.created_at).toLocaleDateString(),
        `#${sale.id}`,
        sale.customer_name || "Público en General",
        sale.seller_name || "N/A",
        `$${parseFloat(sale.total).toFixed(2)}`
      ]);

      const totalVentas = reportData.length;
      const montoTotal = reportData.reduce((acc, sale) => acc + parseFloat(sale.total), 0);

      // Add summary row at the end of the table
      tableRows.push([
        "",
        "",
        "",
        "TOTAL ACUMULADO:",
        `$${montoTotal.toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: 50,
        head: [['Fecha', 'Código Venta', 'Cliente', 'Vendedor', 'Total']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [212, 168, 67], textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
        willDrawCell: function (data) {
          // Highlight the last row (totals)
          if (data.row.index === tableRows.length - 1) {
            doc.setFillColor(240, 240, 240);
            doc.setFont("helvetica", "bold");
          }
        },
      });

      // 5. Footer summary
      const finalY = (doc as any).lastAutoTable.finalY || 50;
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.setFont("helvetica", "bold");
      doc.text(`Total de Ventas Registradas en el periodo: ${totalVentas}`, 14, finalY + 10);

      // 6. Save PDF
      doc.save("reporte-ventas.pdf");
      setShowReportModal(false);

    } catch (error) {
      console.error("Error al generar el reporte PDF:", error);
      alert("Hubo un error al generar el reporte. Inténtelo de nuevo.");
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="historial-page" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Cargando historial de ventas...</p>
      </div>
    );
  }

  return (
    <div className="historial-page">
      <div className="historial-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Historial de Ventas</h2>
        <button 
          className="historial-btn" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => setShowReportModal(true)}
        >
          <IconFileText /> Generar Reporte PDF
        </button>
      </div>

      <div className="historial-list-container">
        {sales.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)", textAlign: "center", marginTop: "40px" }}>
            No hay ventas registradas.
          </p>
        ) : (
          <table className="historial-table">
            <thead>
              <tr>
                <th>Código / Folio</th>
                <th>Cliente</th>
                <th>Artículos</th>
                <th>Total</th>
                <th>Vendedor</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td style={{ fontWeight: 600, color: "var(--color-gold-400)" }}>#{sale.id}</td>
                  <td>{sale.customer_name || "Público en General"}</td>
                  <td>{sale.total_items || 0}</td>
                  <td>${parseFloat(sale.total).toFixed(2)}</td>
                  <td>{sale.seller_name || "N/A"}</td>
                  <td>{new Date(sale.created_at).toLocaleString()}</td>
                  <td>
                    <button 
                      className="historial-btn"
                      onClick={() => navigate(`/dashboard/historial-ventas/${sale.id}`)}
                    >
                      Detalle de Venta
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
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--color-text-primary)' }}>Generar Reporte de Ventas</h3>
            
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

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Filtrar por Vendedor</label>
              <select 
                value={reportSellerId}
                onChange={(e) => setReportSellerId(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}
              >
                <option value="all">Todos los vendedores</option>
                {sellers.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
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
