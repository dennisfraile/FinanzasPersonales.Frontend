# FinanzasPersonales.Frontend

Frontend SPA desarrollado con **React 19 + TypeScript + TailwindCSS** para gestión integral de finanzas personales. Se conecta a la API .NET 8 y ofrece 24 páginas con dashboard, reportes, gráficas, calendario, notificaciones en tiempo real y soporte PWA offline.

## Tecnologias

| Tecnologia | Version | Uso |
|---|---|---|
| React | 19.2.0 | Framework UI |
| TypeScript | 5.9.3 | Tipado estatico |
| Vite | 7.2.4 | Build tool y dev server |
| TailwindCSS | 3.4.17 | Estilos utility-first |
| React Router | 7.10.1 | Routing SPA |
| TanStack React Query | 5.90.12 | Data fetching, cache, mutations |
| Axios | 1.13.2 | Cliente HTTP |
| Recharts | 3.6.0 | Graficas y visualizaciones |
| FullCalendar | 6.1.20 | Vista calendario |
| SignalR | 10.0.0 | Notificaciones WebSocket real-time |
| Lucide React | 0.560.0 | Iconos SVG |
| React Toastify | 11.0.5 | Notificaciones toast |
| Vite PWA Plugin | 1.2.0 | Progressive Web App offline |

## Estructura del Proyecto

```
src/
├── pages/                  # 24 paginas
│   ├── LoginPage.tsx                  # Login con Google OAuth
│   ├── DashboardPage.tsx              # Dashboard principal con metricas
│   ├── GastosPage.tsx                 # Gastos con filtros, tags, sub-compras
│   ├── IngresosPage.tsx               # Ingresos con filtros y tags
│   ├── CuentasPage.tsx                # Gestion de cuentas bancarias
│   ├── CuentaDashboardPage.tsx        # Dashboard por cuenta
│   ├── TransferirPage.tsx             # Transferencias entre cuentas
│   ├── MetasPage.tsx                  # Metas de ahorro con progreso
│   ├── PresupuestosPage.tsx           # Presupuestos por categoria
│   ├── PresupuestoDashboardPage.tsx   # Dashboard presupuesto multi-periodo
│   ├── DeudasPage.tsx                 # Gestion de deudas y pagos
│   ├── GastosCompartidosPage.tsx      # Gastos compartidos / split
│   ├── GastosRecurrentesPage.tsx      # Gastos recurrentes
│   ├── IngresosRecurrentesPage.tsx    # Ingresos recurrentes
│   ├── PlantillasGastoPage.tsx        # Plantillas de gasto rapido
│   ├── ReglasCategoriaPage.tsx        # Reglas de auto-categorizacion
│   ├── ImportacionCsvPage.tsx         # Wizard de importacion CSV
│   ├── ReportesPage.tsx               # Reportes avanzados (lazy)
│   ├── CalendarioPage.tsx             # Calendario financiero (lazy)
│   ├── ComparacionPage.tsx            # Comparacion de periodos (lazy)
│   ├── CategoriasPage.tsx             # Gestion de categorias
│   ├── TagsPage.tsx                   # Gestion de tags
│   ├── NotificacionesPage.tsx         # Centro de notificaciones
│   └── ProfilePage.tsx                # Perfil de usuario
├── components/             # 18 componentes reutilizables
│   ├── Layout.tsx                     # Layout principal (navbar + sidebar colapsable)
│   ├── ProtectedRoute.tsx             # Guard de autenticacion
│   ├── ErrorBoundary.tsx              # Manejo de errores
│   ├── CuentaSelector.tsx             # Selector de cuenta
│   ├── CuentaCard.tsx                 # Card de cuenta
│   ├── TagSelector.tsx                # Multi-select de tags
│   ├── DetallesGastoPanel.tsx         # Panel de sub-compras
│   ├── AdjuntosList.tsx               # Lista de adjuntos PDF
│   ├── FileUpload.tsx                 # Upload de archivos
│   ├── NotificationBell.tsx           # Campana con badge
│   ├── Pagination.tsx                 # Controles de paginacion
│   ├── Skeleton.tsx                   # Loading skeleton
│   ├── EmptyState.tsx                 # Estado vacio
│   ├── HelpTooltip.tsx                # Tooltips de ayuda
│   ├── GlossaryModal.tsx              # Glosario de terminos
│   ├── OnboardingWizard.tsx           # Wizard primera vez
│   ├── SuggestionBanner.tsx           # Sugerencias proactivas
│   └── OfflineIndicator.tsx           # Indicador offline
├── services/               # 21 servicios API
│   ├── api.ts                         # Cliente Axios (base URL, JWT, interceptors)
│   ├── authService.ts
│   ├── userService.ts
│   ├── gastosService.ts
│   ├── ingresosService.ts
│   ├── cuentasService.ts
│   ├── transferenciasService.ts
│   ├── categoriasService.ts
│   ├── tagsService.ts
│   ├── presupuestosService.ts
│   ├── metasService.ts
│   ├── deudasService.ts
│   ├── gastosCompartidosService.ts
│   ├── gastosRecurrentesService.ts
│   ├── ingresosRecurrentesService.ts
│   ├── dashboardService.ts
│   ├── reportesService.ts
│   ├── calendarioService.ts
│   ├── comparacionService.ts
│   ├── cuentaDashboardService.ts
│   ├── detallesGastoService.ts
│   ├── adjuntosService.ts
│   ├── notificacionesService.ts
│   ├── plantillasGastoService.ts
│   ├── reglasCategoriaService.ts
│   └── importacionCsvService.ts
├── hooks/
│   ├── useQueryHooks.ts               # 50+ hooks de React Query
│   ├── useCuentas.ts
│   ├── useOnlineStatus.ts
│   ├── useNotificaciones.ts
│   └── useSignalR.ts                  # Conexion SignalR real-time
├── context/
│   ├── AuthContext.tsx                 # Estado de autenticacion
│   └── ThemeContext.tsx                # Dark/Light mode
├── utils/
│   └── helpContent.ts                 # Contenido de ayuda y tooltips
├── App.tsx                             # Router principal
└── main.tsx                            # Entry point + QueryClient
```

