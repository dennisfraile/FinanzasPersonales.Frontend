import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { GastosPage } from './pages/GastosPage';
import { IngresosPage } from './pages/IngresosPage';
import { MetasPage } from './pages/MetasPage';
import { PresupuestosPage } from './pages/PresupuestosPage';
import { CategoriasPage } from './pages/CategoriasPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotificacionesPage } from './pages/NotificacionesPage';
import { CuentasPage } from './pages/CuentasPage';
import { CuentaDashboardPage } from './pages/CuentaDashboardPage';
import { TransferirPage } from './pages/TransferirPage';
import { GastosRecurrentesPage } from './pages/GastosRecurrentesPage';
import { IngresosRecurrentesPage } from './pages/IngresosRecurrentesPage';
import { TagsPage } from './pages/TagsPage';
import { Layout } from './components/Layout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Lazy load páginas pesadas (Recharts, FullCalendar) para reducir bundle inicial
const ReportesPage = lazy(() => import('./pages/ReportesPage').then(m => ({ default: m.ReportesPage })));
const CalendarioPage = lazy(() => import('./pages/CalendarioPage').then(m => ({ default: m.CalendarioPage })));
const ComparacionPage = lazy(() => import('./pages/ComparacionPage').then(m => ({ default: m.ComparacionPage })));

const LazyFallback = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Cargando...</div>
    </div>
);

function App() {
  return (
    <ErrorBoundary>
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
                    <Layout>
                      <Suspense fallback={<LazyFallback />}>
                        <ReportesPage />
                      </Suspense>
                    </Layout>
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
                path="/cuentas/:cuentaId/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout><CuentaDashboardPage /></Layout>
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
                path="/ingresos-recurrentes"
                element={
                  <ProtectedRoute>
                    <Layout><IngresosRecurrentesPage /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendario"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<LazyFallback />}>
                        <CalendarioPage />
                      </Suspense>
                    </Layout>
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
                    <Layout>
                      <Suspense fallback={<LazyFallback />}>
                        <ComparacionPage />
                      </Suspense>
                    </Layout>
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
    </ErrorBoundary>
  );
}

export default App;
