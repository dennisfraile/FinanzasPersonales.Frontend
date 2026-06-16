import { useState } from 'react';
import { comparacionService, type ComparacionPeriodos } from '../services/comparacionService';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'react-toastify';
import HelpTooltip from '../components/HelpTooltip';
import { sectionHelp } from '../utils/helpContent';
import { formatCurrency } from '../utils/formatters';

export const ComparacionPage = () => {
    const [fecha1Inicio, setFecha1Inicio] = useState('');
    const [fecha1Fin, setFecha1Fin] = useState('');
    const [fecha2Inicio, setFecha2Inicio] = useState('');
    const [fecha2Fin, setFecha2Fin] = useState('');
    const [comparacion, setComparacion] = useState<ComparacionPeriodos | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">Comparación de períodos <HelpTooltip content={sectionHelp.comparacion} /></h1>

                {/* Selectores de Período */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4 text-blue-600 dark:text-blue-400">Período 1</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="periodo1-desde" className="block text-sm font-medium mb-1 dark:text-gray-300">Desde</label>
                                <input
                                    id="periodo1-desde"
                                    type="date"
                                    value={fecha1Inicio}
                                    onChange={(e) => setFecha1Inicio(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label htmlFor="periodo1-hasta" className="block text-sm font-medium mb-1 dark:text-gray-300">Hasta</label>
                                <input
                                    id="periodo1-hasta"
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
                                <label htmlFor="periodo2-desde" className="block text-sm font-medium mb-1 dark:text-gray-300">Desde</label>
                                <input
                                    id="periodo2-desde"
                                    type="date"
                                    value={fecha2Inicio}
                                    onChange={(e) => setFecha2Inicio(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label htmlFor="periodo2-hasta" className="block text-sm font-medium mb-1 dark:text-gray-300">Hasta</label>
                                <input
                                    id="periodo2-hasta"
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
                        {/* Comparación de totales - Desktop */}
                        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
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

                        {/* Comparación de totales - Mobile */}
                        <div className="md:hidden space-y-4">
                            {[
                                {
                                    label: 'Ingresos',
                                    p1: comparacion.periodo1.totalIngresos,
                                    p2: comparacion.periodo2.totalIngresos,
                                    diff: comparacion.diferenciaIngresos,
                                    pct: comparacion.porcentajeCambioIngresos,
                                    diffPositive: comparacion.diferenciaIngresos >= 0,
                                    pctPositive: comparacion.porcentajeCambioIngresos >= 0,
                                },
                                {
                                    label: 'Gastos',
                                    p1: comparacion.periodo1.totalGastos,
                                    p2: comparacion.periodo2.totalGastos,
                                    diff: comparacion.diferenciaGastos,
                                    pct: comparacion.porcentajeCambioGastos,
                                    diffPositive: comparacion.diferenciaGastos <= 0,
                                    pctPositive: comparacion.porcentajeCambioGastos <= 0,
                                },
                                {
                                    label: 'Balance',
                                    p1: comparacion.periodo1.balance,
                                    p2: comparacion.periodo2.balance,
                                    diff: comparacion.diferenciaBalance,
                                    pct: null,
                                    diffPositive: comparacion.diferenciaBalance >= 0,
                                    pctPositive: false,
                                },
                            ].map((row) => (
                                <div key={row.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-lg dark:text-white">{row.label}</h3>
                                        {row.pct !== null && (
                                            <span className={`flex items-center gap-1 text-sm font-semibold ${row.pctPositive ? 'text-green-600' : 'text-red-600'}`}>
                                                {row.pct >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                                {row.pct.toFixed(2)}%
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-blue-600 dark:text-blue-400 font-medium">Período 1</p>
                                            <p className="dark:text-gray-300">{formatCurrency(row.p1)}</p>
                                        </div>
                                        <div>
                                            <p className="text-green-600 dark:text-green-400 font-medium">Período 2</p>
                                            <p className="dark:text-gray-300">{formatCurrency(row.p2)}</p>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t dark:border-gray-700">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Diferencia:</span>
                                            <span className={`font-semibold ${row.diffPositive ? 'text-green-600' : 'text-red-600'}`}>
                                                {row.diff >= 0 ? '+' : ''}{formatCurrency(row.diff)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