## Funcionalidades

### Gestion Financiera
- **Gastos e Ingresos**: CRUD con filtros avanzados (fecha, monto, categoria, tags), paginacion, notas, adjuntos PDF
- **Sub-compras**: Desglose de gastos individuales dentro de un gasto (ej: items del supermercado)
- **Cuentas**: Multiples cuentas (efectivo, bancaria, credito, ahorros, inversion) con balance total
- **Transferencias**: Mover dinero entre cuentas
- **Tags**: Sistema de etiquetas para clasificacion transversal

### Planificacion
- **Presupuestos**: Por categoria con 6 periodos (semanal a anual), dashboard comparativo con graficas
- **Metas**: Objetivos de ahorro con barra de progreso, abonos y proyecciones
- **Deudas**: Seguimiento de deudas con pagos (calculo automatico capital/interes), proyeccion de liquidacion

### Social
- **Gastos Compartidos**: Divide gastos con otros (equitativo, porcentaje, monto fijo), seguimiento de pagos, resumen por persona

### Automatizacion
- **Recurrentes**: Gastos e ingresos automaticos (semanal, quincenal, mensual, anual)
- **Plantillas**: Templates de gastos frecuentes, crear gasto con un clic
- **Auto-categorizacion**: Reglas por patron de texto (contiene, exacto, comienza con)
- **Importacion CSV**: Wizard de 4 pasos con mapeo de columnas, deteccion de duplicados, preview

