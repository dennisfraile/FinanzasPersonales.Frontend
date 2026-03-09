import { useQueryCuentas } from '../hooks/useQueryHooks';
import { useTheme } from '../context/ThemeContext';

interface CuentaSelectorProps {
    value?: number | null;
    onChange: (cuentaId: number | null) => void;
    label?: string;
    required?: boolean;
}

export const CuentaSelector: React.FC<CuentaSelectorProps> = ({
    value,
    onChange,
    label = 'Cuenta',
    required = false
}) => {
    const { theme } = useTheme();
    const { data: cuentas = [], isLoading } = useQueryCuentas();

    const formatCurrency = (amount: number, moneda: string) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: moneda || 'MXN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {label}
                {!required && <span className="text-gray-500 ml-1">(Opcional)</span>}
            </label>

            <select
                value={value || ''}
                onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
                required={required}
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-lg transition-colors ${theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <option value="">Sin asignar</option>
                {cuentas.map(cuenta => (
                    <option key={cuenta.id} value={cuenta.id}>
                        {cuenta.nombre} - {formatCurrency(cuenta.balanceActual, cuenta.moneda)}
                    </option>
                ))}
            </select>

            {cuentas.length === 0 && !isLoading && (
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    No tienes cuentas creadas.
                    <a href="/cuentas" className="text-blue-600 hover:underline ml-1">
                        Crear una cuenta
                    </a>
                </p>
            )}
        </div>
    );
};
