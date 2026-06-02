import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  apiCreateProduct,
  apiGetProducts,
  apiUpdateProduct,
  type ProductPayload,
} from "../../services/api";
import "./ProductForm.css";

const CATEGORIES = [
  "Vestidos",
  "Blusas",
  "Camisas",
  "Pantalones",
  "Faldas",
  "Shorts",
];
const GENDERS = ["Damas", "Caballeros", "Unisex"];
const STATUS = ["activo", "inactivo", "agotado"];

const emptyForm: ProductPayload = {
  name: "",
  cost: 0,
  price: 0,
  category: CATEGORIES[0],
  gender: "Damas",
  sizes: [
    { size: "S", stock: 0 },
    { size: "M", stock: 0 },
    { size: "L", stock: 0 },
  ],
  stock: 0,
  minStock: 5,
  image: "",
  isInventariable: true,
  manageStock: true,
  status: "activo",
};

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [form, setForm] = useState<ProductPayload>(emptyForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditing) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      // We don't have a GET /products/:id in api.ts, but we have apiGetProducts()
      // so we can fetch all and find the one. Or if there are many, it might be slow.
      // Let's assume apiGetProducts is fine for now, or just get all and filter.
      const data = await apiGetProducts();
      const product = data.find((p) => p.id === Number(id));

      if (!product) {
        throw new Error("Producto no encontrado");
      }

      setForm({
        name: product.name,
        cost: product.cost,
        price: product.price,
        category: product.category,
        gender: product.gender,
        sizes: product.sizes,
        stock: product.stock,
        minStock: product.min_stock,
        image: product.image ?? "",
        isInventariable: product.is_inventariable,
        manageStock: product.manage_stock,
        status: product.status,
      });
    } catch (err: any) {
      setError(err.message || "Error al cargar el producto");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSize = () => {
    setForm((p) => ({ ...p, sizes: [...p.sizes, { size: "", stock: 0 }] }));
  };

  const handleRemoveSize = (index: number) => {
    setForm((p) => ({
      ...p,
      sizes: p.sizes.filter((_, i) => i !== index),
    }));
  };

  const handleSizeChange = (index: number, value: string) => {
    setForm((p) => {
      const newSizes = [...p.sizes];
      newSizes[index] = { ...newSizes[index], size: value };
      return { ...p, sizes: newSizes };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (isEditing) {
        await apiUpdateProduct(Number(id), form);
      } else {
        await apiCreateProduct(form);
      }
      navigate("/dashboard/productos");
    } catch (err: any) {
      setError(err.message || "Error al guardar el producto");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="product-form-page">
        <p>Cargando información del producto...</p>
      </div>
    );
  }

  return (
    <div className="product-form-page">
      <div className="product-form-header">
        <h2>{isEditing ? "Editar Producto" : "Nuevo Producto"}</h2>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="product-form-container">
        <form onSubmit={handleSubmit} className="product-form-grid">
          <div className="product-form-row full-width">
            <label>Nombre del Producto</label>
            <input
              required
              placeholder="Ej. Camisa de lino"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>

          <div className="product-form-row">
            <label>Categoría</label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((p) => ({ ...p, category: e.target.value }))
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="product-form-row">
            <label>Género</label>
            <select
              value={form.gender}
              onChange={(e) =>
                setForm((p) => ({ ...p, gender: e.target.value }))
              }
            >
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="product-form-row">
            <label>Costo de Compra ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={form.cost}
              onChange={(e) =>
                setForm((p) => ({ ...p, cost: Number(e.target.value) }))
              }
            />
          </div>

          <div className="product-form-row">
            <label>Precio de Venta ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={form.price}
              onChange={(e) =>
                setForm((p) => ({ ...p, price: Number(e.target.value) }))
              }
            />
          </div>

          <div className="product-form-row full-width">
            <label>Tallas Disponibles</label>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "12px" }}>
              Define qué tallas manejará este producto. El stock inicial será 0 y las entradas o salidas se registrarán desde Movimientos de Inventario para mantener un control exacto.
            </p>
            {form.sizes.map((sz, i) => (
              <div key={i} className="size-item">
                <input
                  placeholder="Nombre de talla (ej. S, M, L, XL, 32, 34)"
                  value={sz.size}
                  onChange={(e) => handleSizeChange(i, e.target.value)}
                  required
                />
                <div style={{ padding: "0 12px", color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>

                </div>
                <button
                  type="button"
                  className="btn-remove-size"
                  onClick={() => handleRemoveSize(i)}
                  title="Eliminar talla"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-add-size"
              onClick={handleAddSize}
            >
              + Agregar otra talla
            </button>
          </div>

          <div className="product-form-row full-width">
            <label>URL de Imagen (Opcional)</label>
            <input
              placeholder="https://..."
              value={form.image ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, image: e.target.value }))
              }
            />
          </div>

          <div className="product-form-row">
            <label>Estado</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((p) => ({ ...p, status: e.target.value }))
              }
            >
              {STATUS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="product-form-row">
            <label>Manejo de inventario activo</label>
            <select
              value={form.manageStock ? "si" : "no"}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  manageStock: e.target.value === "si",
                }))
              }
            >
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </div>

          <div className="product-form-actions full-width">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate("/dashboard/productos")}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
