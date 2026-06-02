import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGetProducts } from "../../services/api";
import type { ProductFromAPI } from "../../services/api";
import "./Inventario.css";

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

  return (
    <div className="inventario-page">
      <div className="inventario-header">
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
    </div>
  );
}
