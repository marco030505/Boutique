import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGetSaleDetails } from "../../services/api";
import "./VentaDetalle.css";

const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

export default function VentaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [sale, setSale] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadSaleDetails(parseInt(id));
    }
  }, [id]);

  const loadSaleDetails = async (saleId: number) => {
    setLoading(true);
    try {
      const data = await apiGetSaleDetails(saleId);
      setSale(data.sale);
      setItems(data.items);
    } catch (err: any) {
      setError(err.message || "Error al cargar la venta");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="venta-detalle-page" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Cargando detalles de la venta...</p>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="venta-detalle-page" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#e57373' }}>{error || "Venta no encontrada"}</p>
        <button className="vd-back-btn" onClick={() => navigate('/dashboard/historial-ventas')} style={{ marginTop: '16px' }}>
          Volver al Historial
        </button>
      </div>
    );
  }

  const subtotal = items.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="venta-detalle-page">
      <div className="vd-header">
        <button className="vd-back-btn" onClick={() => navigate('/dashboard/historial-ventas')}>
          <IconArrowLeft /> Volver
        </button>
        <h2>Detalles de Venta #{sale.id}</h2>
      </div>

      <div className="vd-content">
        <div className="vd-card">
          <h3 className="vd-card-title">Información General</h3>
          <div className="vd-info-grid">
            <div className="vd-info-item">
              <span className="vd-info-label">Folio de Venta</span>
              <span className="vd-info-value">#{sale.id}</span>
            </div>
            <div className="vd-info-item">
              <span className="vd-info-label">Fecha</span>
              <span className="vd-info-value">{new Date(sale.created_at).toLocaleString()}</span>
            </div>
            <div className="vd-info-item">
              <span className="vd-info-label">Cliente</span>
              <span className="vd-info-value">{sale.customer_name || "Público en General"}</span>
            </div>
            <div className="vd-info-item">
              <span className="vd-info-label">Vendedor</span>
              <span className="vd-info-value">{sale.seller_name || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="vd-card">
          <h3 className="vd-card-title">Artículos Vendidos</h3>
          <div className="vd-table-container">
            <table className="vd-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Talla</th>
                  <th>Precio Unitario</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.product_code}</td>
                    <td>{item.name}</td>
                    <td>{item.size}</td>
                    <td>${parseFloat(item.price).toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="vd-totals">
            <div className="vd-total-row">
              <span>Total de Artículos:</span>
              <span>{totalItems}</span>
            </div>
            <div className="vd-total-row">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="vd-total-final">
              <span>Total:</span>
              <span>${parseFloat(sale.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
