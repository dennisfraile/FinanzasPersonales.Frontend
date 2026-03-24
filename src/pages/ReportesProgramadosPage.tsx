import { useState, useEffect } from 'react';
import { reportesProgramadosService, type ReporteProgramado, type CreateReporteProgramadoDto } from '../services/reportesProgramadosService';
import { Plus, Trash2, CalendarClock, Mail, Power, PowerOff, Pencil, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const FRECUENCIAS = [
    { value: 'Semanal', label: 'Semanal' },
    { value: 'Mensual', label: 'Mensual' },
];

const SECCIONES_DISPONIBLES = [
    { value: 'gastos', label: 'Gastos' },
    { value: 'ingresos', label: 'Ingresos' },
    { value: 'presupuestos', label: 'Presupuestos' },
    { value: 'metas', label: 'Metas' },
];

export const ReportesProgramadosPage = () => {
    const [reportes, setReportes] = useState<ReporteProgramado[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<CreateReporteProgramadoDto>({
        frecuencia: 'Semanal',
        emailDestino: '',
        seccionesIncluir: [],
        activo: true,
    });

    const fetchReportes = async () => {
        try {
            const data = await reportesProgramadosService.getAll();
            setReportes(data);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al cargar reportes programados');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportes();
    }, []);

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ frecuencia: 'Semanal', emailDestino: '', seccionesIncluir: [], activo: true });
        setModalOpen(true);
    };

    const handleOpenEdit = (reporte: ReporteProgramado) => {
        setEditingId(reporte.id);
        setFormData({
            frecuencia: reporte.frecuencia,
            emailDestino: reporte.emailDestino,
            seccionesIncluir: reporte.seccionesIncluir ? reporte.seccionesIncluir.split(',').map(s => s.trim()) : [],
            activo: reporte.activo,
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.emailDestino.trim()) {
            toast.error('El email es obligatorio');
            return;
        }
        if (formData.seccionesIncluir.length === 0) {
            toast.error('Selecciona al menos una sección');
            return;
        }
        try {
            if (editingId) {
                await reportesProgramadosService.update(editingId, formData);
                toast.success('Reporte actualizado');
            } else {
                await reportesProgramadosService.create(formData);
                toast.success('Reporte programado creado');
            }
            setModalOpen(false);
            fetchReportes();
        } catch (error: any) {
            console.error('Error:', error);
            toast.error(error?.response?.data || 'Error al guardar reporte');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Eliminar este reporte programado?')) return;
        try {
            await reportesProgramadosService.delete(id);
            toast.success('Reporte eliminado');
            fetchReportes();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al eliminar reporte');
        }
    };

    const handleToggle = async (id: number) => {
        try {
            await reportesProgramadosService.toggleActivo(id);
            fetchReportes();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al cambiar estado');
        }
    };

    const toggleSeccion = (seccion: string) => {
        setFormData(prev => ({
            ...prev,
            seccionesIncluir: prev.seccionesIncluir.includes(seccion)
                ? prev.seccionesIncluir.filter(s => s !== seccion)
                : [...prev.seccionesIncluir, seccion],
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <CalendarClock size={28} />
                            Reportes programados
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Configura reportes automáticos por email</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Nuevo
                    </button>
                </div>

                {/* List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 size={32} className="text-indigo-600 animate-spin" />
                    </div>
                ) : reportes.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
                        <CalendarClock size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                            No tienes reportes programados
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Crea un reporte para recibir resúmenes automáticos por email
                        </p>
                        <button type="button" onClick={handleOpenCreate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                            <Plus size={18} className="inline mr-1" /> Crear primer reporte
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reportes.map((reporte) => (
                            <div
                                key={reporte.id}
                                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border transition-colors ${
                                    reporte.activo
                                        ? 'border-gray-200 dark:border-gray-700'
                                        : 'border-gray-200 dark:border-gray-700 opacity-60'
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Mail size={16} className="text-gray-500 dark:text-gray-400 shrink-0" />
                                            <span className="font-medium text-gray-800 dark:text-white truncate">{reporte.emailDestino}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                reporte.activo
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                            }`}>
                                                {reporte.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                                            <span>Frecuencia: <strong>{reporte.frecuencia}</strong></span>
                                            <span>Secciones: <strong>{reporte.seccionesIncluir}</strong></span>
                                        </div>
                                        {reporte.ultimoEnvio && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Último envío: {new Date(reporte.ultimoEnvio).toLocaleString()}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                            Creado: {new Date(reporte.fechaCreacion).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => handleToggle(reporte.id)}
                                            className={`p-2 rounded-lg transition-colors ${
                                                reporte.activo
                                                    ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                            title={reporte.activo ? 'Desactivar' : 'Activar'}
                                        >
                                            {reporte.activo ? <Power size={18} /> : <PowerOff size={18} />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEdit(reporte)}
                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(reporte.id)}
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal Create/Edit */}
                {modalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4 dark:text-white">
                                {editingId ? 'Editar reporte' : 'Nuevo reporte programado'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email destino</label>
                                    <input
                                        type="email"
                                        value={formData.emailDestino}
                                        onChange={(e) => setFormData({ ...formData, emailDestino: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="correo@ejemplo.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Frecuencia</label>
                                    <select
                                        value={formData.frecuencia}
                                        onChange={(e) => setFormData({ ...formData, frecuencia: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        {FRECUENCIAS.map(f => (
                                            <option key={f.value} value={f.value}>{f.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Secciones a incluir</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {SECCIONES_DISPONIBLES.map(sec => (
                                            <label
                                                key={sec.value}
                                                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                                                    formData.seccionesIncluir.includes(sec.value)
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400'
                                                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.seccionesIncluir.includes(sec.value)}
                                                    onChange={() => toggleSeccion(sec.value)}
                                                    className="rounded text-indigo-600"
                                                />
                                                <span className="text-sm dark:text-gray-300">{sec.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                                        {editingId ? 'Guardar cambios' : 'Crear'}
                                    </button>
                                    <button type="button" onClick={() => setModalOpen(false)} className="flex-1 bg-gray-200 dark:bg-gray-600 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
