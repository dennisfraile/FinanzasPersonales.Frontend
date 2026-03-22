import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen, ChevronDown, ChevronRight, FileText, Target,
    Repeat, CalendarClock, CreditCard, BarChart3, Zap,
    CheckCircle2, ArrowRight, Lightbulb, HelpCircle
} from 'lucide-react';
import { sectionHelp, financialGlossary } from '../utils/helpContent';

interface WorkflowStep {
    title: string;
    description: string;
    link: string;
    linkLabel: string;
}

interface Workflow {
    id: string;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    color: string;
    steps: WorkflowStep[];
}

const workflows: Workflow[] = [
    {
        id: 'primeros-pasos',
        title: 'Primeros pasos',
        subtitle: 'Si es tu primera vez, empieza aqui',
        icon: Lightbulb,
        color: 'blue',
        steps: [
            {
                title: '1. Crea tus cuentas',
                description: 'Registra donde tienes dinero: tu cuenta de banco, efectivo, tarjeta de credito, etc. Esto es la base para todo lo demas.',
                link: '/cuentas',
                linkLabel: 'Ir a Cuentas',
            },
            {
                title: '2. Crea tus categorias',
                description: 'Define como quieres organizar tus gastos e ingresos. Ejemplos: Alimentacion, Transporte, Salario, Freelance.',
                link: '/categorias',
                linkLabel: 'Ir a Categorias',
            },
            {
                title: '3. Registra tus ingresos',
                description: 'Anota tu salario y cualquier otro ingreso. Selecciona la cuenta donde lo recibes para que el balance se actualice.',
                link: '/ingresos',
                linkLabel: 'Ir a Ingresos',
            },
            {
                title: '4. Registra tus gastos',
                description: 'Cada vez que gastes dinero, registralo con la categoria y cuenta correspondiente. Asi tendras visibilidad real de tu dinero.',
                link: '/gastos',
                linkLabel: 'Ir a Gastos',
            },
            {
                title: '5. Revisa tu dashboard',
                description: 'Ahora ve al panel principal para ver tu resumen: balance del mes, categorias principales y tendencias.',
                link: '/dashboard',
                linkLabel: 'Ir al Dashboard',
            },
        ],
    },
    {
        id: 'controlar-gastos',
        title: 'Controlar mis gastos con presupuestos',
        subtitle: 'Ponle limites a lo que gastas por categoria',
        icon: FileText,
        color: 'green',
        steps: [
            {
                title: '1. Identifica en que gastas mas',
                description: 'Ve a Gastos o al Dashboard y fijate en que categorias se va mas dinero (comida, transporte, entretenimiento, etc.).',
                link: '/gastos',
                linkLabel: 'Ver mis gastos',
            },
            {
                title: '2. Crea un presupuesto por categoria',
                description: 'Ve a Presupuestos y crea un limite. Ejemplo: "Alimentacion - $200 semanal". Puedes elegir el periodo: semanal, quincenal, mensual, etc.',
                link: '/presupuestos',
                linkLabel: 'Crear presupuesto',
            },
            {
                title: '3. Revisa el semaforo',
                description: 'El sistema te muestra Verde (vas bien), Naranja (cuidado, pasaste el 80%) o Rojo (excediste el limite). Recibiras notificaciones automaticas.',
                link: '/presupuestos',
                linkLabel: 'Ver presupuestos',
            },
            {
                title: '4. Transfiere saldo si necesitas',
                description: 'Si te quedaste corto en una categoria pero te sobra en otra, puedes transferir saldo entre gastos desde la tabla de gastos (boton "Transferir").',
                link: '/gastos',
                linkLabel: 'Transferir saldo',
            },
        ],
    },
    {
        id: 'pagos-recurrentes',
        title: 'Automatizar pagos fijos',
        subtitle: 'Para gastos que se repiten: renta, internet, suscripciones',
        icon: Repeat,
        color: 'purple',
        steps: [
            {
                title: '1. Crea un gasto recurrente',
                description: 'Ve a Gastos Recurrentes y agrega cada pago fijo: renta, internet, Netflix, etc. Define la frecuencia (semanal, quincenal, mensual) y el dia de pago.',
                link: '/gastos-recurrentes',
                linkLabel: 'Crear recurrente',
            },
            {
                title: '2. El sistema genera los gastos automaticamente',
                description: 'Cada periodo, el sistema crea el gasto por ti y te notifica. No tienes que recordar registrarlo manualmente.',
                link: '/gastos-recurrentes',
                linkLabel: 'Ver recurrentes',
            },
            {
                title: '3. Tambien funciona para ingresos',
                description: 'Si recibes salario cada quincena o renta cada mes, configuralo como ingreso recurrente y se registrara solo.',
                link: '/ingresos-recurrentes',
                linkLabel: 'Ingresos recurrentes',
            },
        ],
    },
    {
        id: 'recibos-programados',
        title: 'Pagar recibos con fecha limite',
        subtitle: 'Para recibos de luz, agua, gas y pagos con fecha especifica',
        icon: CalendarClock,
        color: 'orange',
        steps: [
            {
                title: '1. Registra el gasto programado',
                description: 'Ve a Programados y crea el pago. Pon la fecha limite, el monto (puede ser variable si el recibo cambia cada mes), la categoria y la cuenta de donde se pagara.',
                link: '/gastos-programados',
                linkLabel: 'Crear programado',
            },
            {
                title: '2. El sistema te avisa antes del vencimiento',
                description: 'Recibiras una notificacion dias antes de que venza. Si es monto fijo con cuenta asignada, se cobra automaticamente en la fecha.',
                link: '/notificaciones',
                linkLabel: 'Ver notificaciones',
            },
            {
                title: '3. Paga manualmente si el monto varia',
                description: 'Para recibos de monto variable (luz, agua), cuando llegue el recibo real, presiona "Pagar" e ingresa el monto exacto.',
                link: '/gastos-programados',
                linkLabel: 'Ver programados',
            },
        ],
    },
    {
        id: 'ahorrar',
        title: 'Ahorrar para un objetivo',
        subtitle: 'Vacaciones, fondo de emergencia, compra importante',
        icon: Target,
        color: 'teal',
        steps: [
            {
                title: '1. Crea una meta de ahorro',
                description: 'Define que quieres lograr, cuanto necesitas y opcionalmente en que cuenta guardaras el dinero.',
                link: '/metas',
                linkLabel: 'Crear meta',
            },
            {
                title: '2. Abona regularmente',
                description: 'Cada vez que puedas, abona a tu meta. Puede ser poco, lo importante es la constancia. La barra de progreso te muestra que tan cerca estas.',
                link: '/metas',
                linkLabel: 'Ver metas',
            },
            {
                title: '3. Usa presupuestos para liberar dinero',
                description: 'Si no te alcanza para ahorrar, crea presupuestos para reducir gastos en categorias no esenciales y redirige ese dinero a tu meta.',
                link: '/presupuestos',
                linkLabel: 'Ver presupuestos',
            },
        ],
    },
    {
        id: 'deudas',
        title: 'Controlar mis deudas',
        subtitle: 'Tarjetas, prestamos, hipoteca',
        icon: CreditCard,
        color: 'red',
        steps: [
            {
                title: '1. Registra todas tus deudas',
                description: 'Ve a Deudas y agrega cada una: tarjeta de credito, prestamo personal, hipoteca, etc. Incluye el monto total, tasa de interes y dia de pago.',
                link: '/deudas',
                linkLabel: 'Registrar deuda',
            },
            {
                title: '2. Prioriza por tasa de interes',
                description: 'Paga primero las deudas con mayor tasa de interes (usualmente tarjetas de credito). Esto te ahorra dinero a largo plazo.',
                link: '/deudas',
                linkLabel: 'Ver deudas',
            },
            {
                title: '3. Registra cada pago',
                description: 'Cada vez que hagas un pago, registralo en la deuda. Veras como baja tu saldo y te motivaras a seguir.',
                link: '/deudas',
                linkLabel: 'Ver deudas',
            },
        ],
    },
    {
        id: 'analizar',
        title: 'Analizar mis finanzas',
        subtitle: 'Reportes, comparaciones y calendario',
        icon: BarChart3,
        color: 'indigo',
        steps: [
            {
                title: '1. Revisa los reportes',
                description: 'Ve a Reportes para ver graficos detallados: en que gastas mas, tendencias mensuales, distribucion por categoria.',
                link: '/reportes',
                linkLabel: 'Ver reportes',
            },
            {
                title: '2. Compara meses',
                description: 'Usa la seccion Comparacion para ver como cambiaron tus gastos e ingresos entre un mes y otro.',
                link: '/comparacion',
                linkLabel: 'Comparar meses',
            },
            {
                title: '3. Vista de calendario',
                description: 'El calendario te muestra tus gastos e ingresos en un formato visual por dia. Util para ver patrones.',
                link: '/calendario',
                linkLabel: 'Ver calendario',
            },
        ],
    },
    {
        id: 'herramientas',
        title: 'Herramientas avanzadas',
        subtitle: 'Plantillas, auto-categorizacion, importar datos',
        icon: Zap,
        color: 'yellow',
        steps: [
            {
                title: '1. Crea plantillas de gastos frecuentes',
                description: 'Si compras cafe todos los dias o pagas estacionamiento seguido, crea una plantilla para registrar el gasto con un solo clic.',
                link: '/plantillas',
                linkLabel: 'Crear plantilla',
            },
            {
                title: '2. Configura auto-categorizacion',
                description: 'Crea reglas para que el sistema asigne categorias automaticamente. Ejemplo: si la descripcion contiene "Uber", asignar a "Transporte".',
                link: '/reglas-categoria',
                linkLabel: 'Crear regla',
            },
            {
                title: '3. Importa datos existentes',
                description: 'Si ya tienes tus gastos en Excel o CSV, puedes importarlos directamente sin tener que registrarlos uno por uno.',
                link: '/importar-csv',
                linkLabel: 'Importar CSV',
            },
        ],
    },
];

