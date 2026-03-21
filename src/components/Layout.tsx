import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    LayoutDashboard, DollarSign, TrendingDown, Target, FileText, Tag, LogOut, User,
    Moon, Sun, Menu, X, BarChart3, Wallet, ArrowLeftRight, Repeat, Calendar,
    ChevronDown, TrendingUp, CreditCard, Lightbulb, RefreshCw, LineChart, Settings, Users,
    Zap, Upload, Copy, CalendarClock
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { NotificationBell } from './NotificationBell';
import OfflineIndicator from './OfflineIndicator';
import { useSignalR } from '../hooks/useSignalR';

interface LayoutProps {
    children: React.ReactNode;
}

interface MenuItem {
    path: string;
    icon: React.ElementType;
    label: string;
}

interface MenuGroup {
    key: string;
    label: string;
    groupIcon: React.ElementType;
    defaultOpen: boolean;
    items: MenuItem[];
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const { startConnection } = useSignalR();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    const userInitial = (user?.userName || user?.email || 'U').charAt(0).toUpperCase();

    const menuGroups: MenuGroup[] = [
        {
            key: 'general',
            label: 'General',
            groupIcon: LayoutDashboard,
            defaultOpen: true,
            items: [
                { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            ],
        },
        {
            key: 'movimientos',
            label: 'Movimientos',
            groupIcon: TrendingUp,
            defaultOpen: false,
            items: [
                { path: '/gastos', icon: TrendingDown, label: 'Gastos' },
                { path: '/ingresos', icon: DollarSign, label: 'Ingresos' },
                { path: '/gastos-compartidos', icon: Users, label: 'Compartidos' },
            ],
        },
        {
            key: 'cuentas',
            label: 'Cuentas',
            groupIcon: CreditCard,
            defaultOpen: false,
            items: [
                { path: '/cuentas', icon: Wallet, label: 'Cuentas' },
                { path: '/transferir', icon: ArrowLeftRight, label: 'Transferir' },
            ],
        },
        {
            key: 'planificacion',
            label: 'Planificación',
            groupIcon: Lightbulb,
            defaultOpen: false,
            items: [
                { path: '/metas', icon: Target, label: 'Metas' },
                { path: '/presupuestos', icon: FileText, label: 'Presupuestos' },
                { path: '/gastos-programados', icon: CalendarClock, label: 'Programados' },
                { path: '/deudas', icon: TrendingDown, label: 'Deudas' },
            ],
        },
        {
            key: 'recurrentes',
            label: 'Recurrentes',
            groupIcon: RefreshCw,
            defaultOpen: false,
            items: [
                { path: '/gastos-recurrentes', icon: Repeat, label: 'Gastos Recurrentes' },
                { path: '/ingresos-recurrentes', icon: Repeat, label: 'Ingresos Recurrentes' },
            ],
        },
        {
            key: 'analisis',
            label: 'Análisis',
            groupIcon: LineChart,
            defaultOpen: false,
            items: [
                { path: '/calendario', icon: Calendar, label: 'Calendario' },
                { path: '/comparacion', icon: BarChart3, label: 'Comparación' },
                { path: '/reportes', icon: BarChart3, label: 'Reportes' },
            ],
        },
        {
            key: 'herramientas',
            label: 'Herramientas',
            groupIcon: Zap,
            defaultOpen: false,
            items: [
                { path: '/plantillas', icon: Copy, label: 'Plantillas' },
                { path: '/reglas-categoria', icon: Zap, label: 'Auto-categorización' },
                { path: '/importar-csv', icon: Upload, label: 'Importar CSV' },
            ],
        },
        {
            key: 'configuracion',
            label: 'Configuración',
            groupIcon: Settings,
            defaultOpen: false,
            items: [
                { path: '/categorias', icon: Tag, label: 'Categorías' },
                { path: '/tags', icon: Tag, label: 'Tags' },
            ],
        },
    ];

    // Inicializar grupos abiertos: General abierto + cualquier grupo que tenga la ruta activa
    const getInitialOpenGroups = () => {
        const open: Record<string, boolean> = {};
        menuGroups.forEach((group) => {
            const hasActive = group.items.some((item) => item.path === location.pathname);
            open[group.key] = group.defaultOpen || hasActive;
        });
        return open;
    };

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(getInitialOpenGroups);

    // Iniciar conexión SignalR cuando el usuario está autenticado
    useEffect(() => {
        if (user) {
            startConnection().catch((err) => {
                console.error('SignalR connection failed:', err);
            });
        }
    }, [user, startConnection]);

    // Cerrar sidebar al cambiar de ruta
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // Abrir el grupo de la ruta activa al navegar
    useEffect(() => {
        menuGroups.forEach((group) => {
            if (group.items.some((item) => item.path === location.pathname)) {
                setOpenGroups((prev) => ({ ...prev, [group.key]: true }));
            }
        });
    }, [location.pathname]);

    // Cerrar dropdown de perfil al hacer click fuera
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const toggleGroup = (key: string) => {
        setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            {/* Navbar */}
            <nav className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-20 transition-colors">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-2">
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
                            <img src="/logo.png" alt="Mis finanzas" className="h-8 w-8 rounded-full object-cover" />
                            <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                                Mis finanzas
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

                            {/* Profile Dropdown */}
                            <div className="relative" ref={profileRef}>
                                <button
                                    type="button"
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {user?.fotoUrl ? (
                                        <img src={user.fotoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                                            {userInitial}
                                        </div>
                                    )}
                                    <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {user?.userName || user?.email}
                                    </span>
                                    <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                                </button>

                                {profileOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-white">{user?.userName || 'Usuario'}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { setProfileOpen(false); navigate('/perfil'); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <User size={16} />
                                            Mi Perfil
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setProfileOpen(false); logout(); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <LogOut size={16} />
                                            Cerrar Sesion
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex relative">
                {/* Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 top-16 bg-black/50 z-30 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`
                        fixed top-16 left-0 h-[calc(100vh-4rem)] w-64
                        bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-800
                        border-r border-gray-200 dark:border-slate-700/50
                        shadow-lg dark:shadow-none
                        transition-transform duration-300 ease-in-out
                        z-40
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}
                >
                    <nav className="px-3 py-4 overflow-y-auto h-full sidebar-scroll space-y-1">
                        {menuGroups.map((group) => {
                            const GroupIcon = group.groupIcon;
                            const isOpen = openGroups[group.key] ?? group.defaultOpen;
                            const hasActive = group.items.some((item) => isActive(item.path));

                            return (
                                <div key={group.key}>
                                    {/* Group header */}
                                    <button
                                        type="button"
                                        onClick={() => toggleGroup(group.key)}
                                        className={`
                                            w-full flex items-center gap-2 px-3 py-2 rounded-lg
                                            text-xs font-semibold uppercase tracking-wider
                                            transition-colors duration-150 select-none
                                            ${hasActive
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                                            }
                                        `}
                                    >
                                        <GroupIcon size={14} className="shrink-0" />
                                        <span className="flex-1 text-left">{group.label}</span>
                                        <ChevronDown
                                            size={14}
                                            className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    {/* Group items */}
                                    {isOpen && (
                                        <div className="mt-0.5 mb-1 space-y-0.5">
                                            {group.items.map((item) => {
                                                const Icon = item.icon;
                                                const active = isActive(item.path);
                                                return (
                                                    <Link
                                                        key={item.path}
                                                        to={item.path}
                                                        className={`
                                                            flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                                                            ${active
                                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                                                                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white'
                                                            }
                                                        `}
                                                    >
                                                        <Icon size={20} className="shrink-0" />
                                                        <span className="whitespace-nowrap text-sm">{item.label}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main content */}
                <main className="flex-1 transition-all duration-300">
                    {children}
                </main>
            </div>

            <OfflineIndicator />
        </div>
    );
};
