const API_BASE = "http://localhost:5000/api";

// Helper to get the current token from localStorage
function getToken(): string | null {
  try {
    const raw = localStorage.getItem("mslf_session");
    if (raw) {
      const session = JSON.parse(raw);
      return session.token ?? null;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// ── Auth ──

export async function apiLogin(username: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Error al iniciar sesión");
  }
  return res.json(); // { token, session }
}

export async function apiRegister(data: {
  username: string;
  password: string;
  role: string;
  name: string;
}) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Error al registrar usuario");
  }
  return res.json();
}

// ── Products ──

export interface SizeStock {
  size: string;
  stock: number;
}

export interface ProductFromAPI {
  id: number;
  product_code: string;
  name: string;
  cost: number;
  price: number;
  category: string;
  gender: string;
  sizes: SizeStock[];
  stock: number;
  min_stock: number;
  image: string | null;
  is_inventariable: boolean;
  manage_stock: boolean;
  status: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  gender?: string;
  status?: string;
}

export async function apiGetProducts(
  filters?: ProductFilters,
): Promise<ProductFromAPI[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.set("search", filters.search);
  if (filters?.category) params.set("category", filters.category);
  if (filters?.gender) params.set("gender", filters.gender);
  if (filters?.status) params.set("status", filters.status);

  const query = params.toString();
  const res = await fetch(`${API_BASE}/products${query ? `?${query}` : ""}`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error("Error al obtener productos");
  }
  return res.json();
}

export interface ProductPayload {
  name: string;
  cost: number;
  price: number;
  category: string;
  gender: string;
  sizes: SizeStock[];
  stock: number;
  minStock: number;
  image?: string | null;
  isInventariable: boolean;
  manageStock: boolean;
  status: string;
}

export async function apiCreateProduct(
  payload: ProductPayload,
): Promise<ProductFromAPI> {
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Error al crear el producto");
  }
  return res.json();
}

export async function apiUpdateProduct(
  id: number,
  payload: Partial<ProductPayload>,
): Promise<ProductFromAPI> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Error al actualizar el producto");
  }
  return res.json();
}

export async function apiDeleteProduct(id: number) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Error al eliminar el producto");
  }
  return res.json();
}

// ── Sales ──

export interface SaleItem {
  productId: number;
  size: string;
  quantity: number;
}

export async function apiCreateSale(items: SaleItem[]) {
  const res = await fetch(`${API_BASE}/sales`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ items }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Error al procesar la venta");
  }
  return res.json(); // { success, saleId, total, createdAt }
}

// ── Dashboard ──

export interface DashboardStats {
  todaySales: number;
  todayCount: number;
  totalStock: number;
  monthlyIncome: number;
  activeSellers: number;
}

export async function apiGetDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/dashboard/stats`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error("Error al obtener estadísticas");
  }
  return res.json();
}

// ── Inventory Movements ──

export interface InventoryMovementItemPayload {
  productId: number;
  size: string;
  quantity: number;
}

export interface InventoryMovementPayload {
  type: "Entrada" | "Salida";
  concept: string;
  items: InventoryMovementItemPayload[];
}

export interface InventoryMovementItem {
  id: number;
  movement_id: number;
  product_id: number;
  size: string;
  quantity: number;
  product_name?: string;
  product_code?: string;
}

export interface InventoryMovement {
  id: number;
  code: string;
  type: string;
  concept: string;
  created_at: string;
  user_name?: string;
  items?: InventoryMovementItem[];
}

export async function apiGetInventoryMovements(type?: string, search?: string): Promise<InventoryMovement[]> {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (search) params.set("search", search);

  const query = params.toString();
  const res = await fetch(`${API_BASE}/inventory-movements${query ? `?${query}` : ""}`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error("Error al obtener historial de movimientos");
  }
  return res.json();
}

export async function apiGetInventoryMovementDetails(id: number): Promise<InventoryMovement> {
  const res = await fetch(`${API_BASE}/inventory-movements/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error("Error al obtener los detalles del movimiento");
  }
  return res.json();
}

export async function apiCreateInventoryMovement(payload: InventoryMovementPayload) {
  const res = await fetch(`${API_BASE}/inventory-movements`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Error al crear el movimiento de inventario");
  }
  return res.json();
}
