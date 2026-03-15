import { useState } from 'react';
import { usePresupuestoDashboard } from '../hooks/useQueryHooks';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, DollarSign } from 'lucide-react';

const PERIODOS = ['Semanal', 'Quincenal', 'Mensual', 'Trimestral', 'Semestral', 'Anual'] as const;

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export const PresupuestoDashboardPage = () => {
    const [periodo, setPeriodo] = useState('Semanal');
    const { data, isLoading, isError } = usePresupuestoDashboard(periodo);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const getBarColor = (porcentaje: number) => {
        if (porcentaje >= 100) return '#EF4444';
        if (porcentaje >= 80) return '#F59E0B';
        return '#10B981';
    };

    const chartData = data?.comparaciones.map(c => ({
        categoria: c.categoriaNombre.length > 12 ? c.categoriaNombre.slice(0, 12) + '...' : c.categoriaNombre,
        categoriaFull: c.categoriaNombre,
        presupuesto: c.montoLimite,
        gastado: c.gastadoActual,
        porcentaje: c.porcentajeUtilizado,
    })) ?? [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                            Presupuesto vs Gasto Real
                        </h1>
                        {data && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{data.periodoLabel}</p>
                        )}
                    </div>
                </div>

                {/* Selector de periodo */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 mb-6">
                    <div className="flex flex-wrap gap-2">
                        {PERIODOS.map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriodo(p)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    periodo === p
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {isError && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6">
                        Error al cargar el dashboard de presupuestos
                    </div>
                )}

                {data && (
                    <>
                        {/* Resumen cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Presupuestado</p>
                                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(data.totalPresupuestado)}</p>
                                    </div>
                                    <DollarSign className="text-blue-500" size={32} />
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Gastado</p>
                                        <p className="text-2xl font-bold text-red-600">{formatCurrency(data.totalGastado)}</p>
                                    </div>
                                    <TrendingDown className="text-red-500" size={32} />
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Disponible</p>
                                        <p className={`text-2xl font-bold ${data.totalDisponible >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(data.totalDisponible)}
                                        </p>
                                    </div>
                                    <TrendingUp className={data.totalDisponible >= 0 ? 'text-green-500' : 'text-red-500'} size={32} />
                                </div>
                            </div>
                        </div>

                        {data.comparaciones.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
                                <DollarSign size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                <p className="text-lg text-gray-500 dark:text-gray-400">
                                    No tienes presupuestos configurados para el periodo {periodo.toLowerCase()}
                                </p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                                    Ve a Presupuestos y crea uno con periodo "{periodo}"
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Gráfica comparativa */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                        Comparación por Categoría
                                    </h2>
                                    <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 60)}>
                                        <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" stroke="#9ca3af" tickFormatter={(v) => `$${v}`} />
                                            <YAxis type="category" dataKey="categoria" stroke="#9ca3af" width={110} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                formatter={(value: number | string) => formatCurrency(Number(value))}
                                                labelFormatter={(label: string) => {
                                                    const item = chartData.find(c => c.categoria === label);
                                                    return item?.categoriaFull ?? label;
                                                }}
                                            />
                                            <Legend />
                                            <Bar dataKey="presupuesto" fill="#3B82F6" name="Presupuesto" radius={[0, 4, 4, 0]} />
                                            <Bar dataKey="gastado" name="Gastado" radius={[0, 4, 4, 0]}>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={index} fill={getBarColor(entry.porcentaje)} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Detalle por categoría */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                        Detalle por Categoría
                                    </h2>
                                    <div className="space-y-4">
                                        {data.comparaciones.map(c => {
                                            const level = c.porcentajeUtilizado >= 100 ? 'danger' : c.porcentajeUtilizado >= 80 ? 'warning' : 'normal';
                                            const barColor = level === 'danger' ? 'bg-red-500' : level === 'warning' ? 'bg-orange-500' : 'bg-green-500';
                                            return (
                                                <div key={c.presupuestoId} className="border-b dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-semibold text-gray-900 dark:text-white">{c.categoriaNombre}</h3>
                                                            {level === 'danger' && <AlertTriangle size={16} className="text-red-500" />}
                                                            {level === 'warning' && <AlertTriangle size={16} className="text-orange-500" />}
                                                            {level === 'normal' && <CheckCircle2 size={16} className="text-green-500" />}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm mt-1 sm:mt-0">
                                                            <span className="text-gray-500 dark:text-gray-400">
                                                                {formatCurrency(c.gastadoActual)} / {formatCurrency(c.montoLimite)}
                                                            </span>
                                                            <span className={`font-bold ${
                                                                level === 'danger' ? 'text-red-600' :
                                                                level === 'warning' ? 'text-orange-600' : 'text-green-600'
                                                            }`}>
                                                                {c.porcentajeUtilizado.toFixed(0)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                                        <div
                                                            className={`h-3 rounded-full transition-all ${barColor}`}
                                                            style={{ width: `${Math.min(c.porcentajeUtilizado, 100)}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between text-xs mt-1">
                                                        <span className={`${c.disponible >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {c.disponible >= 0 ? `Disponible: ${formatCurrency(c.disponible)}` : `Excedido: ${formatCurrency(Math.abs(c.disponible))}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
