import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SignalRProvider } from './context/SignalRContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Todas las páginas se cargan con lazy() para mantener el bundle inicial mínimo.
// El shell (Layout, ProtectedRoute, providers, ToastContainer) sí va eager.
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardCompartidoPage = lazy(() => import('./pages/DashboardCompartidoPage').then(m => ({ default: m.DashboardCompartidoPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const GastosPage = lazy(() => import('./pages/GastosPage').then(m => ({ default: m.GastosPage })));
const IngresosPage = lazy(() => import('./pages/IngresosPage').then(m => ({ default: m.IngresosPage })));
const MetasPage = lazy(() => import('./pages/MetasPage').then(m => ({ default: m.MetasPage })));
const PresupuestosPage = lazy(() => import('./pages/PresupuestosPage').then(m => ({ default: m.PresupuestosPage })));
const PresupuestoDashboardPage = lazy(() => import('./pages/PresupuestoDashboardPage').then(m => ({ default: m.PresupuestoDashboardPage })));
const CategoriasPage = lazy(() => import('./pages/CategoriasPage').then(m => ({ default: m.CategoriasPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const NotificacionesPage = lazy(() => import('./pages/NotificacionesPage').then(m => ({ default: m.NotificacionesPage })));
const CuentasPage = lazy(() => import('./pages/CuentasPage').then(m => ({ default: m.CuentasPage })));
const CuentaDashboardPage = lazy(() => import('./pages/CuentaDashboardPage').then(m => ({ default: m.CuentaDashboardPage })));
const TransferirPage = lazy(() => import('./pages/TransferirPage').then(m => ({ default: m.TransferirPage })));
const GastosRecurrentesPage = lazy(() => import('./pages/GastosRecurrentesPage').then(m => ({ default: m.GastosRecurrentesPage })));
const GastosProgramadosPage = lazy(() => import('./pages/GastosProgramadosPage').then(m => ({ default: m.GastosProgramadosPage })));
const IngresosRecurrentesPage = lazy(() => import('./pages/IngresosRecurrentesPage').then(m => ({ default: m.IngresosRecurrentesPage })));
const TagsPage = lazy(() => import('./pages/TagsPage').then(m => ({ default: m.TagsPage })));
const DeudasPage = lazy(() => import('./pages/DeudasPage').then(m => ({ default: m.DeudasPage })));
const GastosCompartidosPage = lazy(() => import('./pages/GastosCompartidosPage').then(m => ({ default: m.GastosCompartidosPage })));
const PlantillasGastoPage = lazy(() => import('./pages/PlantillasGastoPage').then(m => ({ default: m.PlantillasGastoPage })));
const PlantillasIngresoPage = lazy(() => import('./pages/PlantillasIngresoPage').then(m => ({ default: m.PlantillasIngresoPage })));
const ReglasCategoriaPage = lazy(() => import('./pages/ReglasCategoriaPage').then(m => ({ default: m.ReglasCategoriaPage })));
const ImportacionCsvPage = lazy(() => import('./pages/ImportacionCsvPage').then(m => ({ default: m.ImportacionCsvPage })));
const AyudaPage = lazy(() => import('./pages/AyudaPage').then(m => ({ default: m.AyudaPage })));
const ReportesProgramadosPage = lazy(() => import('./pages/ReportesProgramadosPage').then(m => ({ default: m.ReportesProgramadosPage })));
const ReportesPage = lazy(() => import('./pages/ReportesPage').then(m => ({ default: m.ReportesPage })));
const CalendarioPage = lazy(() => import('./pages/CalendarioPage').then(m => ({ default: m.CalendarioPage })));
const ComparacionPage = lazy(() => import('./pages/ComparacionPage').then(m => ({ default: m.ComparacionPage })));

const LazyFallback = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Cargando...</div>
    </div>
);

// Ruta protegida: valida sesión + monta el shell (Layout) y suspende solo el contenido,
// para que la navegación lateral siga visible mientras carga la página lazy.
const Protected = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute>
    <Layout>
      <Suspense fallback={<LazyFallback />}>{children}</Suspense>
    </Layout>
  </ProtectedRoute>
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <SignalRProvider>
            <ConfirmProvider>
            <Suspense fallback={<LazyFallback />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/compartido/:token" element={<DashboardCompartidoPage />} />

                <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
                <Route path="/gastos" element={<Protected><GastosPage /></Protected>} />
                <Route path="/ingresos" element={<Protected><IngresosPage /></Protected>} />
                <Route path="/metas" element={<Protected><MetasPage /></Protected>} />
                <Route path="/presupuestos" element={<Protected><PresupuestosPage /></Protected>} />
                <Route path="/presupuestos/dashboard" element={<Protected><PresupuestoDashboardPage /></Protected>} />
                <Route path="/categorias" element={<Protected><CategoriasPage /></Protected>} />
                <Route path="/perfil" element={<Protected><ProfilePage /></Protected>} />
                <Route path="/reportes" element={<Protected><ReportesPage /></Protected>} />
                <Route path="/notificaciones" element={<Protected><NotificacionesPage /></Protected>} />
                <Route path="/cuentas" element={<Protected><CuentasPage /></Protected>} />
                <Route path="/cuentas/:cuentaId/dashboard" element={<Protected><CuentaDashboardPage /></Protected>} />
                <Route path="/transferir" element={<Protected><TransferirPage /></Protected>} />
                <Route path="/gastos-recurrentes" element={<Protected><GastosRecurrentesPage /></Protected>} />
                <Route path="/gastos-programados" element={<Protected><GastosProgramadosPage /></Protected>} />
                <Route path="/ingresos-recurrentes" element={<Protected><IngresosRecurrentesPage /></Protected>} />
                <Route path="/calendario" element={<Protected><CalendarioPage /></Protected>} />
                <Route path="/deudas" element={<Protected><DeudasPage /></Protected>} />
                <Route path="/gastos-compartidos" element={<Protected><GastosCompartidosPage /></Protected>} />
                <Route path="/tags" element={<Protected><TagsPage /></Protected>} />
                <Route path="/plantillas" element={<Protected><PlantillasGastoPage /></Protected>} />
                <Route path="/plantillas-ingreso" element={<Protected><PlantillasIngresoPage /></Protected>} />
                <Route path="/reglas-categoria" element={<Protected><ReglasCategoriaPage /></Protected>} />
                <Route path="/importar-csv" element={<Protected><ImportacionCsvPage /></Protected>} />
                <Route path="/comparacion" element={<Protected><ComparacionPage /></Protected>} />
                <Route path="/reportes-programados" element={<Protected><ReportesProgramadosPage /></Protected>} />
                <Route path="/ayuda" element={<Protected><AyudaPage /></Protected>} />

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
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
            </ConfirmProvider>
            </SignalRProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
