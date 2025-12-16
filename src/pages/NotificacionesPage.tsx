import { useNotificaciones } from '../hooks/useNotificaciones';
import { Bell, Check, Trash2 } from 'lucide-react';

export const NotificacionesPage = () => {
    const { notificaciones, marcarLeida, isLoading } = useNotificaciones();

    const getIconByType = (tipo: string) => {
        switch (tipo) {
            case 'PresupuestoAlerta':
                return '⚠️';
            case 'MetaCercana':
            case 'MetaProxima':
                return '🎯';
            case 'MetaCumplida':
                return '🎉';
            case 'GastoInusual':
                return '💸';
            case 'ResumenMensual':
                return '📊';
            default:
                return '📢';
        }
    };

    const formatFecha = (fecha: string) => {
        const date = new Date(fecha);
        return new Intl.DateTimeFormat('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
                <Bell size={32} className="text-blue-600 dark:text-blue-400" />
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    Notificaciones
                </h1>
            </div>

            {notificaciones.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
                    <Bell size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        No tienes notificaciones
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                        Aquí aparecerán alertas de presupuestos, metas y más
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notificaciones.map((notif) => (
                        <div
                            key={notif.id}
                            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 transition-all ${notif.leida
                                    ? 'border-gray-300 dark:border-gray-600'
                                    : 'border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-3xl">{getIconByType(notif.tipo)}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {notif.titulo}
                                        </h3>
                                        {!notif.leida && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 shrink-0">
                                                Nueva
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                                        {notif.mensaje}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                        {formatFecha(notif.fechaCreacion)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {!notif.leida && (
                                        <button
                                            onClick={() => marcarLeida(notif.id)}
                                            className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 transition-colors"
                                            title="Marcar como leída"
                                        >
                                            <Check size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
