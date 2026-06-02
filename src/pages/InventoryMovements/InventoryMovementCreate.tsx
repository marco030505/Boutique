import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiCreateInventoryMovement, apiGetProducts } from "../../services/api";
import type { ProductFromAPI } from "../../services/api";
import "./InventoryMovements.css";

const CONCEPTS = {
  Entrada: ["Entrada Inicial", "Entrada por compra", "Entrada por devolución", "Otro"],
  Salida: ["Salida por concepto", "Dañado", "Descontinuado", "Ajuste de inventario", "Otro"]
};

export default function InventoryMovementCreate() {
  const navigate = useNavigate();
  const [type, setType] = useState<"Entrada" | "Salida">("Entrada");
  const [concept, setConcept] = useState<string>("Entrada Inicial");
  const [customConcept, setCustomConcept] = useState("");

  const [products, setProducts] = useState<ProductFromAPI[]>([]);
  
  // Item Adder State
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  // Cart / Items List
  const [items, setItems] = useState<Array<{
    productId: number;
    productName: string;
    productCode: string;
    size: string;
    quantity: number;
    availableStock: number;
  }>>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Reset concept when type changes
    setConcept(CONCEPTS[type][0]);
  }, [type]);

  useEffect(() => {
    // Load products
    apiGetProducts().then(setProducts).catch(console.error);
  }, []);

  const selectedProduct = products.find(p => p.id.toString() === selectedProductId);
  
  const handleAddItem = () => {
    if (!selectedProduct || !selectedSize || quantity <= 0) return;

    // Validation for Salida
    const sizeStock = selectedProduct.sizes.find(s => s.size === selectedSize)?.stock || 0;
    if (type === "Salida" && selectedProduct.manage_stock && sizeStock < quantity) {
      alert(`Stock insuficiente. Stock disponible para talla ${selectedSize}: ${sizeStock}`);
      return;
    }

    setItems([...items, {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productCode: selectedProduct.product_code,
      size: selectedSize,
      quantity,
      availableStock: sizeStock
    }]);

    // Reset adder
    setSelectedProductId("");
    setSelectedSize("");
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      setError("Debe agregar al menos un producto al movimiento.");
      return;
    }

    const finalConcept = concept === "Otro" ? customConcept : concept;
    if (!finalConcept) {
      setError("Por favor ingrese un concepto.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const payload = {
        type,
        concept: finalConcept,
        items: items.map(item => ({
          productId: item.productId,
          size: item.size,
          quantity: item.quantity
        }))
      };

      await apiCreateInventoryMovement(payload);
      navigate("/dashboard/inventory-movements");
    } catch (err: any) {
      setError(err.message || "Error al crear el movimiento");
      setLoading(false);
    }
  };

  return (
    <div className="im-page">
      <h2>Crear Movimiento de Inventario</h2>
      
      <div className="im-form-container">
        <div className="im-form-grid">
          <div className="im-form-group">
            <label>Tipo de Movimiento</label>
            <select value={type} onChange={(e) => setType(e.target.value as "Entrada" | "Salida")}>
              <option value="Entrada">Entrada</option>
              <option value="Salida">Salida</option>
            </select>
          </div>
          
          <div className="im-form-group">
            <label>Concepto</label>
            <select value={concept} onChange={(e) => setConcept(e.target.value)}>
              {CONCEPTS[type].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {concept === "Otro" && (
              <input 
                style={{ marginTop: '0.5rem' }}
                placeholder="Especifique el concepto..." 
                value={customConcept} 
                onChange={(e) => setCustomConcept(e.target.value)} 
              />
            )}
          </div>
        </div>

        <div className="im-items-section">
          <div className="im-items-header">
            <h3>Productos del Movimiento</h3>
          </div>
          
          <div className="im-item-adder">
            <div className="im-form-group" style={{ flex: 2 }}>
              <label>Producto</label>
              <select 
                value={selectedProductId} 
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setSelectedSize("");
                }}
              >
                <option value="">-- Seleccionar Producto --</option>
                {products.filter(p => p.status !== "inactivo").map(p => (
                  <option key={p.id} value={p.id.toString()}>
                    [{p.product_code}] {p.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="im-form-group">
              <label>Talla</label>
              <select 
                value={selectedSize} 
                onChange={(e) => setSelectedSize(e.target.value)}
                disabled={!selectedProduct}
              >
                <option value="">-- Talla --</option>
                {selectedProduct?.sizes.map(s => (
                  <option key={s.size} value={s.size}>
                    {s.size} (Stock: {s.stock})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="im-form-group">
              <label>Cantidad</label>
              <input 
                type="number" 
                min="1" 
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))} 
                disabled={!selectedProduct || !selectedSize}
              />
            </div>
            
            <button 
              className="im-btn-secondary" 
              onClick={handleAddItem}
              disabled={!selectedProduct || !selectedSize || quantity <= 0}
            >
              Añadir
            </button>
          </div>

          {items.length > 0 ? (
            <table className="im-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Talla</th>
                  <th>Cantidad</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="im-table-row">
                    <td>{item.productCode}</td>
                    <td>{item.productName}</td>
                    <td>{item.size}</td>
                    <td>{item.quantity}</td>
                    <td>
                      <button className="im-action-btn" onClick={() => handleRemoveItem(index)}>
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="im-empty" style={{ padding: '1rem' }}>No hay productos añadidos aún.</div>
          )}
        </div>

        {error && <div className="im-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        <div className="im-actions">
          <button className="im-btn-secondary" onClick={() => navigate("/dashboard/inventory-movements")}>
            Cancelar
          </button>
          <button className="im-add-btn" onClick={handleSubmit} disabled={loading || items.length === 0}>
            {loading ? "Guardando..." : "Guardar Movimiento"}
          </button>
        </div>
      </div>
    </div>
  );
}
