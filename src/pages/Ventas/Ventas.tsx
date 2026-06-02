import { useState, useMemo, useEffect } from "react";
import { apiGetProducts, apiCreateSale } from "../../services/api";
import type { ProductFromAPI } from "../../services/api";
import "./Ventas.css";

const CATEGORIES = [
  "Vestidos",
  "Blusas",
  "Camisas",
  "Pantalones",
  "Faldas",
  "Shorts",
];

/* ---- Icons ---- */
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
const IconX = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconPlus = () => (
  <svg
    width="24"
    height="24"
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
const IconMinus = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconTrash = () => (
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
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
const IconShoppingCart = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);
const IconCheckCircle = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

/* ---- Types ---- */
interface CartItem {
  product: ProductFromAPI;
  size: string;
  quantity: number;
}

export default function Ventas() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [activeGender, setActiveGender] = useState<string>("Todos");

  const [products, setProducts] = useState<ProductFromAPI[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductFromAPI | null>(
    null,
  );
  const [selectedSize, setSelectedSize] = useState<string>("");

  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [payingLoading, setPayingLoading] = useState(false);
  const [payError, setPayError] = useState("");

  // Load products from API
  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await apiGetProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filter products (client-side for fast UX, data comes from API)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.product_code.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "Todos" || p.category === activeCategory;
      const matchesGender =
        activeGender === "Todos" || p.gender === activeGender;
      return matchesSearch && matchesCategory && matchesGender;
    });
  }, [search, activeCategory, activeGender, products]);

  // Cart calculations
  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0,
  );

  // Actions
  const handleProductClick = (product: ProductFromAPI) => {
    if (product.stock === 0) return;
    setSelectedProduct(product);
    setSelectedSize(""); // Reset size selection
  };

  const handleAddToCart = () => {
    if (!selectedProduct || !selectedSize) return;

    setCart((prev) => {
      const existing = prev.find(
        (i) => i.product.id === selectedProduct.id && i.size === selectedSize,
      );
      if (existing) {
        return prev.map((i) =>
          i.product.id === selectedProduct.id && i.size === selectedSize
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      }
      return [
        ...prev,
        { product: selectedProduct, size: selectedSize, quantity: 1 },
      ];
    });

    setSelectedProduct(null);
  };

  const updateQuantity = (productId: number, size: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && item.size === size) {
          const newQ = item.quantity + delta;
          return newQ > 0 ? { ...item, quantity: newQ } : item;
        }
        return item;
      }),
    );
  };

  const removeItem = (productId: number, size: string) => {
    setCart((prev) =>
      prev.filter((i) => !(i.product.id === productId && i.size === size)),
    );
  };

  const clearCart = () => setCart([]);

  const handlePay = async () => {
    if (cart.length === 0) return;
    setPayingLoading(true);
    setPayError("");

    try {
      const items = cart.map((item) => ({
        productId: item.product.id,
        size: item.size,
        quantity: item.quantity,
      }));

      await apiCreateSale(items);
      setShowPaymentSuccess(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setPayError(err.message || "Error al procesar la venta");
    } finally {
      setPayingLoading(false);
    }
  };

  const closePaymentModal = () => {
    setShowPaymentSuccess(false);
    clearCart();
    // Reload products to reflect updated stock
    loadProducts();
  };

  if (loadingProducts) {
    return (
      <div
        className="ventas-page"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "var(--color-text-secondary)", fontSize: "1.1rem" }}>
          Cargando catálogo…
        </p>
      </div>
    );
  }

  return (
    <div className="ventas-page">
      {/* ==================== LEFT: CATALOG ==================== */}
      <div className="ventas-catalog">
        {/* Toolbar */}
        <div className="ventas-toolbar">
          <div className="ventas-search-row">
            <div className="ventas-search-wrapper">
              <span className="ventas-search-icon">
                <IconSearch />
              </span>
              <input
                type="text"
                className="ventas-search-input"
                placeholder="Buscar por nombre o código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="ventas-filters">
            <span className="ventas-filter-label">Género:</span>
            {["Todos", "Damas", "Caballeros"].map((g) => (
              <span
                key={g}
                className={`ventas-chip ventas-chip--gender ${activeGender === g ? "ventas-chip--active" : ""}`}
                onClick={() => setActiveGender(g)}
              >
                {g}
              </span>
            ))}

            <span
              className="ventas-filter-label"
              style={{ marginLeft: "12px" }}
            >
              Categoría:
            </span>
            <span
              className={`ventas-chip ${activeCategory === "Todos" ? "ventas-chip--active" : ""}`}
              onClick={() => setActiveCategory("Todos")}
            >
              Todos
            </span>
            {CATEGORIES.map((c) => (
              <span
                key={c}
                className={`ventas-chip ${activeCategory === c ? "ventas-chip--active" : ""}`}
                onClick={() => setActiveCategory(c)}
              >
                {c}
              </span>
            ))}

            <span className="ventas-product-count">
              ({filteredProducts.length} productos)
            </span>
          </div>
        </div>

        {/* Grid */}
        <div className="ventas-grid-wrapper">
          {filteredProducts.length > 0 ? (
            <div className="ventas-product-grid">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className={`product-card ${p.stock === 0 ? "product-card--out-of-stock" : ""}`}
                  onClick={() => handleProductClick(p)}
                >
                  <div className="product-card-image-wrap">
                    <img
                      src={p.image || "/images/dresses.png"}
                      alt={p.name}
                      className="product-card-image"
                    />
                    <span
                      className={`product-card-gender-badge product-card-gender-badge--${p.gender}`}
                    >
                      {p.gender}
                    </span>
                    <div className="product-card-add-overlay">
                      <IconPlus />
                    </div>
                  </div>
                  <div className="product-card-info">
                    <span className="product-card-category">{p.category}</span>
                    <span className="product-card-name">{p.name}</span>
                    <span className="product-card-sku">
                      COD: {p.product_code}
                    </span>
                    <span className="product-card-price">
                      ${p.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ventas-empty">
              <span className="ventas-empty-icon">
                <IconSearch />
              </span>
              <h3>No se encontraron productos</h3>
              <p>Intenta cambiar los filtros o los términos de búsqueda.</p>
            </div>
          )}
        </div>
      </div>

      {/* ==================== RIGHT: CART ==================== */}
      <div className="ventas-cart">
        <div className="cart-header">
          <span className="cart-header-title">Ticket de Venta</span>
          <span className="cart-item-count">{cartTotalItems}</span>
        </div>

        <div className="cart-items">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div
                key={`${item.product.id}-${item.size}`}
                className="cart-item"
              >
                <div className="cart-item-top">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    <span className="cart-item-name">{item.product.name}</span>
                    <span className="cart-item-unit-price">
                      ${item.product.price.toFixed(2)} c/u
                    </span>
                  </div>
                  <button
                    className="cart-item-remove"
                    onClick={() => removeItem(item.product.id, item.size)}
                  >
                    <IconTrash />
                  </button>
                </div>

                <div className="cart-item-bottom">
                  <span className="cart-item-size-badge">
                    Talla: {item.size}
                  </span>
                  <div className="cart-item-qty">
                    <button
                      className="qty-btn"
                      onClick={() =>
                        updateQuantity(item.product.id, item.size, -1)
                      }
                    >
                      <IconMinus />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() =>
                        updateQuantity(item.product.id, item.size, 1)
                      }
                    >
                      <IconPlus />
                    </button>
                  </div>
                  <span className="cart-item-subtotal">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="cart-empty">
              <div className="cart-empty-icon">
                <IconShoppingCart />
              </div>
              <p>
                El carrito está vacío. Selecciona productos del catálogo para
                comenzar la venta.
              </p>
            </div>
          )}
        </div>

        <div className="cart-footer">
          {payError && (
            <div
              style={{
                color: "#ff6b6b",
                fontSize: "0.85rem",
                padding: "8px 12px",
                background: "rgba(255,107,107,0.1)",
                borderRadius: "6px",
                marginBottom: "8px",
              }}
            >
              {payError}
            </div>
          )}
          <div className="cart-totals">
            <div className="cart-subtotal-row">
              <span>Subtotal:</span>
              <span>${cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="cart-total-divider" />
            <div className="cart-total-row">
              <span className="cart-total-label">Total a cobrar:</span>
              <span className="cart-total-amount">
                ${cartSubtotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="cart-actions">
            <button
              className="cart-btn cart-btn--cancel"
              onClick={clearCart}
              disabled={cart.length === 0}
            >
              Cancelar
            </button>
            <button
              className="cart-btn cart-btn--pay"
              onClick={handlePay}
              disabled={cart.length === 0 || payingLoading}
            >
              {payingLoading ? "Procesando…" : "Cobrar"}
            </button>
          </div>
        </div>
      </div>

      {/* ==================== MODALS ==================== */}

      {/* Size Picker Modal */}
      {selectedProduct && (
        <div
          className="size-modal-overlay"
          onClick={() => setSelectedProduct(null)}
        >
          <div className="size-modal" onClick={(e) => e.stopPropagation()}>
            <div className="size-modal-header">
              <div>
                <h3 className="size-modal-product-name">
                  {selectedProduct.name}
                </h3>
                <p className="size-modal-price">
                  ${selectedProduct.price.toFixed(2)}
                </p>
              </div>
              <button
                className="size-modal-close"
                onClick={() => setSelectedProduct(null)}
              >
                <IconX />
              </button>
            </div>

            <p className="size-modal-label">Selecciona una talla:</p>
            <div className="size-modal-grid">
              {selectedProduct.sizes.map((s) => {
                const outOfStock = selectedProduct.manage_stock && s.stock <= 0;
                return (
                  <button
                    key={s.size}
                    className={`size-btn ${selectedSize === s.size ? "size-btn--selected" : ""} ${outOfStock ? "size-btn--disabled" : ""}`}
                    onClick={() => {
                      if (!outOfStock) setSelectedSize(s.size);
                    }}
                    disabled={outOfStock}
                  >
                    {s.size} {selectedProduct.manage_stock ? `(${s.stock})` : ""}
                  </button>
                );
              })}
            </div>

            <button
              className="size-modal-confirm-btn"
              onClick={handleAddToCart}
              disabled={!selectedSize}
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      )}

      {/* Payment Success Modal */}
      {showPaymentSuccess && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <div className="payment-success-icon">
              <IconCheckCircle />
            </div>
            <h3>¡Venta exitosa!</h3>
            <div className="payment-modal-total">
              ${cartSubtotal.toFixed(2)}
            </div>
            <p>
              El ticket se ha generado correctamente y el inventario ha sido
              actualizado.
            </p>
            <button
              className="payment-modal-close-btn"
              onClick={closePaymentModal}
            >
              Nueva Venta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
