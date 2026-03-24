import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { dashboardCompartidoService } from '../services/dashboardCompartidoService';
import { LayoutDashboard, TrendingDown, DollarSign, Target, FileText, AlertCircle, Loader2 } from 'lucide-react';

interface SharedDashboardData {
    destinatario: string | null;
    secciones: string[];
    datos: {
        gastos?: { total: number; cantidad: number; items?: any[] };
        ingresos?: { total: number; cantidad: number; items?: any[] };
        presupuestos?: { total: number; cantidad: number; items?: any[] };
        metas?: { total: number; cantidad: number; items?: any[] };
    };
}

export const DashboardCompartidoPage = () => {
    const { token } = useParams<{ token: string }>();
    const [data, setData] = useState<SharedDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!token) {
                setError('Token no proporcionado');
                setLoading(false);
                return;
            }
            try {
                const result = await dashboardCompartidoService.verDashboard(token);
                setData(result);
            } catch (err: any) {
                if (err?.response?.status === 404) {
                    setError('Este enlace no existe o ha sido revocado.');
                } else if (err?.response?.status === 410) {
                    setError('Este enlace ha expirado.');
                } else {
                    setError('No se pudo cargar el dashboard compartido. El enlace puede ser inválido o haber expirado.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={48} className="mx-auto text-indigo-600 animate-spin mb-4" />
                    <p className="text-gray-600">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
                    <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Enlace no disponible</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const sectionConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
        gastos: { label: 'Gastos', icon: TrendingDown, color: 'text-red-600', bgColor: 'bg-red-50' },
        ingresos: { label: 'Ingresos', icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-50' },
        presupuestos: { label: 'Presupuestos', icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50' },
        metas: { label: 'Metas', icon: Target, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <LayoutDashboard size={20} className="text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-800">
                                Vista compartida{data.destinatario ? ` de ${data.destinatario}` : ''}
                            </h1>
                            <p className="text-xs text-gray-500">Dashboard de solo lectura</p>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Secciones disponibles */}
                {data.secciones && data.secciones.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {data.secciones.map((sec) => {
                            const cfg = sectionConfig[sec.toLowerCase()];
                            if (!cfg) return null;
                            return (
                                <span key={sec} className={`px-3 py-1 rounded-full text-xs font-medium ${cfg.bgColor} ${cfg.color}`}>
                                    {cfg.label}
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {Object.entries(data.datos || {}).map(([key, value]) => {
                        const cfg = sectionConfig[key];
                        if (!cfg || !value) return null;
                        const Icon = cfg.icon;
                        return (
                            <div key={key} className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-lg ${cfg.bgColor} flex items-center justify-center`}>
                                        <Icon size={20} className={cfg.color} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">{cfg.label}</p>
                                        <p className={`text-xl font-bold ${cfg.color}`}>
                                            ${typeof value.total === 'number' ? value.total.toFixed(2) : '0.00'}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">
                                    {value.cantidad ?? 0} {value.cantidad === 1 ? 'registro' : 'registros'}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Detail sections */}
                {Object.entries(data.datos || {}).map(([key, value]) => {
                    const cfg = sectionConfig[key];
                    if (!cfg || !value?.items || value.items.length === 0) return null;
                    return (
                        <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                            <div className="px-5 py-4 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-800">{cfg.label}</h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {value.items.map((item: any, idx: number) => (
                                    <div key={idx} className="px-5 py-3 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">
                                                {item.descripcion || item.nombre || item.categoria || `Registro ${idx + 1}`}
                                            </p>
                                            {item.fecha && (
                                                <p className="text-xs text-gray-500">
                                                    {new Date(item.fecha).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                        {typeof item.monto === 'number' && (
                                            <span className={`font-semibold ${cfg.color}`}>
                                                ${item.monto.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Footer */}
                <div className="text-center py-8">
                    <p className="text-xs text-gray-400">
                        Este es un dashboard compartido de solo lectura. Los datos son proporcionados por el propietario de la cuenta.
                    </p>
                </div>
            </div>
        </div>
    );
};
