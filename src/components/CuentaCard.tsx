import type { CuentaDto } from '../services/cuentasService';
import { Wallet, Building2, CreditCard, PiggyBank, TrendingUp, Edit, Trash2, BarChart3 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface CuentaCardProps {
    cuenta: CuentaDto;
    onEdit?: (cuenta: CuentaDto) => void;
    onDelete?: (id: number) => void;
}

const iconosPorTipo: Record<string, any> = {
    'Efectivo': Wallet,
    'CuentaBancaria': Building2,
    'TarjetaCredito': CreditCard,
    'Ahorros': PiggyBank,
    'Inversion': TrendingUp
};

const coloresPorTipo: Record<string, string> = {
    'Efectivo': '#10B981',
    'CuentaBancaria': '#3B82F6',
    'TarjetaCredito': '#EF4444',
    'Ahorros': '#F59E0B',
    'Inversion': '#8B5CF6'
};

export const CuentaCard: React.FC<CuentaCardProps> = ({ cuenta, onEdit, onDelete }) => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const Icono = iconosPorTipo[cuenta.tipo] || Wallet;
    const color = cuenta.color || coloresPorTipo[cuenta.tipo] || '#6B7280';

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: cuenta.moneda || 'USD'
        }).format(amount);
    };

    return (
        <div
            className={`
        ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} 
        rounded-lg shadow-md p-4 sm:p-6
        hover:shadow-lg transition-shadow
        border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
      `}
        >
            {/* Header con icono y acciones */}
            <div className="flex items-start justify-between mb-4">
                <div
                    className="p-3 rounded-full"
                    style={{ backgroundColor: `${color}20` }}
                >
                    <Icono size={24} style={{ color }} />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => navigate(`/cuentas/${cuenta.id}/dashboard`)}
                        className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                            ? 'hover:bg-gray-700 text-gray-400 hover:text-blue-400'
                            : 'hover:bg-gray-100 text-gray-600 hover:text-blue-600'
                            }`}
                        title="Ver dashboard"
                    >
                        <BarChart3 size={18} />
                    </button>
                    {onEdit && (
                        <button
                            onClick={() => onEdit(cuenta)}
                            className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                                }`}
                            title="Editar cuenta"
                        >
                            <Edit size={18} />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() => onDelete(cuenta.id)}
                            className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                                ? 'hover:bg-red-900/20 text-red-400 hover:text-red-300'
                                : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                                }`}
                            title="Eliminar cuenta"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Información de la cuenta */}
            <div className="space-y-2">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {cuenta.nombre}
                </h3>

                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {cuenta.tipo.replace(/([A-Z])/g, ' $1').trim()}
                </p>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-baseline">
                        <span className={`text-2xl font-bold ${cuenta.balanceActual >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                            }`}>
                            {formatCurrency(cuenta.balanceActual)}
                        </span>
                    </div>

                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        Inicial: {formatCurrency(cuenta.balanceInicial)}
                    </p>
                </div>
            </div>
        </div>
    );
};