const colorMap: Record<string, { bg: string; text: string; border: string; light: string }> = {
    blue: { bg: 'bg-blue-600', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', light: 'bg-blue-50 dark:bg-blue-900/20' },
    green: { bg: 'bg-green-600', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800', light: 'bg-green-50 dark:bg-green-900/20' },
    purple: { bg: 'bg-purple-600', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800', light: 'bg-purple-50 dark:bg-purple-900/20' },
    orange: { bg: 'bg-orange-600', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', light: 'bg-orange-50 dark:bg-orange-900/20' },
    teal: { bg: 'bg-teal-600', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800', light: 'bg-teal-50 dark:bg-teal-900/20' },
    red: { bg: 'bg-red-600', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800', light: 'bg-red-50 dark:bg-red-900/20' },
    indigo: { bg: 'bg-indigo-600', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800', light: 'bg-indigo-50 dark:bg-indigo-900/20' },
    yellow: { bg: 'bg-yellow-600', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800', light: 'bg-yellow-50 dark:bg-yellow-900/20' },
};

export const AyudaPage = () => {
    const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>('primeros-pasos');
    const [activeTab, setActiveTab] = useState<'flujos' | 'secciones' | 'glosario'>('flujos');

    const toggleWorkflow = (id: string) => {
        setExpandedWorkflow(expandedWorkflow === id ? null : id);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpen size={28} className="text-blue-600 dark:text-blue-400" />
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                            Centro de Ayuda
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Guias paso a paso para sacar el maximo provecho de tus finanzas personales
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-gray-200 dark:bg-gray-800 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('flujos')}
                        className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'flujos'
                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                    >
                        <span className="hidden sm:inline">Flujos guiados</span>
                        <span className="sm:hidden">Flujos</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('secciones')}
                        className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'secciones'
                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                    >
                        Secciones
                    </button>
                    <button
                        onClick={() => setActiveTab('glosario')}
                        className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'glosario'
                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                    >
                        Glosario
                    </button>
                </div>

                {/* Tab: Flujos guiados */}
                {activeTab === 'flujos' && (
                    <div className="space-y-3">
                        {workflows.map((workflow) => {
                            const Icon = workflow.icon;
                            const colors = colorMap[workflow.color];
                            const isExpanded = expandedWorkflow === workflow.id;

                            return (
                                <div
                                    key={workflow.id}
                                    className={`bg-white dark:bg-gray-800 rounded-xl border ${
                                        isExpanded ? colors.border : 'border-gray-200 dark:border-gray-700'
                                    } overflow-hidden transition-all`}
                                >
                                    {/* Workflow header */}
                                    <button
                                        onClick={() => toggleWorkflow(workflow.id)}
                                        className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                                    >
                                        <div className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${colors.bg} text-white flex items-center justify-center`}>
                                            <Icon size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">
                                                {workflow.title}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                                                {workflow.subtitle}
                                            </p>
                                        </div>
                                        <div className="shrink-0">
                                            {isExpanded ? (
                                                <ChevronDown size={20} className="text-gray-400" />
                                            ) : (
                                                <ChevronRight size={20} className="text-gray-400" />
                                            )}
                                        </div>
                                    </button>

                                    {/* Workflow steps */}
                                    {isExpanded && (
                                        <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-3">
                                            {workflow.steps.map((step, index) => (
                                                <div
                                                    key={index}
                                                    className={`flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg ${colors.light}`}
                                                >
                                                    <div className={`shrink-0 w-6 h-6 rounded-full ${colors.bg} text-white flex items-center justify-center text-xs font-bold mt-0.5`}>
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-gray-800 dark:text-white text-sm sm:text-base mb-1">
                                                            {step.title}
                                                        </h4>
                                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                            {step.description}
                                                        </p>
                                                        <Link
                                                            to={step.link}
                                                            className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium ${colors.text} hover:underline`}
                                                        >
                                                            {step.linkLabel}
                                                            <ArrowRight size={14} />
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Tab: Secciones */}
                {activeTab === 'secciones' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(sectionHelp).map(([key, section]) => (
                            <div
                                key={key}
                                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5"
                            >
                                <h3 className="font-semibold text-gray-800 dark:text-white mb-2 text-sm sm:text-base">
                                    {section.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    {section.description}
                                </p>
                                <ul className="space-y-1.5">
                                    {section.tips.map((tip, i) => (
                                        <li key={i} className="flex gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                            <CheckCircle2 size={14} className="shrink-0 text-green-500 mt-0.5" />
                                            <span>{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tab: Glosario */}
                {activeTab === 'glosario' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                        {financialGlossary.map((item, index) => (
                            <div key={index} className="p-4 sm:p-5">
                                <div className="flex items-start gap-3">
                                    <HelpCircle size={16} className="shrink-0 text-blue-500 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">
                                            {item.term}
                                        </h4>
                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {item.definition}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
