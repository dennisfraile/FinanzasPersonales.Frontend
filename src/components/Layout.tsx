import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, DollarSign, TrendingDown, Target, FileText, Tag, LogOut, Moon, Sun, Menu, X, User, BarChart3, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NotificationBell } from './NotificationBell';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    // Estado del sidebar: desktop siempre abierto, móvil cerrado por defecto
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        const saved = localStorage.getItem('sidebarOpen');
        return saved !== null ? JSON.parse(saved) : window.innerWidth >= 1024;
    });
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    // Detectar cambios de tamaño de pantalla
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Guardar preferencia en localStorage
    useEffect(() => {
        localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
    }, [sidebarOpen]);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Cerrar sidebar en móvil al navegar
    const handleLinkClick = () => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    };

    const isActive = (path: string) => location.pathname === path;

    const menuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/gastos', icon: TrendingDown, label: 'Gastos' },
        { path: '/ingresos', icon: DollarSign, label: 'Ingresos' },
        { path: '/metas', icon: Target, label: 'Metas' },
        { path: '/presupuestos', icon: FileText, label: 'Presupuestos' },
        { path: '/categorias', icon: Tag, label: 'Categorías' },
        { path: '/cuentas', icon: Wallet, label: 'Cuentas' },
        { path: '/reportes', icon: BarChart3, label: 'Reportes' },
        { path: '/perfil', icon: User, label: 'Mi Perfil' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            {/* Navbar */}
            <nav className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-20 transition-colors">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-2">
                            {/* Botón hamburguesa */}
                            <button
                                onClick={toggleSidebar}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:mr-2"
                                aria-label="Toggle sidebar"
                            >
                                {sidebarOpen ? (
                                    <X size={24} className="text-gray-600 dark:text-gray-300" />
                                ) : (
                                    <Menu size={24} className="text-gray-600 dark:text-gray-300" />
                                )}
                            </button>
                            <span className="text-2xl">💰</span>
                            <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                                Finanzas Personales
                            </h1>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <NotificationBell />
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                aria-label="Toggle theme"
                            >
                                {theme === 'light' ? (
                                    <Moon size={20} className="text-gray-600 dark:text-gray-300" />
                                ) : (
                                    <Sun size={20} className="text-gray-300" />
                                )}
                            </button>
                            <span className="text-gray-600 dark:text-gray-300 hidden sm:inline text-sm">
                                {user?.userName || user?.email}
                            </span>
                            <button
                                onClick={logout}
                                className="bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                            >
                                <LogOut size={18} />
                                <span className="hidden sm:inline">Salir</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex relative">
                {/* Overlay para móvil */}
                {isMobile && sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`
                        fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)]
                        bg-white dark:bg-gray-800 shadow-sm
                        transition-all duration-300 ease-in-out
                        z-10 lg:z-auto
                        ${isMobile
                            ? (sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64')
                            : (sidebarOpen ? 'w-64' : 'w-20')
                        }
                    `}
                >
                    <nav className="p-4 space-y-2 overflow-y-auto h-full">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={handleLinkClick}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    title={!sidebarOpen && !isMobile ? item.label : undefined}
                                >
                                    <Icon size={20} className="shrink-0" />
                                    <span className={`${!sidebarOpen && !isMobile ? 'hidden' : 'whitespace-nowrap'}`}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main content */}
                <main
                    className={`
                        flex-1 transition-all duration-300 
                        ${sidebarOpen && !isMobile ? 'lg:ml-0' : ''}
                    `}
                    onClick={() => {
                        if (sidebarOpen && !isMobile) {
                            setSidebarOpen(false);
                        }
                    }}
                >
                    {children}
                </main>
            </div>
        </div>
    );
};
