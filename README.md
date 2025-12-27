# 💰 Finanzas Personales - Sistema de Gestión Financiera

Sistema completo de gestión de finanzas personales con frontend React y backend ASP.NET Core.

## ✨ Features Implementadas

### Core Features
- ✅ Authentication (JWT)
- ✅ Gastos e Ingresos CRUD
- ✅ Categorías personalizables
- ✅ Metas financieras con progreso
- ✅ Presupuestos mensuales
- ✅ Cuentas bancarias múltiples
- ✅ Transferencias entre cuentas
- ✅ Gastos recurrentes (auto-generación)

### Advanced Features
- ✅ Dashboard con gráficas Recharts
- ✅ Reportes avanzados (Excel/PDF export)
- ✅ Calendario financiero
- ✅ Adjuntos/Comprobantes (PDF)
- ✅ Tags/Etiquetas personalizables
- ✅ Comparación de períodos
- ✅ Búsqueda avanzada con filtros
- ✅ Notificaciones en tiempo real

### UX & Performance
- ✅ Skeleton loading states
- ✅ Mobile responsive (full-screen modals, cards)
- ✅ Dark mode
- ✅ Validaciones completas
- ✅ Smooth animations & transitions

## 🚀 Quick Start

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- PostgreSQL o SQL Server

### Backend Setup
```bash
cd FinanzasPersonales.Api/FinanzasPersonales.Api
dotnet restore
dotnet ef database update
dotnet run
```

### Frontend Setup
```bash
cd FinanzasPersonales.Frontend
npm install
npm run dev
```

## 📱 Screenshots

### Dashboard
![Dashboard con gráficas de tendencias](ruta-pendiente)

### Gastos & Filtros
![Búsqueda avanzada con filtros múltiples](ruta-pendiente)

### Calendario
![Vista calendario con transacciones](ruta-pendiente)

### Tags
![Gestión de tags personalizables](ruta-pendiente)

## 🛠 Tech Stack

**Backend:**
- ASP.NET Core 8
- Entity Framework Core
- PostgreSQL/SQL Server
- JWT Authentication
- Swagger/OpenAPI

**Frontend:**
- React 18
- TypeScript
- TailwindCSS
- Recharts
- React Router
- Axios
- React Toastify

## 📊 Database Schema

Ver [schema diagram](link-pendiente) para detalles completos.

## 🔧 Configuration

### Backend (appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "tu-connection-string"
  },
  "Jwt": {
    "Key": "tu-secret-key",
    "Issuer": "FinanzasAPI",
    "Audience": "FinanzasClient"
  }
}
```

### Frontend (src/services/)
Actualizar `API_URL` en cada servicio si es necesario.

## 📝 API Documentation

Swagger UI disponible en: `http://localhost:5050/swagger`

## 🎯 Roadmap

- [ ] PWA support
- [ ] Exportación a diferentes formatos
- [ ] Integración bancaria automática
- [ ] Machine learning para predicciones
- [ ] Multi-currency support

## 👥 Contributing

Pull requests son bienvenidos. Para cambios mayores, abre un issue primero.

## 📄 License

MIT

## 🙏 Acknowledgments

- Recharts para visualizaciones
- Lucide React para iconos
- TailwindCSS para estilos

---

**Desarrollado con ❤️ usando .NET y React**
