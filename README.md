# Finanzas Personales - Frontend

Aplicación web moderna para la gestión de finanzas personales desarrollada con React y TypeScript. Interfaz intuitiva con tema claro/oscuro, gráficas interactivas y diseño responsive.

## 🚀 Tecnologías

- **React 18** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **React Router v6** - Enrutamiento
- **TailwindCSS** - Framework de estilos
- **Recharts** - Gráficas y visualizaciones
- **Axios** - Cliente HTTP
- **React Toastify** - Notificaciones
- **Lucide React** - Iconos

## ✨ Características

### Autenticación
- ✅ Login y registro de usuarios
- ✅ Gestión de perfil con foto
- ✅ Cambio de contraseña
- ✅ Sesión persistente con tokens JWT

### Gestión Financiera
- ✅ **Gastos**: Registro con categoría, tipo (Fijo/Variable), descripción y fecha
- ✅ **Ingresos**: Seguimiento de entradas de dinero
- ✅ **Presupuestos**: Definición y monitoreo de límites por categoría
- ✅ **Metas**: Objetivos de ahorro con barra de progreso
- ✅ **Categorías**: Personalización de categorías de gastos e ingresos

### Dashboard
- ✅ Resumen mensual con tarjetas de ingresos, gastos y balance
- ✅ Filtro por mes y año
- ✅ Gráfica de barras: Ingresos vs Gastos
- ✅ Gráfica circular: Distribución de gastos por categoría
- ✅ Indicadores de presupuestos activos

### UI/UX
- ✅ Tema claro/oscuro
- ✅ Diseño responsive (móvil, tablet, desktop)
- ✅ Sidebar colapsable
- ✅ Paginación en tablas
- ✅ Búsqueda y filtros
- ✅ Notificaciones toast
- ✅ Validación de formularios
- ✅ Animaciones suaves

## 📁 Estructura del Proyecto

```
FinanzasPersonales.Frontend/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Layout.tsx              # Layout principal con navbar y sidebar
│   │   └── ProtectedRoute.tsx      # Rutas protegidas
│   ├── context/            # Contextos de React
│   │   ├── AuthContext.tsx         # Estado de autenticación
│   │   └── ThemeContext.tsx        # Tema claro/oscuro
│   ├── pages/              # Páginas de la aplicación
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── GastosPage.tsx
│   │   ├── IngresosPage.tsx
│   │   ├── PresupuestosPage.tsx
│   │   ├── MetasPage.tsx
│   │   ├── CategoriasPage.tsx
│   │   └── ProfilePage.tsx
│   ├── services/           # Servicios de API
│   │   ├── api.ts                  # Cliente Axios configurado
│   │   ├── authService.ts
│   │   ├── gastosService.ts
│   │   ├── ingresosService.ts
│   │   ├── presupuestosService.ts
│   │   ├── metasService.ts
│   │   ├── categoriasService.ts
│   │   ├── dashboardService.ts
│   │   └── userService.ts
│   ├── App.tsx             # Componente principal con rutas
│   ├── main.tsx            # Punto de entrada
│   └── index.css           # Estilos globales
├── public/                 # Archivos estáticos
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🎨 Páginas

### Dashboard (/)
- Resumen de finanzas del mes actual
- Selector de mes/año para filtrar datos
- Tarjetas con totales de ingresos, gastos, balance y presupuestos
- Gráfica de barras comparando ingresos vs gastos
- Gráfica circular mostrando distribución de gastos

### Gastos (/gastos)
- Tabla paginada con todos los gastos
- Filtros por mes, año y categoría
- Búsqueda por descripción
- Formulario para crear/editar con:
  - Descripción
  - Categoría
  - Tipo (Fijo/Variable)
  - Fecha
  - Monto
- Indicador visual del tipo de gasto con badges

### Ingresos (/ingresos)
- Similar a Gastos
- Filtros y búsqueda
- Formulario con descripción, categoría, fecha y monto

### Presupuestos (/presupuestos)
- Tarjetas visuales con barra de progreso
- Estado del presupuesto (En límite/Excedido/Alerta)
- Formulario para definir límites por categoría y periodo

### Metas (/metas)
- Tarjetas con barra de progreso
- Porcentaje de ahorro alcanzado
- Formulario para crear objetivos de ahorro

### Categorías (/categorias)
- Vista separada para categorías de Gastos e Ingresos
- Búsqueda y filtros
- Gestión CRUD completa

### Mi Perfil (/perfil)
- Formulario para actualizar nombre de usuario
- Formulario para cambiar contraseña
- Indicadores de carga durante actualizaciones

## ⚙️ Instalación y Ejecución

### Prerrequisitos
- Node.js 18+ y npm

### Paso 1: Instalar dependencias
```bash
cd FinanzasPersonales.Frontend
npm install
```

### Paso 2: Configurar variables de entorno

Crear archivo `.env` en la raíz:

```env
VITE_API_URL=http://localhost:5030/api
```

### Paso 3: Ejecutar en modo desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Paso 4: Build para producción
```bash
npm run build
```

Los archivos compilados estarán en `/dist`

## 📦 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Ejecutar ESLint
```

