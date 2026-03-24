import { useState } from 'react';
import { Settings, X, Eye, EyeOff, GripVertical } from 'lucide-react';

export interface WidgetConfig {
    id: string;
    label: string;
    visible: boolean;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
    { id: 'summary', label: 'Resumen del mes', visible: true },
    { id: 'metrics', label: 'Tarjetas de métricas', visible: true },
    { id: 'trend', label: 'Tendencia 6 meses', visible: true },
    { id: 'categories', label: 'Top categorías', visible: true },
    { id: 'programados', label: 'Próximos vencimientos', visible: true },
    { id: 'alertas', label: 'Presupuestos en alerta', visible: true },
    { id: 'metas', label: 'Metas más cercanas', visible: true },
    { id: 'deudas', label: 'Deudas activas', visible: true },
];

const STORAGE_KEY = 'dashboard_widgets_config';

export function loadWidgetConfig(): WidgetConfig[] {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved) as WidgetConfig[];
            // Merge with defaults in case new widgets were added
            return DEFAULT_WIDGETS.map(dw => {
                const saved = parsed.find(p => p.id === dw.id);
                return saved ? { ...dw, visible: saved.visible } : dw;
            });
        }
    } catch { /* ignore */ }
    return DEFAULT_WIDGETS;
}

function saveWidgetConfig(widgets: WidgetConfig[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
}

interface DashboardCustomizerProps {
    widgets: WidgetConfig[];
    onChange: (widgets: WidgetConfig[]) => void;
}

export const DashboardCustomizer: React.FC<DashboardCustomizerProps> = ({ widgets, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleWidget = (id: string) => {
        const updated = widgets.map(w =>
            w.id === id ? { ...w, visible: !w.visible } : w
        );
        saveWidgetConfig(updated);
        onChange(updated);
    };

    const showAll = () => {
        const updated = widgets.map(w => ({ ...w, visible: true }));
        saveWidgetConfig(updated);
        onChange(updated);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
                title="Personalizar dashboard"
            >
                <Settings size={18} />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                    <div
                        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personalizar dashboard</h3>
                            <button type="button" onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="px-5 py-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Elige qué secciones mostrar en tu dashboard</p>

                            <div className="space-y-1">
                                {widgets.map(widget => (
                                    <button
                                        key={widget.id}
                                        type="button"
                                        onClick={() => toggleWidget(widget.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                                            widget.visible
                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }`}
                                    >
                                        <GripVertical size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />
                                        {widget.visible ? <Eye size={16} className="shrink-0" /> : <EyeOff size={16} className="shrink-0" />}
                                        <span className="text-sm font-medium flex-1">{widget.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={showAll}
                                className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline py-1"
                            >
                                Mostrar todos
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
