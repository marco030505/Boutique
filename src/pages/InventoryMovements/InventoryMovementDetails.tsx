import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGetInventoryMovementDetails } from "../../services/api";
import type { InventoryMovement } from "../../services/api";
import "./InventoryMovements.css";

export default function InventoryMovementDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [movement, setMovement] = useState<InventoryMovement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    apiGetInventoryMovementDetails(Number(id))
      .then(setMovement)
      .catch((err: any) => setError(err.message || "Error al cargar detalles"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="im-page"><div className="im-loading">Cargando detalles...</div></div>;
  if (error) return <div className="im-page"><div className="im-error">{error}</div></div>;
  if (!movement) return <div className="im-page"><div className="im-empty">Movimiento no encontrado.</div></div>;

  return (
    <div className="im-page">
      <div className="im-header">
        <h2>Detalles del Movimiento: {movement.code}</h2>
        <button className="im-btn-secondary" onClick={() => navigate("/dashboard/inventory-movements")}>
          Volver
        </button>
      </div>

      <div className="im-form-container">
        <div className="im-form-grid" style={{ marginBottom: 0 }}>
          <div className="im-form-group">
            <label>Código</label>
            <div className="im-detail-value"><strong>{movement.code}</strong></div>
          </div>
          <div className="im-form-group">
            <label>Tipo</label>
            <div className="im-detail-value">
              <span className={`im-type-badge im-type-badge--${movement.type.toLowerCase()}`}>
                {movement.type}
              </span>
            </div>
          </div>
          <div className="im-form-group">
            <label>Concepto</label>
            <div className="im-detail-value">{movement.concept}</div>
          </div>
          <div className="im-form-group">
            <label>Fecha</label>
            <div className="im-detail-value">{new Date(movement.created_at).toLocaleString()}</div>
          </div>
          <div className="im-form-group">
            <label>Usuario Responsable</label>
            <div className="im-detail-value">{movement.user_name || "Sistema"}</div>
          </div>
        </div>

        <div className="im-items-section" style={{ marginTop: '2rem' }}>
          <h3>Productos Afectados</h3>
          <table className="im-table" style={{ marginTop: '1rem' }}>
            <thead>
              <tr>
                <th>Código Producto</th>
                <th>Nombre</th>
                <th>Talla</th>
                <th>Cantidad Movida</th>
              </tr>
            </thead>
            <tbody>
              {movement.items?.map(item => (
                <tr key={item.id} className="im-table-row">
                  <td>{item.product_code}</td>
                  <td>{item.product_name}</td>
                  <td>{item.size}</td>
                  <td>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
