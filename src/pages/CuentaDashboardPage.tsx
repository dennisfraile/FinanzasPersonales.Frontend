import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCuentaDashboard, useAsignarSurplus, useMetas } from '../hooks/useQueryHooks';
import { useTheme } from '../context/ThemeContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
    ArrowLeft, ArrowUpCircle, ArrowDownCircle, Repeat, Calendar,
    Wallet, Building2, CreditCard, PiggyBank, TrendingUp,
    ChevronLeft, ChevronRight, Gift, Landmark
} from 'lucide-react';
import { toast } from 'react-toastify';
import type { TransaccionTimeline } from '../services/cuentaDashboardService';

const iconosPorTipo: Record<string, any> = {
    'Efectivo': Wallet,
    'CuentaBancaria': Building2,
    'TarjetaCredito': CreditCard,
    'Ahorros': PiggyBank,
    'Inversion': TrendingUp
};

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const formatDate = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

const tipoConfig: Record<string, { color: string; label: string; signo: string }> = {
    Ingreso: { color: 'text-green-600', label: 'Ingreso', signo: '+' },
    Gasto: { color: 'text-red-600', label: 'Gasto', signo: '-' },
    TransferenciaEntrada: { color: 'text-blue-600', label: 'Transferencia entrada', signo: '+' },
    TransferenciaSalida: { color: 'text-orange-600', label: 'Transferencia salida', signo: '-' },
};

