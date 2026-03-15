import { useState } from 'react';
import { useNotificaciones } from '../hooks/useNotificaciones';
import { Bell, X, Check } from 'lucide-react';

export const NotificationBell = () => {
    const { notificaciones, noLeidas, marcarLeida } = useNotificaciones();
    const [isOpen, setIsOpen] = useState(false);

    const notificacionesRecientes = notificaciones.slice(0, 5);

    const handleMarcarLeida = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        await marcarLeida(id);
    };

    const getIconByType = (tipo: string) => {
        switch (tipo) {
            case 'PresupuestoAlerta':
                return '⚠️';
            case 'MetaCercana':
                return '🎯';
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
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (hours < 1) return 'Hace unos minutos';
        if (hours < 24) return `Hace ${hours}h`;
        if (days === 1) return 'Ayer';
        return `Hace ${days} días`;
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Notificaciones"
            >
                <Bell size={20} className="text-gray-700 dark:text-gray-300" />
                {noLeidas > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {noLeidas > 9 ? '9+' : noLeidas}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 sm:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-20 max-h-[60vh] overflow-y-auto">
                        <div className="p-3 border-b dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Notificaciones {noLeidas > 0 && `(${noLeidas})`}
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                aria-label="Cerrar notificaciones"
                            >
                                <X size={16} className="text-gray-500" />
                            </button>
                        </div>

                        {notificacionesRecientes.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                                No tienes notificaciones
                            </div>
                        ) : (
                            <div className="divide-y dark:divide-gray-700">
                                {notificacionesRecientes.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!notif.leida ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <span className="text-2xl">{getIconByType(notif.tipo)}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {notif.titulo}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                    {notif.mensaje}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                    {formatFecha(notif.fechaCreacion)}
                                                </p>
                                            </div>
                                            {!notif.leida && (
                                                <button
                                                    onClick={(e) => handleMarcarLeida(e, notif.id)}
                                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                    title="Marcar como leída"
                                                >
                                                    <Check size={16} className="text-green-600" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {notificaciones.length > 5 && (
                            <div className="p-3 border-t dark:border-gray-700 text-center">
                                <a
                                    href="/notificaciones"
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Ver todas →
                                </a>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
