import { useState, useMemo } from 'react';
import { type GastoCompartido, type CreateGastoCompartidoDto, type CreateParticipanteDto, type ParticipanteGasto } from '../services/gastosCompartidosService';
import { Trash2, Plus, Search, Users, DollarSign, CheckCircle2, Clock, UserPlus, X, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import { Pagination } from '../components/Pagination';
import { useCategorias, useGastosCompartidos, useResumenSplit, useCreateGastoCompartido, useDeleteGastoCompartido, useLiquidarParticipante } from '../hooks/useQueryHooks';

const ITEMS_PER_PAGE = 9;

const METODOS_DIVISION = [
    { value: 'Equitativo', label: 'Equitativo (partes iguales)' },
    { value: 'Porcentaje', label: 'Por porcentaje' },
    { value: 'MontoFijo', label: 'Monto fijo por persona' },
];

export const GastosCompartidosPage = () => {
    const { data: gastos = [], isLoading } = useGastosCompartidos();
    const { data: resumen } = useResumenSplit();
    const { data: categorias = [] } = useCategorias();
    const createMutation = useCreateGastoCompartido();
    const deleteMutation = useDeleteGastoCompartido();
    const liquidarMutation = useLiquidarParticipante();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isLiquidarOpen, setIsLiquidarOpen] = useState(false);
    const [selectedGasto, setSelectedGasto] = useState<GastoCompartido | null>(null);
    const [selectedParticipante, setSelectedParticipante] = useState<ParticipanteGasto | null>(null);
    const [liquidarMonto, setLiquidarMonto] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState<'gastos' | 'resumen'>('gastos');

    const [formData, setFormData] = useState<CreateGastoCompartidoDto>({
        descripcion: '',
        montoTotal: 0,
        fecha: new Date().toISOString().split('T')[0],
        categoriaId: null,
        metodoDivision: 'Equitativo',
        participantes: [{ nombre: '', email: null, montoAsignado: null, porcentaje: null }],
    });

    const filteredGastos = useMemo(() => {
        if (!Array.isArray(gastos)) return [];
        return gastos.filter(g =>
            g.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.participantes.some(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [gastos, searchTerm]);

    const totalPages = Math.ceil(filteredGastos.length / ITEMS_PER_PAGE);
    const paginatedGastos = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredGastos.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredGastos, currentPage]);

    const addParticipante = () => {
        setFormData({
            ...formData,
            participantes: [...formData.participantes, { nombre: '', email: null, montoAsignado: null, porcentaje: null }],
        });
    };

    const removeParticipante = (index: number) => {
        if (formData.participantes.length <= 1) return;
        setFormData({
            ...formData,
            participantes: formData.participantes.filter((_, i) => i !== index),
        });
    };

    const updateParticipante = (index: number, field: keyof CreateParticipanteDto, value: string | number | null) => {
        const updated = [...formData.participantes];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, participantes: updated });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.participantes.some(p => !p.nombre.trim())) {
            toast.error('Todos los participantes deben tener nombre');
            return;
        }
        try {
            await createMutation.mutateAsync(formData);
            toast.success('Gasto compartido creado');
            handleCloseModal();
        } catch (error: any) {
            console.error('Error:', error);
            toast.error(error?.response?.data || 'Error al crear gasto compartido');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Eliminar este gasto compartido y todos sus participantes?')) {
            try {
                await deleteMutation.mutateAsync(id);
                toast.success('Gasto compartido eliminado');
            } catch (error) {
                console.error('Error:', error);
                toast.error('Error al eliminar');
            }
        }
    };

    const handleLiquidar = async () => {
        if (!selectedGasto || !selectedParticipante || liquidarMonto <= 0) return;
        try {
            await liquidarMutation.mutateAsync({
                gastoId: selectedGasto.id,
                participanteId: selectedParticipante.id,
                monto: liquidarMonto,
            });
            toast.success(`Pago de $${liquidarMonto.toFixed(2)} registrado para ${selectedParticipante.nombre}`);
            setIsLiquidarOpen(false);
            setSelectedParticipante(null);
            setLiquidarMonto(0);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al registrar pago');
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({
            descripcion: '',
            montoTotal: 0,
            fecha: new Date().toISOString().split('T')[0],
            categoriaId: null,
            metodoDivision: 'Equitativo',
            participantes: [{ nombre: '', email: null, montoAsignado: null, porcentaje: null }],
        });
    };

    const openLiquidar = (gasto: GastoCompartido, participante: ParticipanteGasto) => {
        setSelectedGasto(gasto);
        setSelectedParticipante(participante);
        setLiquidarMonto(participante.montoAsignado - participante.montoPagado);
        setIsLiquidarOpen(true);
    };

    const gastoCategorias = useMemo(() => {
        return categorias.filter((c: any) => c.tipo === 'Gasto');
    }, [categorias]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Gastos Compartidos</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Divide gastos con amigos, familia o roommates</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Nuevo
                    </button>
                </div>

                {/* Resumen Cards */}
                {resumen && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Pendiente por Cobrar</p>
                            <p className="text-xl font-bold text-orange-600 mt-1">${resumen.totalPendientePorCobrar.toFixed(2)}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Recuperado</p>
                            <p className="text-xl font-bold text-green-600 mt-1">${resumen.totalRecuperado.toFixed(2)}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Personas con Deuda</p>
                            <p className="text-xl font-bold text-indigo-600 mt-1">{resumen.deudores.length}</p>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('gastos')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'gastos' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        Gastos ({filteredGastos.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('resumen')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'resumen' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        Resumen por Persona
                    </button>
                </div>

                {/* Tab: Gastos */}
                {activeTab === 'gastos' && (
                    <>
                        {/* Search */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Buscar por descripción o participante..."
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredGastos.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
                                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                                    {searchTerm ? 'Sin resultados' : 'No tienes gastos compartidos'}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {searchTerm ? 'Intenta otra búsqueda' : 'Crea un gasto compartido para dividir cuentas con otros'}
                                </p>
                                {!searchTerm && (
                                    <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                                        <Plus size={18} className="inline mr-1" /> Crear primer gasto compartido
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {paginatedGastos.map((gasto) => (
                                        <GastoCompartidoCard
                                            key={gasto.id}
                                            gasto={gasto}
                                            onDelete={handleDelete}
                                            onDetail={(g) => { setSelectedGasto(g); setIsDetailOpen(true); }}
                                            onLiquidar={openLiquidar}
                                        />
                                    ))}
                                </div>
                                {totalPages > 1 && (
                                    <div className="mt-6">
                                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}

                {/* Tab: Resumen por Persona */}
                {activeTab === 'resumen' && resumen && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                        {resumen.deudores.length === 0 ? (
                            <div className="p-12 text-center">
                                <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Todo liquidado</h3>
                                <p className="text-gray-600 dark:text-gray-400">No hay deudas pendientes por cobrar.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {resumen.deudores.map((deudor, i) => {
                                    const porcentajePagado = deudor.totalDeuda > 0 ? (deudor.totalPagado / deudor.totalDeuda) * 100 : 0;
                                    return (
                                        <div key={i} className="p-4 sm:p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 dark:text-white text-lg">{deudor.nombre}</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Pagado: ${deudor.totalPagado.toFixed(2)} de ${deudor.totalDeuda.toFixed(2)}
                                                    </p>
                                                </div>
                                                <span className="text-lg font-bold text-orange-600">
                                                    ${deudor.pendiente.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="h-2 rounded-full bg-green-500 transition-all"
                                                    style={{ width: `${Math.min(porcentajePagado, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Modal Crear Gasto Compartido */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-4 dark:text-white">Nuevo Gasto Compartido</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Descripción</label>
                                    <input
                                        type="text"
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Ej: Cena en restaurante"
                                        required
                                        maxLength={200}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Monto Total</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={formData.montoTotal || ''}
                                            onChange={(e) => setFormData({ ...formData, montoTotal: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Fecha</label>
                                        <input
                                            type="date"
                                            value={formData.fecha}
                                            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Categoría (Opcional)</label>
                                        <select
                                            value={formData.categoriaId || ''}
                                            onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value ? Number(e.target.value) : null })}
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            <option value="">Sin categoría</option>
                                            {gastoCategorias.map((c: any) => (
                                                <option key={c.id} value={c.id}>{c.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Método de División</label>
                                        <select
                                            value={formData.metodoDivision}
                                            onChange={(e) => setFormData({ ...formData, metodoDivision: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            {METODOS_DIVISION.map(m => (
                                                <option key={m.value} value={m.value}>{m.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Participantes */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium dark:text-gray-300">Participantes</label>
                                        <button
                                            type="button"
                                            onClick={addParticipante}
                                            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 text-sm flex items-center gap-1"
                                        >
                                            <UserPlus size={14} /> Agregar
                                        </button>
                                    </div>
                                    {formData.metodoDivision === 'Equitativo' && formData.montoTotal > 0 && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                            Cada participante pagará: ${(formData.montoTotal / (formData.participantes.length + 1)).toFixed(2)} (total / {formData.participantes.length + 1} personas incluyéndote)
                                        </p>
                                    )}
                                    <div className="space-y-3">
                                        {formData.participantes.map((p, i) => (
                                            <div key={i} className="flex gap-2 items-start">
                                                <div className="flex-1 space-y-2">
                                                    <input
                                                        type="text"
                                                        value={p.nombre}
                                                        onChange={(e) => updateParticipante(i, 'nombre', e.target.value)}
                                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                                        placeholder="Nombre"
                                                        required
                                                        maxLength={100}
                                                    />
                                                    <input
                                                        type="email"
                                                        value={p.email || ''}
                                                        onChange={(e) => updateParticipante(i, 'email', e.target.value || null)}
                                                        className="w-full px-3 py-1.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs"
                                                        placeholder="Email (opcional)"
                                                    />
                                                    {formData.metodoDivision === 'Porcentaje' && (
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            max="100"
                                                            value={p.porcentaje || ''}
                                                            onChange={(e) => updateParticipante(i, 'porcentaje', e.target.value ? Number(e.target.value) : null)}
                                                            className="w-full px-3 py-1.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs"
                                                            placeholder="Porcentaje (%)"
                                                        />
                                                    )}
                                                    {formData.metodoDivision === 'MontoFijo' && (
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0.01"
                                                            value={p.montoAsignado || ''}
                                                            onChange={(e) => updateParticipante(i, 'montoAsignado', e.target.value ? Number(e.target.value) : null)}
                                                            className="w-full px-3 py-1.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs"
                                                            placeholder="Monto ($)"
                                                        />
                                                    )}
                                                </div>
                                                {formData.participantes.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeParticipante(i)}
                                                        className="text-red-500 hover:text-red-700 p-1 mt-1"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                                        Crear
                                    </button>
                                    <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-200 dark:bg-gray-600 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Detalle */}
                {isDetailOpen && selectedGasto && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold dark:text-white">{selectedGasto.descripcion}</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(selectedGasto.fecha).toLocaleDateString()} | {selectedGasto.metodoDivision}
                                        {selectedGasto.categoriaNombre && ` | ${selectedGasto.categoriaNombre}`}
                                    </p>
                                </div>
                                <button onClick={() => { setIsDetailOpen(false); setSelectedGasto(null); }} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 text-xl font-bold">
                                    &times;
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                                    <p className="font-bold dark:text-white">${selectedGasto.montoTotal.toFixed(2)}</p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Recuperado</p>
                                    <p className="font-bold text-green-600">${selectedGasto.montoRecuperado.toFixed(2)}</p>
                                </div>
                                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Pendiente</p>
                                    <p className="font-bold text-orange-600">${selectedGasto.montoPendiente.toFixed(2)}</p>
                                </div>
                            </div>

                            <h3 className="font-semibold dark:text-white mb-3">Participantes</h3>
                            <div className="space-y-3">
                                {selectedGasto.participantes.map((p) => (
                                    <div key={p.id} className={`border rounded-lg p-3 ${p.liquidado ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-600'}`}>
                                        <div className="flex justify-between items-center mb-1">
                                            <div>
                                                <span className="font-medium dark:text-white">{p.nombre}</span>
                                                {p.email && <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{p.email}</span>}
                                            </div>
                                            {p.liquidado ? (
                                                <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                                                    <CheckCircle2 size={14} /> Liquidado
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => openLiquidar(selectedGasto, p)}
                                                    className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded hover:bg-green-200 dark:hover:bg-green-900/50"
                                                >
                                                    Registrar pago
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                            <span>Debe: ${p.montoAsignado.toFixed(2)}</span>
                                            <span>Pagó: ${p.montoPagado.toFixed(2)}</span>
                                            {!p.liquidado && <span className="text-orange-600">Pendiente: ${(p.montoAsignado - p.montoPagado).toFixed(2)}</span>}
                                        </div>
                                        {p.montoPagado > 0 && (
                                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-2">
                                                <div
                                                    className="h-1.5 rounded-full bg-green-500"
                                                    style={{ width: `${Math.min((p.montoPagado / p.montoAsignado) * 100, 100)}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => { setIsDetailOpen(false); setSelectedGasto(null); }}
                                className="w-full mt-4 bg-gray-200 dark:bg-gray-600 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                )}

                {/* Modal Liquidar */}
                {isLiquidarOpen && selectedParticipante && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm">
                            <h2 className="text-xl font-bold mb-2 dark:text-white">Registrar Pago</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                {selectedParticipante.nombre} debe ${(selectedParticipante.montoAsignado - selectedParticipante.montoPagado).toFixed(2)}
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Monto recibido</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={liquidarMonto || ''}
                                        onChange={(e) => setLiquidarMonto(Number(e.target.value))}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleLiquidar} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                                        Confirmar
                                    </button>
                                    <button onClick={() => setIsLiquidarOpen(false)} className="flex-1 bg-gray-200 dark:bg-gray-600 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============ Card Component ============
interface CardProps {
    gasto: GastoCompartido;
    onDelete: (id: number) => void;
    onDetail: (g: GastoCompartido) => void;
    onLiquidar: (g: GastoCompartido, p: ParticipanteGasto) => void;
}

const GastoCompartidoCard = ({ gasto, onDelete, onDetail, onLiquidar }: CardProps) => {
    const todoLiquidado = gasto.participantes.every(p => p.liquidado);
    const recuperadoPct = gasto.montoTotal > 0 ? ((gasto.montoRecuperado / gasto.montoPendiente + gasto.montoRecuperado) * 100) : 0;
    const totalAsignado = gasto.participantes.reduce((s, p) => s + p.montoAsignado, 0);
    const pctRecuperado = totalAsignado > 0 ? (gasto.montoRecuperado / totalAsignado) * 100 : 0;

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border ${todoLiquidado ? 'border-green-300 dark:border-green-700' : 'border-gray-200 dark:border-gray-700'}`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-white truncate">{gasto.descripcion}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {new Date(gasto.fecha).toLocaleDateString()}
                        {gasto.categoriaNombre && ` | ${gasto.categoriaNombre}`}
                    </p>
                </div>
                <div className="flex gap-1 ml-2">
                    <button onClick={() => onDetail(gasto)} className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 p-1" title="Ver detalle">
                        <Eye size={16} />
                    </button>
                    <button onClick={() => onDelete(gasto.id)} className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 p-1" title="Eliminar">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Total */}
            <div className="text-2xl font-bold text-gray-800 dark:text-white mb-3">${gasto.montoTotal.toFixed(2)}</div>

            {/* Progress */}
            <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Recuperado: ${gasto.montoRecuperado.toFixed(2)}</span>
                    <span className="text-orange-600">Pendiente: ${gasto.montoPendiente.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all ${todoLiquidado ? 'bg-green-500' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min(pctRecuperado, 100)}%` }}
                    />
                </div>
            </div>

            {/* Participantes preview */}
            <div className="space-y-1.5">
                {gasto.participantes.map((p) => (
                    <div key={p.id} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-1.5">
                            {p.liquidado ? (
                                <CheckCircle2 size={14} className="text-green-500" />
                            ) : (
                                <Clock size={14} className="text-orange-500" />
                            )}
                            <span className={`${p.liquidado ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                                {p.nombre}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs ${p.liquidado ? 'text-green-600' : 'text-orange-600'}`}>
                                ${p.liquidado ? p.montoPagado.toFixed(2) : (p.montoAsignado - p.montoPagado).toFixed(2)}
                            </span>
                            {!p.liquidado && (
                                <button
                                    onClick={() => onLiquidar(gasto, p)}
                                    className="text-green-600 hover:text-green-700 dark:text-green-400"
                                    title="Registrar pago"
                                >
                                    <DollarSign size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
