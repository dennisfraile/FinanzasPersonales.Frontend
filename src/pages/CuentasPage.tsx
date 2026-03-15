import { useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useCuentas } from '../hooks/useCuentas';
import { CuentaCard } from '../components/CuentaCard';
import type { CuentaDto, CuentaCreateDto } from '../services/cuentasService';
import { toast } from 'react-toastify';
import { useCreateCuenta, useUpdateCuenta, useDeleteCuenta } from '../hooks/useQueryHooks';

export const CuentasPage = () => {
    const { theme } = useTheme();
    const { cuentas, balanceTotal, isLoading } = useCuentas();
    const createCuentaMutation = useCreateCuenta();
    const updateCuentaMutation = useUpdateCuenta();
    const deleteCuentaMutation = useDeleteCuenta();

    const [showModal, setShowModal] = useState(false);
    const [editingCuenta, setEditingCuenta] = useState<CuentaDto | null>(null);
    const [formData, setFormData] = useState<CuentaCreateDto>({
        nombre: '',
        tipo: 'Efectivo',
        balanceInicial: 0,
        moneda: 'USD'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingCuenta) {
                await updateCuentaMutation.mutateAsync({
                    id: editingCuenta.id,
                    data: {
                        nombre: formData.nombre,
                        balanceActual: editingCuenta.balanceActual,
                        color: formData.color,
                        icono: formData.icono,
                        activa: true
                    }
                });
                toast.success('Cuenta actualizada');
            } else {
                await createCuentaMutation.mutateAsync(formData);
                toast.success('Cuenta creada exitosamente');
            }

            setShowModal(false);
            setEditingCuenta(null);
            resetForm();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al guardar la cuenta');
        }
    };

    const handleEdit = (cuenta: CuentaDto) => {
        setEditingCuenta(cuenta);
        setFormData({
            nombre: cuenta.nombre,
            tipo: cuenta.tipo,
            balanceInicial: cuenta.balanceInicial,
            moneda: cuenta.moneda,
            color: cuenta.color,
            icono: cuenta.icono
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar esta cuenta?')) return;

        try {
            await deleteCuentaMutation.mutateAsync(id);
            toast.success('Cuenta eliminada');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al eliminar la cuenta');
        }
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            tipo: 'Efectivo',
            balanceInicial: 0,
            moneda: 'USD'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Cargando cuentas...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Mis Cuentas
                        </h1>
                        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Gestiona tus cuentas financieras
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingCuenta(null);
                            resetForm();
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Nueva Cuenta
                    </button>
                </div>

                {/* Balance Total */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <span className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Balance Total:
                        </span>
                        <span className={`text-3xl font-bold ${balanceTotal >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                            }`}>
                            {formatCurrency(balanceTotal)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Grid de Cuentas */}
            {cuentas.length === 0 ? (
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-12 text-center`}>
                    <Wallet size={64} className="mx-auto text-gray-400 mb-4" />
                    <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        No tienes cuentas registradas
                    </h3>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                        Crea tu primera cuenta para empezar a gestionar tus finanzas
                    </p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Crear Primera Cuenta
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cuentas.map(cuenta => (
                        <CuentaCard
                            key={cuenta.id}
                            cuenta={cuenta}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Modal Crear/Editar */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto`}>
                        <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {editingCuenta ? 'Editar Cuenta' : 'Nueva Cuenta'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="cuenta-nombre" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Nombre
                                </label>
                                <input
                                    id="cuenta-nombre"
                                    type="text"
                                    required
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg ${theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                    placeholder="Ej: Efectivo, BBVA Nómina"
                                />
                            </div>

                            {!editingCuenta && (
                                <>
                                    <div>
                                        <label htmlFor="cuenta-tipo" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Tipo de Cuenta
                                        </label>
                                        <select
                                            id="cuenta-tipo"
                                            value={formData.tipo}
                                            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                            className={`w-full px-3 py-2 border rounded-lg ${theme === 'dark'
                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                : 'bg-white border-gray-300 text-gray-900'
                                                }`}
                                        >
                                            <option value="Efectivo">💵 Efectivo</option>
                                            <option value="CuentaBancaria">🏦 Cuenta Bancaria</option>
                                            <option value="TarjetaCredito">💳 Tarjeta de Crédito</option>
                                            <option value="Ahorros">💰 Ahorros</option>
                                            <option value="Inversion">📈 Inversión</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="cuenta-balance" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Balance Inicial
                                        </label>
                                        <input
                                            id="cuenta-balance"
                                            type="number"
                                            step="0.01"
                                            required
                                            value={formData.balanceInicial}
                                            onChange={(e) => setFormData({ ...formData, balanceInicial: parseFloat(e.target.value) })}
                                            className={`w-full px-3 py-2 border rounded-lg ${theme === 'dark'
                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                : 'bg-white border-gray-300 text-gray-900'
                                                }`}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingCuenta(null);
                                        resetForm();
                                    }}
                                    className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${theme === 'dark'
                                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {editingCuenta ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
