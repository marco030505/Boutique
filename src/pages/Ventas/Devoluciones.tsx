import { useState, useEffect } from "react";
import {
  apiGetSales,
  apiGetReturns,
  apiGetSaleForReturn,
  apiCreateReturn,
  apiGetProducts,
  type ProductFromAPI
} from "../../services/api.ts";
import "./Devoluciones.css";

const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

export default function Devoluciones() {
  const [activeTab, setActiveTab] = useState("ventas");
  const [sales, setSales] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [processingSaleId, setProcessingSaleId] = useState<number | null>(null);
  const [saleDetails, setSaleDetails] = useState<any>(null);
  const [availableItems, setAvailableItems] = useState<any[]>([]);

  // The unified cart for the exchange
  const [exchangeCart, setExchangeCart] = useState<any[]>([]);

  // New Items Catalog
  const [catalogProducts, setCatalogProducts] = useState<ProductFromAPI[]>([]);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadLists = async () => {
    setLoading(true);
    try {
      const [salesData, returnsData] = await Promise.all([
        apiGetSales(),
        apiGetReturns()
      ]);
      setSales(salesData);
      setReturns(returnsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLists();
    apiGetProducts().then(setCatalogProducts).catch(console.error);
  }, []);

  const handleStartReturn = async (saleId: number) => {
    setErrorMsg("");
    setSuccessMsg("");
    setProcessingSaleId(saleId);
    try {
      const data = await apiGetSaleForReturn(saleId);
      setSaleDetails(data.sale);
      setAvailableItems(data.availableItems);
      
      // Preload cart with original items
      setExchangeCart(data.availableItems.map((i: any) => ({
        productId: i.product_id,
        name: i.name,
        price: i.price,
        size: i.size,
        quantity: i.available_quantity,
        isOriginal: true // flag just in case
      })));

    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || "Error al cargar datos de la venta.");
    }
  };

  const handleCancelReturn = () => {
    setProcessingSaleId(null);
    setSaleDetails(null);
    setAvailableItems([]);
    setExchangeCart([]);
    setErrorMsg("");
    setSuccessMsg("");
    loadLists();
  };

  const addItemToCart = (product: ProductFromAPI, size: string) => {
    setExchangeCart(prev => {
      const existing = prev.find(i => i.productId === product.id && i.size === size);
      if (existing) {
        return prev.map(i => i.productId === product.id && i.size === size ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, size, quantity: 1 }];
    });
  };

  const updateCartItemQty = (productId: number, size: string, delta: number) => {
    setExchangeCart(prev => {
      return prev.map(i => {
        if (i.productId === productId && i.size === size) {
          const newQ = i.quantity + delta;
          return newQ > 0 ? { ...i, quantity: newQ } : i;
        }
        return i;
      });
    });
  };

  const removeCartItem = (productId: number, size: string) => {
    setExchangeCart(prev => prev.filter(i => !(i.productId === productId && i.size === size)));
  };

  // Compute Totals
  const originalTotal = availableItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.available_quantity), 0);
  const cartTotal = exchangeCart.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
  const difference = cartTotal - originalTotal;

  // Compute Delta for API
  const computeDiff = () => {
    const returned: any[] = [];
    const added: any[] = [];

    const origMap = new Map();
    availableItems.forEach(i => origMap.set(`${i.product_id}-${i.size}`, i.available_quantity));

    const currMap = new Map();
    exchangeCart.forEach(i => currMap.set(`${i.productId}-${i.size}`, i.quantity));

    // Find returned
    availableItems.forEach(orig => {
      const key = `${orig.product_id}-${orig.size}`;
      const currQty = currMap.get(key) || 0;
      if (orig.available_quantity > currQty) {
        returned.push({ productId: orig.product_id, size: orig.size, quantity: orig.available_quantity - currQty });
      }
    });

    // Find added
    exchangeCart.forEach(curr => {
      const key = `${curr.productId}-${curr.size}`;
      const origQty = origMap.get(key) || 0;
      if (curr.quantity > origQty) {
        added.push({ productId: curr.productId, size: curr.size, quantity: curr.quantity - origQty });
      }
    });

    return { returned, added };
  };

  const handleSubmitReturn = async () => {
    setErrorMsg("");
    
    const { returned, added } = computeDiff();
    
    if (returned.length === 0 && added.length === 0) {
      setErrorMsg("No se ha modificado el carrito. No hay cambios para procesar.");
      return;
    }

    try {
      await apiCreateReturn({
        originalSaleId: processingSaleId!,
        returnedItems: returned,
        newItems: added
      });
      setSuccessMsg("Devolución procesada con éxito.");
      setTimeout(() => {
        handleCancelReturn();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || "Error al procesar.");
    }
  };

  if (processingSaleId) {
    return (
      <div className="devoluciones-page">
        <button className="back-btn" onClick={handleCancelReturn}><IconArrowLeft /> Volver</button>
        <h2 style={{ marginBottom: 16, color: 'var(--color-text-primary)' }}>Procesar Devolución (Venta #{processingSaleId})</h2>

        {errorMsg && <div style={{ color: '#e57373', marginBottom: 16 }}>{errorMsg}</div>}
        {successMsg && <div style={{ color: '#4caf7d', marginBottom: 16 }}>{successMsg}</div>}
        <div className="devolucion-process-container">
          {/* Panel Izquierdo: Catálogo y Resumen */}
          <div className="devolucion-panel">
            <div className="devolucion-panel-header">
              <h3>Agregar Nuevos Artículos</h3>
            </div>
            <div className="devolucion-panel-content">
              
              <div style={{ padding: '16px', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: '8px', marginBottom: '16px' }}>
                <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Venta Original</p>
                <h4 style={{ margin: '4px 0 0 0', color: 'var(--color-text-primary)', fontSize: '1.25rem' }}>Total Referencia: ${originalTotal.toFixed(2)}</h4>
              </div>

              <label style={{ display: 'block', color: 'var(--color-text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Selecciona un artículo del catálogo:</label>
              <select
                className="devoluciones-select"
                onChange={(e) => {
                  const [prodId, size] = e.target.value.split('|');
                  if (prodId && size) {
                    const prod = catalogProducts.find(p => p.id === parseInt(prodId));
                    if (prod) addItemToCart(prod, size);
                    e.target.value = "";
                  }
                }}
              >
                <option value="">Buscar producto para llevar...</option>
                {catalogProducts.map(p =>
                  p.sizes.filter(s => s.stock > 0).map(s => (
                    <option key={`${p.id}-${s.size}`} value={`${p.id}|${s.size}`}>
                      {p.name} - Talla: {s.size} (${parseFloat(p.price as any).toFixed(2)})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Panel Derecho: Carrito de Cambio */}
          <div className="devolucion-panel">
            <div className="devolucion-panel-header">
              <h3>Carrito de Cambio</h3>
            </div>
            <div className="devolucion-panel-content">
              {exchangeCart.map(item => (
                <div key={`${item.productId}-${item.size}`} className="return-item-card">
                  <div className="return-item-info">
                    <strong>{item.name}</strong>
                    <span>Talla: {item.size} | Precio: ${parseFloat(item.price).toFixed(2)}</span>
                  </div>
                  <div className="return-item-qty">
                    <button onClick={() => updateCartItemQty(item.productId, item.size, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateCartItemQty(item.productId, item.size, 1)}>+</button>
                    <button onClick={() => removeCartItem(item.productId, item.size)} style={{ marginLeft: 8, borderColor: 'transparent', color: '#e57373' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </div>
              ))}
              {exchangeCart.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>El carrito está vacío.</p>}
            </div>
            <div className="devolucion-panel-footer">
              <div className="total-row">
                <span>Total Nuevo Ticket:</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="total-row difference">
                <span>Diferencia a Pagar:</span>
                <span>${difference > 0 ? difference.toFixed(2) : "0.00"}</span>
              </div>
              {difference < 0 && (
                <p style={{ color: '#e57373', fontSize: '0.9rem', marginBottom: '8px' }}>
                  El nuevo ticket debe igualar o superar el total de referencia (${originalTotal.toFixed(2)}).
                </p>
              )}
              <button
                className="process-btn"
                onClick={handleSubmitReturn}
                disabled={exchangeCart.length === 0 || difference < 0}
              >
                Confirmar y Cobrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="devoluciones-page">
      <div className="devoluciones-tabs">
        <div className={`devoluciones-tab ${activeTab === 'ventas' ? 'active' : ''}`} onClick={() => setActiveTab('ventas')}>
          Historial de Ventas
        </div>
        <div className={`devoluciones-tab ${activeTab === 'devoluciones' ? 'active' : ''}`} onClick={() => setActiveTab('devoluciones')}>
          Historial de Devoluciones
        </div>
      </div>

      <div className="devoluciones-list-container">
        {loading ? <p>Cargando...</p> : (
          <table className="devoluciones-table">
            <thead>
              {activeTab === 'ventas' ? (
                <tr>
                  <th>Folio Venta</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Vendedor</th>
                  <th>Acciones</th>
                </tr>
              ) : (
                <tr>
                  <th>Folio Devolución</th>
                  <th>Venta Original</th>
                  <th>Fecha</th>
                  <th>Saldo a Favor</th>
                  <th>Total Nuevos</th>
                  <th>Diferencia Pagada</th>
                </tr>
              )}
            </thead>
            <tbody>
              {activeTab === 'ventas' && sales.map(sale => {
                const diffDays = Math.ceil(Math.abs(new Date().getTime() - new Date(sale.created_at).getTime()) / (1000 * 60 * 60 * 24));
                const canReturn = diffDays <= 10;

                return (
                  <tr key={sale.id}>
                    <td>#{sale.id}</td>
                    <td>{new Date(sale.created_at).toLocaleDateString()}</td>
                    <td>${parseFloat(sale.total).toFixed(2)}</td>
                    <td>{sale.seller_name || 'N/A'}</td>
                    <td>
                      {canReturn ? (
                        <button className="devoluciones-btn" onClick={() => handleStartReturn(sale.id)}>
                          Aplicar Devolución
                        </button>
                      ) : (
                        <span style={{ color: '#e57373', fontSize: '0.85rem' }}>Expirado ({diffDays} días)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {activeTab === 'ventas' && sales.length === 0 && <tr><td colSpan={5}>No hay ventas.</td></tr>}

              {activeTab === 'devoluciones' && returns.map(ret => (
                <tr key={ret.id}>
                  <td>DEV-{ret.id}</td>
                  <td>#{ret.original_sale_id}</td>
                  <td>{new Date(ret.created_at).toLocaleDateString()}</td>
                  <td>${parseFloat(ret.total_credit).toFixed(2)}</td>
                  <td>${parseFloat(ret.total_new_charge).toFixed(2)}</td>
                  <td>${parseFloat(ret.difference_paid).toFixed(2)}</td>
                </tr>
              ))}
              {activeTab === 'devoluciones' && returns.length === 0 && <tr><td colSpan={6}>No hay devoluciones registradas.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
