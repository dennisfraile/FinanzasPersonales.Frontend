import { useState } from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, AlertCircle, TrendingUp as TrendIcon, FileDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTendencias, useComparativa, useTopCategorias, useGastosTipo, useProyeccion } from '../hooks/useQueryHooks';

export const ReportesPage = () => {
    const [mesesAnalisis, setMesesAnalisis] = useState(6);

    const { data: tendencias, isLoading: isLoadingTendencias } = useTendencias(mesesAnalisis);
    const { data: comparativa } = useComparativa();
    const { data: topCategorias } = useTopCategorias();
    const { data: gastosTipo } = useGastosTipo();
    const { data: proyeccion } = useProyeccion();

    const isLoading = isLoadingTendencias;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(value);
    };

    const formatPercent = (value: number) => {
        return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
    };

    const handleExportExcel = async () => {
        try {
            const desde = new Date();
            desde.setMonth(desde.getMonth() - mesesAnalisis);
            const hasta = new Date();

            const response = await fetch('/api/Export/excel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    desde: desde.toISOString(),
                    hasta: hasta.toISOString(),
                    incluir: ['gastos', 'ingresos', 'metas', 'presupuestos']
                })
            });

            if (!response.ok) throw new Error('Error al exportar');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Finanzas_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            toast.success('¡Reporte Excel descargado!');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al exportar a Excel');
        }
    };

    const handleExportPdf = async () => {
        try {
            const desde = new Date();
            desde.setMonth(desde.getMonth() - mesesAnalisis);
            const hasta = new Date();

            const response = await fetch('/api/Export/pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    desde: desde.toISOString(),
                    hasta: hasta.toISOString(),
                    incluir: ['gastos', 'ingresos']
                })
            });

            if (!response.ok) throw new Error('Error al exportar');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Reporte_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            toast.success('¡Reporte PDF descargado!');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al exportar a PDF');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-gray-600 dark:text-gray-400">Cargando reportes...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">📊 Reportes Avanzados</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Análisis profundo de tus finanzas</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <select
                            value={mesesAnalisis}
                            onChange={(e) => setMesesAnalisis(Number(e.target.value))}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            aria-label="Meses de análisis"
                        >
                            <option value={3}>Últimos 3 meses</option>
                            <option value={6}>Últimos 6 meses</option>
                            <option value={12}>Últimos 12 meses</option>
                        </select>
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <FileDown size={20} />
                            Excel
                        </button>
                        <button
                            onClick={handleExportPdf}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <FileDown size={20} />
                            PDF
                        </button>
                    </div>
                </div>

                {/* Tarjetas de Resumen */}
                {tendencias && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Promedio Ingresos</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                                        {formatCurrency(tendencias.datos.reduce((acc, d) => acc + d.totalIngresos, 0) / tendencias.datos.length)}
                                    </p>
                                </div>
                                <TrendingUp className="text-green-600 dark:text-green-400" size={32} />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Promedio Gastos</p>
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                                        {formatCurrency(tendencias.datos.reduce((acc, d) => acc + d.totalGastos, 0) / tendencias.datos.length)}
                                    </p>
                                </div>
                                <TrendingDown className="text-red-600 dark:text-red-400" size={32} />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Promedio Balance</p>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                                        {formatCurrency(tendencias.datos.reduce((acc, d) => acc + d.balance, 0) / tendencias.datos.length)}
                                    </p>
                                </div>
                                <BarChart3 className="text-blue-600 dark:text-blue-400" size={32} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Proyección del Mes Actual */}
                {proyeccion && (
                    <div className={`rounded-xl shadow-sm p-6 ${proyeccion.proyeccion.alerta ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                        <div className="flex items-start gap-4">
                            <AlertCircle className={proyeccion.proyeccion.alerta ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'} size={32} />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                                    Proyección del Mes Actual
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 mb-3">{proyeccion.proyeccion.mensaje}</p>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Gastado hasta hoy</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(proyeccion.mesActual.gastosActuales)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Gasto estimado</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(proyeccion.proyeccion.gastoEstimado)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Promedio (3 meses)</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(proyeccion.proyeccion.promedioUltimos3Meses)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Progreso del mes</p>
                                        <div className="mt-1">
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${proyeccion.proyeccion.alerta ? 'bg-red-600' : 'bg-blue-600'}`}
                                                    style={{ width: `${(proyeccion.mesActual.diasTranscurridos / proyeccion.mesActual.diasTotales) * 100}%` }}
                                                />
                                            </div>
                                            <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                                                Día {proyeccion.mesActual.diasTranscurridos} de {proyeccion.mesActual.diasTotales}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Gráfica de Tendencias */}
                {tendencias && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <TrendIcon className="text-blue-600" />
                            Tendencias Mensuales
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={tendencias.datos}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="periodo" />
                                <YAxis />
                                <Tooltip formatter={(value: number | undefined) => value ? formatCurrency(value) : '$0.00'} />
                                <Legend />
                                <Line type="monotone" dataKey="totalIngresos" stroke="#10b981" name="Ingresos" strokeWidth={2} />
                                <Line type="monotone" dataKey="totalGastos" stroke="#ef4444" name="Gastos" strokeWidth={2} />
                                <Line type="monotone" dataKey="balance" stroke="#3b82f6" name="Balance" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Comparativa Mes a Mes */}
                    {comparativa && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                Comparativa Mes a Mes
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <span className="text-gray-700 dark:text-gray-300">Ingresos</span>
                                    <span className={`font-semibold ${comparativa.cambios.ingresosPorcentaje >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatPercent(comparativa.cambios.ingresosPorcentaje)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <span className="text-gray-700 dark:text-gray-300">Gastos</span>
                                    <span className={`font-semibold ${comparativa.cambios.gastosPorcentaje <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatPercent(comparativa.cambios.gastosPorcentaje)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <span className="text-gray-700 dark:text-gray-300">Balance</span>
                                    <span className={`font-semibold ${comparativa.cambios.balancePorcentaje >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatPercent(comparativa.cambios.balancePorcentaje)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Top 5 Categorías */}
                    {topCategorias && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <BarChart3 className="text-purple-600" />
                                Top Categorías
                            </h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={topCategorias.categorias} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="nombre" type="category" width={100} />
                                    <Tooltip formatter={(value: number | undefined) => value ? formatCurrency(value) : '$0.00'} />
                                    <Bar dataKey="total" fill="#8b5cf6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Gastos Fijos vs Variables */}
                {gastosTipo && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <PieChartIcon className="text-orange-600" />
                            Gastos: Fijos vs Variables
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Fijos', value: gastosTipo.gastosFijos.total },
                                            { name: 'Variables', value: gastosTipo.gastosVariables.total }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(entry) => `${entry.name}: ${entry.value.toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        <Cell fill="#3b82f6" />
                                        <Cell fill="#ef4444" />
                                    </Pie>
                                    <Tooltip formatter={(value: number | undefined) => value ? formatCurrency(value) : '$0.00'} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-col justify-center space-y-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-4 h-4 bg-blue-600 rounded"></div>
                                        <span className="font-semibold text-gray-800 dark:text-white">Gastos Fijos</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(gastosTipo.gastosFijos.total)}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {gastosTipo.gastosFijos.porcentaje.toFixed(1)}% del total
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-4 h-4 bg-red-600 rounded"></div>
                                        <span className="font-semibold text-gray-800 dark:text-white">Gastos Variables</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(gastosTipo.gastosVariables.total)}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {gastosTipo.gastosVariables.porcentaje.toFixed(1)}% del total
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
