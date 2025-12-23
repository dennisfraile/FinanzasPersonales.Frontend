import { useEffect, useState } from 'react';
import { dashboardService, type DashboardData, type GraficaData } from '../services/dashboardService';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Target, Wallet } from 'lucide-react';
import { useCuentas } from '../hooks/useCuentas';

export const DashboardPage = () => {
    const [resumen, setResumen] = useState<DashboardData | null>(null);
    const [ingresosVsGastos, setIngresosVsGastos] = useState<GraficaData | null>(null);
    const [gastosPorCategoria, setGastosPorCategoria] = useState<GraficaData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1); // 1-12
    const [anoSeleccionado, setAnoSeleccionado] = useState(new Date().getFullYear());
    const { cuentas } = useCuentas(); // NUEVO: Para distribución

    useEffect(() => {
        loadDashboardData();
    }, [mesSeleccionado, anoSeleccionado]);

    const loadDashboardData = async () => {
        try {
            const [resumenData, ingresosData, gastosData] = await Promise.all([
                dashboardService.getResumen(mesSeleccionado, anoSeleccionado),
                dashboardService.getIngresosVsGastos(),
                dashboardService.getGastosPorCategoria(mesSeleccionado, anoSeleccionado),
            ]);

            setResumen(resumenData);
            setIngresosVsGastos(ingresosData);
            setGastosPorCategoria(gastosData);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-xl text-gray-600 dark:text-gray-400">Cargando dashboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                <div className="mb-6 sm:mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">Dashboard</h2>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Resumen de tus finanzas</p>
                </div>

                {/* Filtros de Mes y Año */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mes</label>
                            <select
                                value={mesSeleccionado}
                                onChange={(e) => setMesSeleccionado(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value={1}>Enero</option>
                                <option value={2}>Febrero</option>
                                <option value={3}>Marzo</option>
                                <option value={4}>Abril</option>
                                <option value={5}>Mayo</option>
                                <option value={6}>Junio</option>
                                <option value={7}>Julio</option>
                                <option value={8}>Agosto</option>
                                <option value={9}>Septiembre</option>
                                <option value={10}>Octubre</option>
                                <option value={11}>Noviembre</option>
                                <option value={12}>Diciembre</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Año</label>
                            <select
                                value={anoSeleccionado}
                                onChange={(e) => setAnoSeleccionado(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Cards de Resumen */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 p-4 sm:p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs sm:text-sm font-medium opacity-90">Ingresos</span>
                            <TrendingUp size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold">${resumen?.mesActual?.totalIngresos?.toFixed(2) ?? '0.00'}</p>
                        <p className="text-xs opacity-75 mt-1">Este mes</p>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 p-4 sm:p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs sm:text-sm font-medium opacity-90">Gastos</span>
                            <TrendingDown size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold">${resumen?.mesActual?.totalGastos?.toFixed(2) ?? '0.00'}</p>
                        <p className="text-xs opacity-75 mt-1">Este mes</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-4 sm:p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs sm:text-sm font-medium opacity-90">Balance</span>
                            <Wallet size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold">${resumen?.mesActual?.balance?.toFixed(2) ?? '0.00'}</p>
                        <p className="text-xs opacity-75 mt-1">Este mes</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 p-4 sm:p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs sm:text-sm font-medium opacity-90">Presupuestos</span>
                            <Target size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold">{resumen?.mesActual?.presupuestosActivos ?? 0}</p>
                        <p className="text-xs opacity-75 mt-1">Activos</p>
                    </div>
                </div>

                {/* Gráficas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {/* Ingresos vs Gastos */}
                    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg transition-colors">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-4">
                            {ingresosVsGastos?.titulo ?? 'Ingresos vs Gastos'}
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={ingresosVsGastos?.datos ?? []}>
                                <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
                                <XAxis dataKey="etiqueta" className="text-xs sm:text-sm" stroke="#9ca3af" />
                                <YAxis className="text-xs sm:text-sm" stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white'
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="valor" fill="#3b82f6" name="Monto" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Gastos por Categoría */}
                    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg transition-colors">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-4">
                            {gastosPorCategoria?.titulo ?? 'Gastos por Categoría'}
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={gastosPorCategoria?.datos ?? []}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry: any) => `${entry.etiqueta}: ${(entry.percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="valor"
                                    nameKey="etiqueta"
                                >
                                    {(gastosPorCategoria?.datos ?? []).map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* NUEVO: Distribución de Fondos por Cuenta */}
            {cuentas && cuentas.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mt-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-4">
                        💰 Distribución de Fondos por Cuenta
                    </h2>
                    <div className="h-64 sm:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={cuentas.map(c => ({ name: c.nombre, value: c.balanceActual }))}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={(entry) => `${entry.name}: $${entry.value.toFixed(2)}`}
                                >
                                    {cuentas.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white'
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};
