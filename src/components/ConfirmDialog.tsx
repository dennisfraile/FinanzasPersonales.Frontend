import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    /** Estilo destructivo (botón rojo) para acciones de borrado. */
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * Modal de confirmación accesible y tematizado que reemplaza window.confirm
 * (bloqueante y sin respeto al tema oscuro). Foco inicial en el botón principal,
 * ESC cancela, click en el backdrop cancela, role="dialog" + aria-modal.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    danger = true,
    onConfirm,
    onCancel,
}) => {
    const confirmBtnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        confirmBtnRef.current?.focus();
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [onCancel]);

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center px-4"
            onClick={onCancel}
        >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        {danger && (
                            <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h2
                                id="confirm-dialog-title"
                                className="text-lg font-semibold text-gray-900 dark:text-white"
                            >
                                {title || 'Confirmar acción'}
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{message}</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        ref={confirmBtnRef}
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors ${
                            danger
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
