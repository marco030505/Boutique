import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGetProducts } from "../../services/api";
import type { ProductFromAPI } from "../../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Inventario.css";

const IconFileText = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const IconSearch = () => (
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
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function Inventario() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<ProductFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Report Modal States
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportProductId, setReportProductId] = useState("all");
  const [generatingReport, setGeneratingReport] = useState(false);

  const loadProducts = async () => {
    setError("");
    try {
      setLoading(true);
      const data = await apiGetProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar el inventario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase();
    return products.filter((p) => {
      return (
        p.name.toLowerCase().includes(term) ||
        p.product_code.toLowerCase().includes(term)
      );
    });
  }, [products, search]);

  const getStatus = (stock: number, minStock: number) => {
    if (stock <= 0) return { label: "Agotado", className: "status-agotado" };
    if (stock <= minStock) return { label: "Bajo", className: "status-bajo" };
    return { label: "Óptimo", className: "status-optimo" };
  };

  const generatePDFReport = () => {
    setGeneratingReport(true);
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text("Memo's Style & Lucia Fashion", 14, 22);
      
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text("Reporte de Inventario Actual", 14, 30);

      doc.setFontSize(10);
      doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 14, 38);
      
      let filterText = "Filtro aplicado: ";
      if (reportProductId !== "all") {
        const prod = products.find(p => p.id.toString() === reportProductId);
        filterText += `Producto: ${prod?.name || "Desconocido"}`;
      } else {
        filterText += "Todos los productos";
      }
      doc.text(filterText, 14, 44);

      // Extract Data
      let totalItems = 0;
      const tableRows: any[] = [];

      // Filter products based on selection
      const reportProducts = reportProductId === "all" 
        ? products 
        : products.filter(p => p.id.toString() === reportProductId);

      // Flatten by sizes
      reportProducts.forEach(p => {
        if (!p.manage_stock) return; // Skip non-inventariable

        if (p.sizes && p.sizes.length > 0) {
          p.sizes.forEach(sizeObj => {
            const qty = Number(sizeObj.stock) || 0;
            totalItems += qty;
            tableRows.push([
              p.product_code,
              p.name,
              sizeObj.size,
              qty.toString()
            ]);
          });
        } else {
          // Fallback if no sizes array but manage_stock is true
          const qty = Number(p.stock) || 0;
          totalItems += qty;
          tableRows.push([
            p.product_code,
            p.name,
            "Única",
            qty.toString()
          ]);
        }
      });

      // Add summary row
      tableRows.push([
        "",
        "",
        "TOTAL INVENTARIO:",
        totalItems.toString()
      ]);

      autoTable(doc, {
        startY: 50,
        head: [['Código', 'Producto', 'Talla', 'Cantidad']],
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
        }
      });

      // Footer
      const finalY = (doc as any).lastAutoTable.finalY || 50;
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.setFont("helvetica", "bold");
      doc.text(`Total general de piezas en existencia: ${totalItems}`, 14, finalY + 10);

      doc.save("reporte-inventario.pdf");
      setShowReportModal(false);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error al generar el PDF.");
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div className="inventario-page">
      <div className="inventario-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="inventario-search-wrapper">
          <span className="inventario-search-icon">
            <IconSearch />
          </span>
          <input
            className="inventario-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código del producto..."
          />
        </div>
        <button 
          className="inv-action-btn" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--color-gold-500)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}
          onClick={() => setShowReportModal(true)}
        >
          <IconFileText /> Generar Reporte PDF
        </button>
      </div>

      {error && <div className="inventario-error">{error}</div>}

      <div className="inventario-table-wrapper">
        {loading ? (
          <div className="inventario-loading">Cargando inventario...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="inventario-empty">No se encontraron productos.</div>
        ) : (
          <table className="inventario-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre del Producto</th>
                <th>Maneja Stock</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const status = getStatus(p.stock, p.min_stock);
                return (
                  <tr key={p.id}>
                    <td>{p.product_code}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.manage_stock ? "Sí" : "No"}</td>
                    <td>
                      {p.manage_stock ? (
                        <strong>{p.stock}</strong>
                      ) : (
                        <span style={{ color: "var(--color-text-muted)" }}>N/A</span>
                      )}
                    </td>
                    <td>
                      {p.manage_stock ? (
                        p.min_stock
                      ) : (
                        <span style={{ color: "var(--color-text-muted)" }}>N/A</span>
                      )}
                    </td>
                    <td>
                      {p.manage_stock ? (
                        <span className={`inv-status ${status.className}`}>
                          {status.label}
                        </span>
                      ) : (
                        <span className="inv-status" style={{ background: "transparent", color: "var(--color-text-muted)" }}>
                          N/A
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        className="inv-action-btn"
                        onClick={() => navigate(`/dashboard/inventario/editar/${p.id}`)}
                      >
                        Ver Detalle / Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="payment-modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'left', padding: '24px', maxWidth: '450px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--color-text-primary)' }}>Generar Reporte de Inventario</h3>
            
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Este reporte mostrará el stock <strong>actual</strong> en bodega desglosado por tallas.
            </p>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Filtrar por Producto</label>
              <select 
                value={reportProductId}
                onChange={(e) => setReportProductId(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}
              >
                <option value="all">Todos los productos</option>
                {products.filter(p => p.manage_stock).map(p => (
                  <option key={p.id} value={p.id}>{p.product_code} - {p.name}</option>
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