### Analitica
- **Dashboard**: Metricas mensuales, grafica de tendencias 6 meses, top categorias, flujo de caja
- **Reportes**: Tendencias, comparativa, top categorias, fijos vs variables, proyeccion mensual
- **Calendario**: Vista calendario con transacciones por dia (FullCalendar)
- **Comparacion**: Comparar dos periodos personalizados
- **Exportacion**: Excel y PDF

### UX
- **Dark Mode**: Toggle light/dark con persistencia
- **Responsive**: Diseho mobile-first, tablas en desktop, cards en mobile
- **PWA**: Instalable como app, cache offline de assets y endpoints criticos
- **Notificaciones Real-Time**: SignalR WebSocket + campana con badge
- **Onboarding**: Wizard de primera vez
- **Skeleton Loading**: Estados de carga en todas las paginas
- **Empty States**: UI para listas vacias con CTA

## Navegacion (Sidebar)

| Grupo | Paginas |
|---|---|
| General | Dashboard |
| Movimientos | Gastos, Ingresos, Compartidos |
| Cuentas | Cuentas, Transferir |
| Planificacion | Metas, Presupuestos, Deudas |
| Recurrentes | Gastos Recurrentes, Ingresos Recurrentes |
| Analisis | Calendario, Comparacion, Reportes |
| Herramientas | Plantillas, Auto-categorizacion, Importar CSV |
| Configuracion | Categorias, Tags |

## Configuracion

### Variables de entorno

Crear archivo `.env` en la raiz:

```env
VITE_API_URL=http://localhost:5030
VITE_GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
```

### api.ts

El cliente Axios se configura automaticamente:
- Base URL: `VITE_API_URL` + `/api`
- JWT: token de localStorage inyectado en header `Authorization: Bearer`
- Timeout: 30 segundos
- 401 responses: redirige a `/login` y limpia token

## Instalacion

### Prerrequisitos
- Node.js 18+
- npm o pnpm

### Setup

```bash
# Clonar e ir al directorio
cd FinanzasPersonales.Frontend

# Instalar dependencias
npm install

# Configurar .env
cp .env.example .env
# Editar .env con tu API URL y Google Client ID

# Iniciar dev server
npm run dev
```

Disponible en `http://localhost:5173`

### Scripts

```bash
npm run dev       # Dev server con HMR
npm run build     # Build de produccion (tsc + vite)
npm run preview   # Preview del build
npm run lint      # ESLint
```

## Build de Produccion

```bash
npm run build
```

Genera `dist/` con:
- Code splitting automatico (react, recharts, signalr, calendar en chunks separados)
- PWA service worker con cache de assets y API
- Lazy loading de paginas pesadas (Reportes, Calendario, Comparacion)

## Deploy (Vercel)

El proyecto incluye `vercel.json` con rewrites para SPA routing y PWA.

```bash
# Deploy con Vercel CLI
vercel --prod
```

Asegurar que las variables de entorno estan configuradas en el dashboard de Vercel:
- `VITE_API_URL` = URL del backend en produccion
- `VITE_GOOGLE_CLIENT_ID` = Client ID de Google

## PWA (Progressive Web App)

- **Nombre**: Mis Finanzas Personales
- **Display**: Standalone (se ve como app nativa)
- **Cache Strategy**: StaleWhileRevalidate para endpoints criticos (categorias, cuentas, dashboard)
- **TTL Cache**: 5 minutos, max 50 entries
- **Auto-update**: Habilitado

## State Management

- **React Query**: Data fetching, cache, invalidacion automatica en mutations
- **Context API**: AuthContext (usuario, login/logout), ThemeContext (dark/light)
- **useState + useMemo**: Estado local de UI (modales, filtros, paginacion)
- **localStorage**: Token JWT, tema, estado de onboarding, cola offline

---

**Version**: 2.0.0
**React**: 19.2.0 | **TypeScript**: 5.9.3 | **Vite**: 7.2.4
**Ultima actualizacion**: Marzo 2026
