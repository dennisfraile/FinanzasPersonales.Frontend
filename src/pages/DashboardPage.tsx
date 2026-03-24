import { useDashboardMetrics, useGastos, usePresupuestos, useMetas, useCategorias, useGastosProgramados, useDeudas } from '../hooks/useQueryHooks';
import { useCuentas } from '../hooks/useCuentas';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpCircle, ArrowDownCircle, Landmark, CalendarClock, AlertTriangle, Target, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardSkeleton } from '../components/Skeleton';
import { StaggerList } from '../components/Animations';
import HelpTooltip from '../components/HelpTooltip';
import GlossaryModal from '../components/GlossaryModal';
import OnboardingWizard from '../components/OnboardingWizard';
import SuggestionBanner from '../components/SuggestionBanner';
import { sectionHelp, getProactiveSuggestions, getNaturalLanguageSummary } from '../utils/helpContent';
import { DashboardCustomizer, loadWidgetConfig, type WidgetConfig } from '../components/DashboardCustomizer';
import TrendIndicator from '../components/TrendIndicator';
import { useState, useMemo } from 'react';

export const DashboardPage = () => {
    const { data: metrics, isLoading, isError, refetch } = useDashboardMetrics();
    const { data: gastos = [] } = useGastos();
    const { data: presupuestos = [] } = usePresupuestos();
    const { data: metas = [] } = useMetas();
    const { data: categorias = [] } = useCategorias();
    const { cuentas } = useCuentas();
    const { data: programados = [] } = useGastosProgramados();
    const { data: deudas = [] } = useDeudas();
    const navigate = useNavigate();

    const [onboardingDismissed, setOnboardingDismissed] = useState(
        () => localStorage.getItem('onboarding_dismissed') === 'true'
    );
    const [widgetConfig, setWidgetConfig] = useState<WidgetConfig[]>(loadWidgetConfig);
    const isVisible = (id: string) => widgetConfig.find(w => w.id === id)?.visible ?? true;

    const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <DashboardSkeleton />
                </div>
            </div>
        );
    }

    if (isError || !metrics) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-red-500 mb-4">Error al cargar el dashboard</p>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Verifica que el servidor este funcionando</p>
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

    // Sugerencias proactivas
    const suggestions = getProactiveSuggestions({
        totalGastos: metrics.totalGastosDelMes,
        totalIngresos: metrics.totalIngresosDelMes,
        presupuestosCount: presupuestos.length,
        metasCount: metas.length,
        categoriasCount: categorias.length,
    });

    // Datos del mes anterior para tendencias
    const prevMonth = useMemo(() => {
        const trend = metrics?.tendencia6Meses;
        if (!trend || trend.length < 2) return { ingresos: 0, gastos: 0 };
        const prev = trend[trend.length - 2];
        return { ingresos: prev.ingresos || 0, gastos: prev.gastos || 0 };
    }, [metrics]);

    // Resumen en lenguaje natural
    const summary = getNaturalLanguageSummary(metrics);

    // Próximos gastos programados (pendientes, ordenados por fecha)
    const proximosProgramados = useMemo(() => {
        return programados
            .filter(gp => gp.estado === 'Pendiente')
            .sort((a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime())
            .slice(0, 5);
    }, [programados]);

    // Presupuestos en alerta (>80%)
    const presupuestosAlerta = useMemo(() => {
        return presupuestos
            .filter(p => p.porcentajeUtilizado >= 80)
            .sort((a, b) => b.porcentajeUtilizado - a.porcentajeUtilizado)
            .slice(0, 5);
    }, [presupuestos]);

    // Metas más cercanas a completarse
    const metasCercanas = useMemo(() => {
        return metas
            .filter(m => m.montoTotal > 0 && m.ahorroActual < m.montoTotal)
            .map(m => ({ ...m, porcentaje: (m.ahorroActual / m.montoTotal) * 100 }))
            .sort((a, b) => b.porcentaje - a.porcentaje)
            .slice(0, 5);
    }, [metas]);

    // Deudas próximas a vencer (con día de pago este mes)
    const deudasProximas = useMemo(() => {
        const hoy = new Date();
        return deudas
            .filter(d => d.activa && d.saldoActual > 0)
            .sort((a, b) => {
                const diaA = a.diaDePago || 31;
                const diaB = b.diaDePago || 31;
                const diffA = diaA - hoy.getDate();
                const diffB = diaB - hoy.getDate();
                return (diffA < 0 ? diffA + 30 : diffA) - (diffB < 0 ? diffB + 30 : diffB);
            })
            .slice(0, 5);
    }, [deudas]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                        <HelpTooltip content={sectionHelp.dashboard} />
                    </div>
                    <div className="flex items-center gap-2">
                        <DashboardCustomizer widgets={widgetConfig} onChange={setWidgetConfig} />
                        <GlossaryModal />
                    </div>
                </div>

                {/* Onboarding */}
                {!onboardingDismissed && (
                    <OnboardingWizard
                        hasCuentas={(cuentas?.length ?? 0) > 0}
                        hasCategorias={categorias.length > 0}
                        hasGastos={gastos.length > 0}
                        onDismiss={() => setOnboardingDismissed(true)}
                    />
                )}

                {/* Sugerencias proactivas */}
                <SuggestionBanner suggestions={suggestions} />

                {/* Resumen en lenguaje natural */}
                {isVisible('summary') && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border-l-4 border-blue-500">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{summary}</p>
                </div>
                )}

                {/* Metric Cards */}
                {isVisible('metrics') && (
                <StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Ingresos del Mes</p>
                                <h3 className="text-2xl font-bold text-green-600">${metrics.totalIngresosDelMes.toFixed(2)}</h3>
                            </div>
                            <ArrowUpCircle className="text-green-600" size={40} />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Total de dinero recibido este mes</p>
                        <TrendIndicator current={metrics.totalIngresosDelMes} previous={prevMonth.ingresos} />
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Gastos del Mes</p>
                                <h3 className="text-2xl font-bold text-red-600">${metrics.totalGastosDelMes.toFixed(2)}</h3>
                            </div>
                            <ArrowDownCircle className="text-red-600" size={40} />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Total de dinero gastado este mes</p>
                        <TrendIndicator current={metrics.totalGastosDelMes} previous={prevMonth.gastos} invertColors />
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Balance del Mes</p>
                                <h3 className={`text-2xl font-bold ${metrics.balanceDelMes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${metrics.balanceDelMes.toFixed(2)}
                                </h3>
                            </div>
                            <Wallet className={metrics.balanceDelMes >= 0 ? 'text-green-600' : 'text-red-600'} size={40} />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {metrics.balanceDelMes >= 0 ? 'Estas ahorrando dinero' : 'Gastas mas de lo que ganas'}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Balance en Cuentas</p>
                                <h3 className={`text-2xl font-bold ${metrics.balanceCuentas >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    ${metrics.balanceCuentas.toFixed(2)}
                                </h3>
                            </div>
                            <Landmark className={metrics.balanceCuentas >= 0 ? 'text-blue-600' : 'text-red-600'} size={40} />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Saldo total en todas tus cuentas activas</p>
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
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {metrics.cambioMesAnterior > 0 ? 'Tus gastos subieron comparado al mes pasado' : 'Tus gastos bajaron comparado al mes pasado'}
                        </p>
                    </div>
                </StaggerList>
                )}

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Line Chart */}
                    {isVisible('trend') && <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Tendencia Ultimos 6 Meses</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            Compara como cambian tus ingresos (verde) y gastos (rojo) mes a mes. Lo ideal es que la linea verde este siempre arriba.
                        </p>
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
                    </div>}

                    {/* Pie Chart */}
                    {isVisible('categories') && <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Top 5 Categorias del Mes</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            Muestra en que categorias gastas mas. Si una domina, considera crear un presupuesto para controlarla.
                        </p>
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
                                <div className="text-center">
                                    <p>No hay gastos este mes</p>
                                    <p className="text-xs mt-1">Registra un gasto para ver tus categorias aqui</p>
                                </div>
                            </div>
                        )}
                    </div>}
                </div>

                {/* Quick Info Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Próximos gastos programados */}
                    {isVisible('programados') && proximosProgramados.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <CalendarClock size={20} className="text-amber-500" />
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Próximos vencimientos</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate('/gastos-programados')}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Ver todos
                                </button>
                            </div>
                            <div className="space-y-3">
                                {proximosProgramados.map(gp => {
                                    const dias = gp.diasParaVencimiento;
                                    const colorDias = dias <= 3 ? 'text-red-600 bg-red-50 dark:bg-red-900/30' : dias <= 7 ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' : 'text-green-600 bg-green-50 dark:bg-green-900/30';
                                    return (
                                        <div key={gp.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{gp.descripcion}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{gp.categoriaNombre} · {new Date(gp.fechaVencimiento).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center gap-2 ml-3">
                                                <span className="text-sm font-semibold text-red-600">${gp.monto.toFixed(2)}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorDias}`}>
                                                    {dias <= 0 ? 'Hoy' : dias === 1 ? 'Mañana' : `${dias}d`}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Presupuestos en alerta */}
                    {isVisible('alertas') && presupuestosAlerta.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle size={20} className="text-red-500" />
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Presupuestos en alerta</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate('/presupuestos')}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Ver todos
                                </button>
                            </div>
                            <div className="space-y-3">
                                {presupuestosAlerta.map(p => {
                                    const pct = Math.min(p.porcentajeUtilizado, 100);
                                    const color = p.porcentajeUtilizado >= 100 ? 'bg-red-500' : 'bg-amber-500';
                                    return (
                                        <div key={p.id} className="py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">{p.categoriaNombre}</span>
                                                <span className={`text-xs font-semibold ${p.porcentajeUtilizado >= 100 ? 'text-red-600' : 'text-amber-600'}`}>
                                                    {p.porcentajeUtilizado.toFixed(0)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                ${p.gastadoActual.toFixed(2)} / ${p.montoLimite.toFixed(2)} · {p.periodo}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Metas más cercanas */}
                    {isVisible('metas') && metasCercanas.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Target size={20} className="text-emerald-500" />
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Metas más cercanas</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate('/metas')}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Ver todas
                                </button>
                            </div>
                            <div className="space-y-3">
                                {metasCercanas.map(m => {
                                    const pct = Math.min(m.porcentaje, 100);
                                    return (
                                        <div key={m.id} className="py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">{m.metas}</span>
                                                <span className="text-xs font-semibold text-emerald-600">{pct.toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                ${m.ahorroActual.toFixed(2)} / ${m.montoTotal.toFixed(2)} · Falta ${m.montoRestante.toFixed(2)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Deudas activas */}
                    {isVisible('deudas') && deudasProximas.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <CreditCard size={20} className="text-orange-500" />
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Deudas activas</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate('/deudas')}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Ver todas
                                </button>
                            </div>
                            <div className="space-y-3">
                                {deudasProximas.map(d => {
                                    const pct = Math.min(d.porcentajePagado, 100);
                                    return (
                                        <div key={d.id} className="py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">{d.nombre}</span>
                                                <span className="text-xs font-semibold text-orange-600">
                                                    {d.diaDePago ? `Dia ${d.diaDePago}` : d.tipo}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Saldo: ${d.saldoActual.toFixed(2)} · Pagado: {d.porcentajePagado.toFixed(0)}%
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
