import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Ventas from "./pages/Ventas/Ventas";
import Productos from "./pages/Productos/Productos";
import ProductForm from "./pages/Productos/ProductForm";
import Inventario from "./pages/Inventario/Inventario";
import InventarioForm from "./pages/Inventario/InventarioForm";
import SwitchUser from "./pages/SwitchUser/SwitchUser";
import InventoryMovementsList from "./pages/InventoryMovements/InventoryMovementsList";
import InventoryMovementCreate from "./pages/InventoryMovements/InventoryMovementCreate";
import InventoryMovementDetails from "./pages/InventoryMovements/InventoryMovementDetails";
import Devoluciones from "./pages/Ventas/Devoluciones";
import HistorialVentas from "./pages/Ventas/HistorialVentas";
import VentaDetalle from "./pages/Ventas/VentaDetalle";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/switch-user" element={<SwitchUser />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="ventas" element={<Ventas />} />
              <Route path="historial-ventas" element={<HistorialVentas />} />
              <Route path="historial-ventas/:id" element={<VentaDetalle />} />
              <Route path="devoluciones" element={<Devoluciones />} />
              <Route path="productos" element={<Productos />} />
              <Route path="productos/nuevo" element={<ProductForm />} />
              <Route path="productos/editar/:id" element={<ProductForm />} />
              <Route path="inventario" element={<Inventario />} />
              <Route path="inventario/editar/:id" element={<InventarioForm />} />
              <Route path="inventory-movements" element={<InventoryMovementsList />} />
              <Route path="inventory-movements/create" element={<InventoryMovementCreate />} />
              <Route path="inventory-movements/:id" element={<InventoryMovementDetails />} />
            </Route>
          </Route>

          {/* Catch-all: redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
