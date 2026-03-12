import { useState } from 'react';
import { CheckCircle2, Circle, ArrowRight, X, Wallet, Tag, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Step {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    route: string;
    completed: boolean;
}

interface OnboardingWizardProps {
    hasCuentas: boolean;
    hasCategorias: boolean;
    hasGastos: boolean;
    onDismiss: () => void;
}

export default function OnboardingWizard({ hasCuentas, hasCategorias, hasGastos, onDismiss }: OnboardingWizardProps) {
    const navigate = useNavigate();
    const [dismissed, setDismissed] = useState(false);

    const steps: Step[] = [
        {
            id: 'cuentas',
            title: 'Crea tu primera cuenta',
            description: 'Agrega donde tienes tu dinero: banco, efectivo, ahorro, etc.',
            icon: Wallet,
            route: '/cuentas',
            completed: hasCuentas,
        },
        {
            id: 'categorias',
            title: 'Configura tus categorias',
            description: 'Crea categorias para organizar tus gastos: Comida, Transporte, etc.',
            icon: Tag,
            route: '/categorias',
            completed: hasCategorias,
        },
        {
            id: 'gastos',
            title: 'Registra tu primer gasto',
            description: 'Anota lo que hayas gastado hoy para empezar a llevar el control.',
            icon: Receipt,
            route: '/gastos',
            completed: hasGastos,
        },
    ];

    const completedCount = steps.filter(s => s.completed).length;
    const allCompleted = completedCount === steps.length;

    if (dismissed || allCompleted) return null;

    const handleDismiss = () => {
        setDismissed(true);
        localStorage.setItem('onboarding_dismissed', 'true');
        onDismiss();
    };

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Bienvenido! Configura tu cuenta en 3 pasos</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{completedCount} de {steps.length} completados</p>
                </div>
                <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Cerrar">
                    <X size={20} />
                </button>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-5">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(completedCount / steps.length) * 100}%` }}
                />
            </div>

            <div className="space-y-3">
                {steps.map((step) => {
                    const Icon = step.icon;
                    return (
                        <div
                            key={step.id}
                            className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                                step.completed
                                    ? 'bg-green-50 dark:bg-green-900/10'
                                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer'
                            }`}
                            onClick={() => !step.completed && navigate(step.route)}
                        >
                            {step.completed ? (
                                <CheckCircle2 className="text-green-500 shrink-0" size={24} />
                            ) : (
                                <Circle className="text-gray-300 dark:text-gray-600 shrink-0" size={24} />
                            )}
                            <Icon className={`shrink-0 ${step.completed ? 'text-green-500' : 'text-blue-500'}`} size={20} />
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${step.completed ? 'text-green-700 dark:text-green-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                                    {step.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
                            </div>
                            {!step.completed && (
                                <ArrowRight className="text-blue-500 shrink-0" size={18} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
