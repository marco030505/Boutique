import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  apiDeleteProduct,
  apiGetProducts,
} from "../../services/api";
import type { ProductFromAPI } from "../../services/api";
import "./Productos.css";

const CATEGORIES = [
  "Vestidos",
  "Blusas",
  "Camisas",
  "Pantalones",
  "Faldas",
  "Shorts",
];
const GENDERS = ["Todos", "Damas", "Caballeros", "Unisex"];
const STATUS = ["Todos", "activo", "inactivo", "agotado"];

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
const IconPlus = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconEdit = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);
const IconTrash = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export default function Productos() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [activeGender, setActiveGender] = useState<string>("Todos");
  const [activeStatus, setActiveStatus] = useState<string>("Todos");

  const [products, setProducts] = useState<ProductFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    setError("");
    try {
      setLoading(true);
      const data = await apiGetProducts({
        category: activeCategory !== "Todos" ? activeCategory : undefined,
        gender: activeGender !== "Todos" ? activeGender : undefined,
        status: activeStatus !== "Todos" ? activeStatus : undefined,
      });
      setProducts(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [activeCategory, activeGender, activeStatus]);

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase();
    return products.filter((p) => {
      const matches =
        p.name.toLowerCase().includes(term) ||
        p.product_code.toLowerCase().includes(term);
      return matches;
    });
  }, [products, search]);

  const handleOpenCreate = () => {
    navigate("/dashboard/productos/nuevo");
  };

  const handleOpenEdit = (product: ProductFromAPI) => {
    navigate(`/dashboard/productos/editar/${product.id}`);
  };

  const handleDelete = async (product: ProductFromAPI) => {
    if (product.status === "inactivo") return;
    try {
      await apiDeleteProduct(product.id);
      loadProducts();
    } catch (err: any) {
      setError(err.message || "Error al eliminar el producto");
    }
  };

  return (
    <div className="productos-page">
      <div className="productos-header">
        <div className="productos-search-wrapper">
          <span className="productos-search-icon">
            <IconSearch />
          </span>
          <input
            className="productos-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código..."
          />
        </div>
        <button className="productos-add-btn" onClick={handleOpenCreate}>
          <IconPlus /> Agregar Producto
        </button>
      </div>

      <div className="productos-filters">
        <span className="productos-filter-label">Estado:</span>
        {STATUS.map((s) => (
          <span
            key={s}
            className={`productos-chip ${activeStatus === s ? "productos-chip--active" : ""}`}
            onClick={() => setActiveStatus(s)}
          >
            {s}
          </span>
        ))}

        <span className="productos-filter-label">Género:</span>
        {GENDERS.map((g) => (
          <span
            key={g}
            className={`productos-chip ${activeGender === g ? "productos-chip--active" : ""}`}
            onClick={() => setActiveGender(g)}
          >
            {g}
          </span>
        ))}

        <span className="productos-filter-label">Categoría:</span>
        <span
          className={`productos-chip ${activeCategory === "Todos" ? "productos-chip--active" : ""}`}
          onClick={() => setActiveCategory("Todos")}
        >
          Todos
        </span>
        {CATEGORIES.map((c) => (
          <span
            key={c}
            className={`productos-chip ${activeCategory === c ? "productos-chip--active" : ""}`}
            onClick={() => setActiveCategory(c)}
          >
            {c}
          </span>
        ))}

        <span className="productos-count">
          ({filteredProducts.length} productos)
        </span>
      </div>

      {error && <div className="productos-error">{error}</div>}

      <div className="productos-grid-wrapper">
        {loading ? (
          <div className="productos-loading">Cargando productos…</div>
        ) : filteredProducts.length === 0 ? (
          <div className="productos-empty">No se encontraron productos.</div>
        ) : (
          <div className="productos-grid">
            {filteredProducts.map((p) => (
              <div key={p.id} className="product-card">
                <div className="product-card-image-wrap">
                  <img
                    src={p.image || "/images/dresses.png"}
                    alt={p.name}
                    className="product-card-image"
                  />
                  <span
                    className={`product-card-status product-card-status--${p.status}`}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="product-card-info">
                  <span className="product-card-category">{p.category}</span>
                  <span className="product-card-name">{p.name}</span>
                  <span className="product-card-sku">
                    COD: {p.product_code}
                  </span>
                  <div className="product-card-meta">
                    <span>Costo: ${p.cost.toFixed(2)}</span>
                    <span>Precio: ${p.price.toFixed(2)}</span>
                  </div>
                  <div className="product-card-meta">
                    <span>
                      {p.manage_stock ? `Stock Total: ${p.stock}` : "No maneja stock"}
                    </span>
                    <span>
                      {p.is_inventariable
                        ? "Inventariable"
                        : "No inventariable"}
                    </span>
                  </div>
                </div>
                <div className="product-card-actions">
                  <button
                    className="product-action-btn"
                    onClick={() => handleOpenEdit(p)}
                  >
                    <IconEdit /> Editar
                  </button>
                  <button
                    className="product-action-btn product-action-btn--danger"
                    onClick={() => handleDelete(p)}
                  >
                    <IconTrash /> Inactivar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
