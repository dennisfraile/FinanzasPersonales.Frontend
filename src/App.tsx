import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { GastosPage } from './pages/GastosPage';
import { IngresosPage } from './pages/IngresosPage';
import { MetasPage } from './pages/MetasPage';
import { PresupuestosPage } from './pages/PresupuestosPage';
import { CategoriasPage } from './pages/CategoriasPage';
import { ProfilePage } from './pages/ProfilePage';
import { ReportesPage } from './pages/ReportesPage';
import { NotificacionesPage } from './pages/NotificacionesPage';
import { CuentasPage } from './pages/CuentasPage';
import { TransferirPage } from './pages/TransferirPage';
import { GastosRecurrentesPage } from './pages/GastosRecurrentesPage';
import { CalendarioPage } from './pages/CalendarioPage';
import { TagsPage } from './pages/TagsPage';
import { ComparacionPage } from './pages/ComparacionPage';
import { Layout } from './components/Layout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout><DashboardPage /></Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/gastos"
              element={
                <ProtectedRoute>
                  <Layout><GastosPage /></Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/ingresos"
              element={
                <ProtectedRoute>
                  <Layout><IngresosPage /></Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/metas"
              element={
                <ProtectedRoute>
                  <Layout><MetasPage /></Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/presupuestos"
              element={
                <ProtectedRoute>
                  <Layout><PresupuestosPage /></Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/categorias"
              element={
                <ProtectedRoute>
                  <Layout><CategoriasPage /></Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <Layout><ProfilePage /></Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/reportes"
              element={
                <ProtectedRoute>
                  <Layout><ReportesPage /></Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/notificaciones"
              element={
                <ProtectedRoute>
                  <Layout><NotificacionesPage /></Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/cuentas"
              element={
                <ProtectedRoute>
                  <Layout><CuentasPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/transferir"
              element={
                <ProtectedRoute>
                  <Layout><TransferirPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/gastos-recurrentes"
              element={
                <ProtectedRoute>
                  <Layout><GastosRecurrentesPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendario"
              element={
                <ProtectedRoute>
                  <Layout><CalendarioPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tags"
              element={
                <ProtectedRoute>
                  <Layout><TagsPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/comparacion"
              element={
                <ProtectedRoute>
                  <Layout><ComparacionPage /></Layout>
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            limit={3}
          />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