## 🎨 Temas

La aplicación soporta dos temas que se pueden alternar desde el navbar:

- **Tema Claro**: Colores brillantes con fondo blanco
- **Tema Oscuro**: Colores oscuros con fondo gris

La preferencia se guarda en `localStorage`.

## 🔐 Autenticación

- **Token JWT**: Almacenado en `localStorage`
- **Interceptor**: Axios agrega automáticamente el token a todas las peticiones
- **Rutas Protegidas**: `ProtectedRoute` redirige a login si no hay sesión
- **Refresh automático**: El perfil se carga al iniciar sesión

## 📱 Responsive Design

- **Móvil** (< 640px): Sidebar overlay, diseño de una columna
- **Tablet** (640px - 1024px): Sidebar fixed, tarjetas en 2 columnas
- **Desktop** (> 1024px): Sidebar colapsable, aprovechamiento completo del espacio

## 🌐 Internacionalización

Actualmente en **Español**. Los textos están hardcodeados pero preparados para i18n futuro.

## 🚀 Optimizaciones

- **Code Splitting**: Rutas lazy loaded
- **Tree Shaking**: Solo importa código usado
- **Minificación**: Build optimizado con Vite
- **CSS Purge**: TailwindCSS elimina estilos no usados
- **Caché**: Assets con hash para cache busting

## 🐛 Troubleshooting

### Error de CORS
Asegurarse de que el backend tiene configurado CORS para `http://localhost:5173`

### Gráficas no se muestran
Verificar que `recharts` está instalado:
```bash
npm install recharts
```

### Estilos no se aplican
Verificar que TailwindCSS está configurado correctamente en `tailwind.config.js`

### Token expirado
El token expira en 24h. Cerrar sesión y volver a iniciar.

## 📚 Librerías Principales

| Librería       | Versión | Propósito       |
| -------------- | ------- | --------------- |
| React          | 18.x    | UI Library      |
| TypeScript     | 5.x     | Tipado estático |
| Vite           | 5.x     | Build tool      |
| TailwindCSS    | 3.x     | Estilos         |
| React Router   | 6.x     | Enrutamiento    |
| Axios          | 1.x     | HTTP Client     |
| Recharts       | 2.x     | Gráficas        |
| Lucide React   | latest  | Iconos          |
| React Toastify | 10.x    | Notificaciones  |

## 👨‍💻 Desarrollo

### Agregar una nueva página
1. Crear componente en `/src/pages/NuevaPagina.tsx`
2. Crear servicio en `/src/services/nuevaService.ts`
3. Agregar ruta en `/src/App.tsx`
4. Agregar al menú en `/src/components/Layout.tsx`

### Estándares de código
- Usar TypeScript para todo
- Componentes funcionales con hooks
- Servicios separados para cada entidad
- Interfaces para types
- TailwindCSS para estilos (no CSS inline)

## 🎯 Próximas Funcionalidades

- [ ] Modo offline con Service Workers
- [ ] Notificaciones push para presupuestos excedidos
- [ ] Exportar reportes a PDF
- [ ] Gráficas adicionales (tendencias, comparativas)
- [ ] Multi-idioma (i18n)
- [ ] Tests unitarios y E2E

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2025  
**Desarrollado con** ❤️ **usando React + TypeScript**