export const CuentaDashboardPage = () => {
    const { cuentaId } = useParams<{ cuentaId: string }>();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [page, setPage] = useState(1);
    const [showSurplusModal, setShowSurplusModal] = useState(false);
    const pageSize = 20;

    const { data, isLoading, isError } = useCuentaDashboard(
        cuentaId ? parseInt(cuentaId) : null,
        page,
        pageSize
    );

    const Icono = data ? (iconosPorTipo[data.tipo] || Wallet) : Wallet;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-red-500 mb-4">Cuenta no encontrada</p>
                    <button onClick={() => navigate('/cuentas')} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                        Volver a Cuentas
                    </button>
                </div>
            </div>
        );
    }

    const totalPages = Math.ceil(data.totalTransacciones / pageSize);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/cuentas')}
                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ArrowLeft className="text-gray-600 dark:text-gray-400" size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full" style={{ backgroundColor: `${data.color || '#3B82F6'}20` }}>
                            <Icono size={28} style={{ color: data.color || '#3B82F6' }} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{data.nombre}</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {data.tipo.replace(/([A-Z])/g, ' $1').trim()} · {data.moneda}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Balance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Balance Actual</p>
                        <p className={`text-2xl font-bold ${data.balanceActual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(data.balanceActual)}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
                        <div className="flex items-center gap-2">
                            <Landmark size={16} className="text-blue-500" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">Balance Inicial (Ahorro)</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(data.balanceInicial)}</p>
                    </div>
                    {data.surplusActual && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Sobrante {data.surplusActual.periodo}
                            </p>
                            <p className={`text-2xl font-bold ${data.surplusActual.surplus > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                {formatCurrency(data.surplusActual.surplus)}
                            </p>
                            {data.surplusActual.surplus > 0 && (
                                <button
                                    onClick={() => setShowSurplusModal(true)}
                                    className="mt-2 text-sm px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Asignar sobrante
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Timeline de transacciones */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Movimientos ({data.totalTransacciones})
                    </h2>

                    {data.transacciones.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b dark:border-gray-700">
                                            <th className="text-left py-3 px-2 text-gray-500 dark:text-gray-400">Fecha</th>
                                            <th className="text-left py-3 px-2 text-gray-500 dark:text-gray-400">Descripcion</th>
                                            <th className="text-left py-3 px-2 text-gray-500 dark:text-gray-400">Tipo</th>
                                            <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400">Monto</th>
                                            <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400">Saldo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.transacciones.map((t: TransaccionTimeline, idx: number) => {
                                            const config = tipoConfig[t.tipo] || tipoConfig.Gasto;
                                            return (
                                                <tr key={`${t.tipo}-${t.id}-${idx}`} className="border-b dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                    <td className="py-3 px-2 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                        {formatDate(t.fecha)}
                                                    </td>
                                                    <td className="py-3 px-2 text-gray-900 dark:text-white">
                                                        <div className="flex items-center gap-2">
                                                            {t.descripcion}
                                                            {t.esRecurrente && (
                                                                <Repeat size={14} className="text-purple-500" title="Recurrente" />
                                                            )}
                                                        </div>
                                                        {t.categoria && (
                                                            <span className="text-xs text-gray-400">{t.categoria}</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                            t.tipo === 'Ingreso' || t.tipo === 'TransferenciaEntrada'
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                            {config.label}
                                                        </span>
                                                    </td>
                                                    <td className={`py-3 px-2 text-right font-medium ${config.color}`}>
                                                        {config.signo}{formatCurrency(t.monto)}
                                                    </td>
                                                    <td className="py-3 px-2 text-right font-medium text-gray-700 dark:text-gray-300">
                                                        {formatCurrency(t.balanceDespues)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginacion */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-700">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page <= 1}
                                        className="flex items-center gap-1 px-3 py-1 text-sm rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <ChevronLeft size={16} /> Anterior
                                    </button>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Pagina {page} de {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page >= totalPages}
                                        className="flex items-center gap-1 px-3 py-1 text-sm rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Siguiente <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-center text-gray-400 py-8">No hay movimientos en esta cuenta</p>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Grafica mensual */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Ingresos vs Gastos (6 meses)</h2>
                        {data.resumenMensual.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data.resumenMensual}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="periodo" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                    <Legend />
                                    <Bar dataKey="totalIngresos" fill="#10b981" name="Ingresos" />
                                    <Bar dataKey="totalGastos" fill="#ef4444" name="Gastos" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-center text-gray-400 py-8">Sin datos</p>
                        )}
                    </div>

                    {/* Proximos recurrentes */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            <Calendar size={20} className="inline mr-2" />
                            Proximos Recurrentes
                        </h2>
                        {data.proximos.length > 0 ? (
                            <div className="space-y-3">
                                {data.proximos.map((r) => (
                                    <div key={`${r.tipo}-${r.id}`} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            {r.tipo === 'Ingreso' ? (
                                                <ArrowUpCircle size={20} className="text-green-500" />
                                            ) : (
                                                <ArrowDownCircle size={20} className="text-red-500" />
                                            )}
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{r.descripcion}</p>
                                                <p className="text-xs text-gray-400">{r.frecuencia} · {formatDate(r.proximaFecha)}</p>
                                            </div>
                                        </div>
                                        <span className={`font-medium ${r.tipo === 'Ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                                            {r.tipo === 'Ingreso' ? '+' : '-'}{formatCurrency(r.monto)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-400 py-8">No hay recurrentes proximos para esta cuenta</p>
                        )}
                    </div>
                </div>

                {/* Modal de asignacion de surplus */}
                {showSurplusModal && data.surplusActual && (
                    <SurplusModal
                        cuentaId={data.cuentaId}
                        surplus={data.surplusActual.surplus}
                        periodo={data.surplusActual.periodo}
                        onClose={() => setShowSurplusModal(false)}
                    />
                )}
            </div>
        </div>
    );
};

// Componente Modal de Surplus
const SurplusModal = ({ cuentaId, surplus, periodo, onClose }: {
    cuentaId: number;
    surplus: number;
    periodo: string;
    onClose: () => void;
}) => {
    const { theme } = useTheme();
    const { data: metas = [] } = useMetas();
    const asignarMutation = useAsignarSurplus();
    const [destino, setDestino] = useState<'BalanceInicial' | 'Meta'>('BalanceInicial');
    const [metaId, setMetaId] = useState<number | undefined>();
    const [monto, setMonto] = useState(surplus);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await asignarMutation.mutateAsync({
                cuentaId,
                destino,
                metaId: destino === 'Meta' ? metaId : undefined,
                monto
            });
            toast.success('Sobrante asignado exitosamente');
            onClose();
        } catch {
            toast.error('Error al asignar el sobrante');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-md w-full p-6`}>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Asignar Sobrante</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Tienes {formatCurrency(surplus)} de sobrante en {periodo}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Destino</label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 p-3 rounded-lg border dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                                <input
                                    type="radio"
                                    name="destino"
                                    value="BalanceInicial"
                                    checked={destino === 'BalanceInicial'}
                                    onChange={() => setDestino('BalanceInicial')}
                                    className="text-blue-600"
                                />
                                <Landmark size={20} className="text-blue-500" />
                                <span className="text-gray-900 dark:text-white">Agregar al ahorro (Balance Inicial)</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 rounded-lg border dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                                <input
                                    type="radio"
                                    name="destino"
                                    value="Meta"
                                    checked={destino === 'Meta'}
                                    onChange={() => setDestino('Meta')}
                                    className="text-blue-600"
                                />
                                <Gift size={20} className="text-purple-500" />
                                <span className="text-gray-900 dark:text-white">Abonar a una meta</span>
                            </label>
                        </div>
                    </div>

                    {destino === 'Meta' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta</label>
                            <select
                                value={metaId || ''}
                                onChange={(e) => setMetaId(Number(e.target.value))}
                                required
                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">Seleccionar meta...</option>
                                {metas.map((m: any) => (
                                    <option key={m.id} value={m.id}>
                                        {m.metas} ({formatCurrency(m.ahorroActual)} / {formatCurrency(m.montoTotal)})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max={surplus}
                            value={monto}
                            onChange={(e) => setMonto(Number(e.target.value))}
                            required
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <p className="text-xs text-gray-400 mt-1">Maximo: {formatCurrency(surplus)}</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border rounded-lg text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={asignarMutation.isPending}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {asignarMutation.isPending ? 'Asignando...' : 'Asignar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
