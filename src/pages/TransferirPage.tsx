import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CuentaSelector } from '../components/CuentaSelector';
import transferenciasService from '../services/transferenciasService';
import { toast } from 'react-toastify';
import { ArrowLeftRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const TransferirPage = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        cuentaOrigenId: null as number | null,
        cuentaDestinoId: null as number | null,
        monto: 0,
        descripcion: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validaciones
        if (!formData.cuentaOrigenId || !formData.cuentaDestinoId) {
            toast.error('Debes seleccionar ambas cuentas');
            return;
        }

        if (formData.cuentaOrigenId === formData.cuentaDestinoId) {
            toast.error('Las cuentas de origen y destino deben ser diferentes');
            return;
        }

        if (formData.monto <= 0) {
            toast.error('El monto debe ser mayor a 0');
            return;
        }

        try {
            await transferenciasService.createTransferencia({
                cuentaOrigenId: formData.cuentaOrigenId,
                cuentaDestinoId: formData.cuentaDestinoId,
                monto: formData.monto,
                descripcion: formData.descripcion || 'Transferencia entre cuentas'
            });

            toast.success('Transferencia realizada exitosamente');
            navigate('/cuentas');
        } catch (error) {
            console.error('Error en transferencia:', error);
            toast.error('Error al realizar la transferencia');
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
                <div className="flex items-center gap-3 mb-6">
                    <ArrowLeftRight className="text-blue-600" size={32} />
                    <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        💸 Transferir entre Cuentas
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <CuentaSelector
                        value={formData.cuentaOrigenId}
                        onChange={(id) => setFormData({ ...formData, cuentaOrigenId: id })}
                        label="Cuenta Origen"
                        required={true}
                    />

                    <CuentaSelector
                        value={formData.cuentaDestinoId}
                        onChange={(id) => setFormData({ ...formData, cuentaDestinoId: id })}
                        label="Cuenta Destino"
                        required={true}
                    />

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Monto a Transferir
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.monto}
                            onChange={(e) => setFormData({ ...formData, monto: parseFloat(e.target.value) || 0 })}
                            className={`w-full px-3 py-2 border rounded-lg transition-colors ${theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Descripción (Opcional)
                        </label>
                        <textarea
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg transition-colors ${theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            rows={3}
                            placeholder="Ej: Pago de renta, ahorro mensual, etc."
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Realizar Transferencia
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/cuentas')}
                            className={`flex-1 py-3 rounded-lg transition-colors font-medium ${theme === 'dark'
                                ? 'bg-gray-600 text-white hover:bg-gray-500'
                                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                                }`}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>

                <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                    <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
                        💡 <strong>Nota:</strong> La transferencia actualizará automáticamente los balances de ambas cuentas.
                    </p>
                </div>
            </div>
        </div>
    );
};
