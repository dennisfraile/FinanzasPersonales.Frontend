import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.png'],
      manifest: {
        name: 'Mis Finanzas Personales',
        short_name: 'MisFinanzas',
        description: 'Gestión de finanzas personales',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/logo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Nuevo gasto',
            short_name: 'Gasto',
            url: '/gastos?action=new',
            icons: [{ src: '/logo.png', sizes: '192x192' }],
          },
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            url: '/dashboard',
            icons: [{ src: '/logo.png', sizes: '192x192' }],
          },
          {
            name: 'Presupuestos',
            short_name: 'Presupuestos',
            url: '/presupuestos',
            icons: [{ src: '/logo.png', sizes: '192x192' }],
          },
        ],
        categories: ['finance', 'productivity'],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/(categorias|cuentas|tags)/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-static-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 1800, // 30 min - datos que cambian poco
              },
            },
          },
          {
            urlPattern: /^https?:\/\/.*\/api\/(dashboard|presupuestos|metas)/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-dynamic-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 900, // 15 min
              },
            },
          },
          {
            urlPattern: /^https?:\/\/.*\/api\/(gastos|ingresos|deudas|GastosProgramados)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-transactions-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 300, // 5 min - datos que cambian seguido
              },
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-signalr': ['@microsoft/signalr'],
          'vendor-calendar': ['@fullcalendar/core', '@fullcalendar/daygrid', '@fullcalendar/react', '@fullcalendar/timegrid'],
        },
      },
    },
  },
})
