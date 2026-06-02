import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGetProducts, apiUpdateProduct, type ProductFromAPI } from "../../services/api";
import "./InventarioForm.css";

export default function InventarioForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState<ProductFromAPI | null>(null);
  const [minStock, setMinStock] = useState<number>(5);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await apiGetProducts();
      const found = data.find((p) => p.id === Number(id));

      if (!found) {
        throw new Error("Producto no encontrado");
      }

      setProduct(found);
      setMinStock(found.min_stock);
    } catch (err: any) {
      setError(err.message || "Error al cargar el producto");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setSaving(true);
    setError("");

    try {
      // Send a partial update if your API supports it, 
      // or send the full object with the updated minStock
      await apiUpdateProduct(product.id, {
        name: product.name,
        cost: product.cost,
        price: product.price,
        category: product.category,
        gender: product.gender,
        sizes: product.sizes,
        stock: product.stock,
        minStock: minStock,
        image: product.image ?? "",
        isInventariable: product.is_inventariable,
        manageStock: product.manage_stock,
        status: product.status,
      });
      navigate("/dashboard/inventario");
    } catch (err: any) {
      setError(err.message || "Error al actualizar el stock mínimo");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="inv-form-page">
        <p>Cargando información del inventario...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="inv-form-page">
        <div className="inventario-error">No se encontró el producto.</div>
        <button className="btn btn-ghost" onClick={() => navigate("/dashboard/inventario")}>
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="inv-form-page">
      <div className="inv-form-header">
        <h2>Detalle de Inventario</h2>
        <p>Consulta el stock por talla y configura las alertas de inventario.</p>
      </div>

      {error && <div className="inventario-error">{error}</div>}

      <div className="inv-form-container">
        <div className="inv-summary">
          <div className="inv-summary-item">
            <span className="label">Producto</span>
            <span className="value">{product.name}</span>
          </div>
          <div className="inv-summary-item">
            <span className="label">Código</span>
            <span className="value">{product.product_code}</span>
          </div>
          <div className="inv-summary-item">
            <span className="label">Stock Total</span>
            <span className="value">{product.manage_stock ? product.stock : "N/A"}</span>
          </div>
        </div>

        {product.manage_stock && (
          <div className="inv-sizes-section">
            <h3>Stock por Talla</h3>
            {product.sizes.length > 0 ? (
              <div className="inv-sizes-grid">
                {product.sizes.map((sz, i) => (
                  <div key={i} className="inv-size-card">
                    <span className="size-name">{sz.size}</span>
                    <span className="size-stock">{sz.stock} unds.</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--color-text-secondary)" }}>
                Este producto no tiene tallas registradas.
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="inv-edit-section">
          <label>Configurar Stock Mínimo (Alerta)</label>
          <input
            type="number"
            min="0"
            required
            value={minStock}
            onChange={(e) => setMinStock(Number(e.target.value))}
            disabled={!product.manage_stock}
          />
          <span className="inv-edit-help">
            Recibirás una alerta cuando el stock total llegue a este nivel. (Predeterminado: 5)
          </span>

          <div className="inv-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate("/dashboard/inventario")}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving || !product.manage_stock}
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
