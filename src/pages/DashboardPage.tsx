import { useDashboardMetrics } from '../hooks/useQueryHooks';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export const DashboardPage = () => {
    const { data: metrics, isLoading, isError, refetch } = useDashboardMetrics();

    const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-xl text-gray-600 dark:text-gray-400">Cargando dashboard...</div>
                </div>
            </div>
        );
    }

    if (isError || !metrics) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-red-500 mb-4">Error al cargar el dashboard</p>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Verifica que el servidor esté funcionando</p>
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    const cambioColor = metrics.cambioMesAnterior > 0 ? 'text-red-600' : 'text-green-600';
    const cambioIcon = metrics.cambioMesAnterior > 0 ? <TrendingUp className="inline" size={20} /> : <TrendingDown className="inline" size={20} />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">📊 Dashboard</h1>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Ingresos del Mes</p>
                                <h3 className="text-2xl font-bold text-green-600">${metrics.totalIngresosDelMes.toFixed(2)}</h3>
                            </div>
                            <ArrowUpCircle className="text-green-600" size={40} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Gastos del Mes</p>
                                <h3 className="text-2xl font-bold text-red-600">${metrics.totalGastosDelMes.toFixed(2)}</h3>
                            </div>
                            <ArrowDownCircle className="text-red-600" size={40} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Balance</p>
                                <h3 className={`text-2xl font-bold ${metrics.balanceDelMes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${metrics.balanceDelMes.toFixed(2)}
                                </h3>
                            </div>
                            <Wallet className={metrics.balanceDelMes >= 0 ? 'text-green-600' : 'text-red-600'} size={40} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">vs Mes Anterior</p>
                                <h3 className={`text-2xl font-bold ${cambioColor}`}>
                                    {cambioIcon} {Math.abs(metrics.cambioMesAnterior).toFixed(1)}%
                                </h3>
                            </div>
                            <DollarSign className={cambioColor.replace('text-', '')} size={40} />
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Line Chart - Tendencia 6 Meses */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tendencia Últimos 6 Meses</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={metrics.tendencia6Meses}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="mes" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={2} name="Ingresos" />
                                <Line type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={2} name="Gastos" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Pie Chart - Top 5 Categorías */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Top 5 Categorías del Mes</h2>
                        {metrics.top5Categorias.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={metrics.top5Categorias as any}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="total"
                                    >
                                        {metrics.top5Categorias.map((_categoria, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                                No hay gastos este mes
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
