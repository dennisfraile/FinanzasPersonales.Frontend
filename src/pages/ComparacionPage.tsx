import { useState } from 'react';
import { comparacionService, type ComparacionPeriodos } from '../services/comparacionService';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'react-toastify';

export const ComparacionPage = () => {
    const [fecha1Inicio, setFecha1Inicio] = useState('');
    const [fecha1Fin, setFecha1Fin] = useState('');
    const [fecha2Inicio, setFecha2Inicio] = useState('');
    const [fecha2Fin, setFecha2Fin] = useState('');
    const [comparacion, setComparacion] = useState<ComparacionPeriodos | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

    const handleComparar = async () => {
        if (!fecha1Inicio || !fecha1Fin || !fecha2Inicio || !fecha2Fin) {
            toast.error('Complete todas las fechas');
            return;
        }

        try {
            setIsLoading(true);
            const data = await comparacionService.compararPeriodos(
                fecha1Inicio,
                fecha1Fin,
                fecha2Inicio,
                fecha2Fin
            );
            setComparacion(data);
        } catch (error) {
            console.error('Error al comparar períodos:', error);
            toast.error('Error al comparar períodos');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">📊 Comparación de Períodos</h1>

                {/* Selectores de Período */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4 text-blue-600 dark:text-blue-400">Período 1</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Desde</label>
                                <input
                                    type="date"
                                    value={fecha1Inicio}
                                    onChange={(e) => setFecha1Inicio(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Hasta</label>
                                <input
                                    type="date"
                                    value={fecha1Fin}
                                    onChange={(e) => setFecha1Fin(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">Período 2</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Desde</label>
                                <input
                                    type="date"
                                    value={fecha2Inicio}
                                    onChange={(e) => setFecha2Inicio(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Hasta</label>
                                <input
                                    type="date"
                                    value={fecha2Fin}
                                    onChange={(e) => setFecha2Fin(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleComparar}
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
                >
                    {isLoading ? 'Comparando...' : 'Comparar Períodos'}
                </button>

                {/* Resultados */}
                {comparacion && (
                    <div className="mt-8 space-y-6">
                        {/* Comparación de totales */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Concepto</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-blue-600 dark:text-blue-400">Período 1</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-green-600 dark:text-green-400">Período 2</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold dark:text-white">Diferencia</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold dark:text-white">% Cambio</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-700">
                                    <tr>
                                        <td className="px-6 py-4 font-medium dark:text-white">Ingresos</td>
                                        <td className="px-6 py-4 text-right dark:text-gray-300">{formatCurrency(comparacion.periodo1.totalIngresos)}</td>
                                        <td className="px-6 py-4 text-right dark:text-gray-300">{formatCurrency(comparacion.periodo2.totalIngresos)}</td>
                                        <td className={`px-6 py-4 text-right font-semibold ${comparacion.diferenciaIngresos >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {comparacion.diferenciaIngresos >= 0 ? '+' : ''}{formatCurrency(comparacion.diferenciaIngresos)}
                                        </td>
                                        <td className={`px-6 py-4 text-right flex items-center justify-end gap-2 ${comparacion.porcentajeCambioIngresos >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {comparacion.porcentajeCambioIngresos >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                            {comparacion.porcentajeCambioIngresos.toFixed(2)}%
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-medium dark:text-white">Gastos</td>
                                        <td className="px-6 py-4 text-right dark:text-gray-300">{formatCurrency(comparacion.periodo1.totalGastos)}</td>
                                        <td className="px-6 py-4 text-right dark:text-gray-300">{formatCurrency(comparacion.periodo2.totalGastos)}</td>
                                        <td className={`px-6 py-4 text-right font-semibold ${comparacion.diferenciaGastos <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {comparacion.diferenciaGastos >= 0 ? '+' : ''}{formatCurrency(comparacion.diferenciaGastos)}
                                        </td>
                                        <td className={`px-6 py-4 text-right flex items-center justify-end gap-2 ${comparacion.porcentajeCambioGastos <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {comparacion.porcentajeCambioGastos >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                            {comparacion.porcentajeCambioGastos.toFixed(2)}%
                                        </td>
                                    </tr>
                                    <tr className="bg-gray-50 dark:bg-gray-700">
                                        <td className="px-6 py-4 font-bold dark:text-white">Balance</td>
                                        <td className="px-6 py-4 text-right font-bold dark:text-white">{formatCurrency(comparacion.periodo1.balance)}</td>
                                        <td className="px-6 py-4 text-right font-bold dark:text-white">{formatCurrency(comparacion.periodo2.balance)}</td>
                                        <td className={`px-6 py-4 text-right font-bold ${comparacion.diferenciaBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {comparacion.diferenciaBalance >= 0 ? '+' : ''}{formatCurrency(comparacion.diferenciaBalance)}
                                        </td>
                                        <td className="px-6 py-4"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
