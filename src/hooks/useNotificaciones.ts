import { useState, useEffect } from 'react';
import { notificacionesService, type NotificacionDto } from '../services/notificacionesService';

export const useNotificaciones = () => {
    const [notificaciones, setNotificaciones] = useState<NotificacionDto[]>([]);
    const [noLeidas, setNoLeidas] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const cargar = async () => {
        try {
            const [todasNotif, countNoLeidas] = await Promise.all([
                notificacionesService.getNotificaciones(false),
                notificacionesService.getNoLeidas()
            ]);
            setNotificaciones(todasNotif);
            setNoLeidas(countNoLeidas);
        } catch (error) {
            console.error('Error cargando notificaciones:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const marcarLeida = async (id: number) => {
        try {
            await notificacionesService.marcarLeida(id);
            setNotificaciones(prev =>
                prev.map(n => n.id === id ? { ...n, leida: true } : n)
            );
            setNoLeidas(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marcando como leída:', error);
        }
    };

    useEffect(() => {
        cargar();

        // Polling cada 30 segundos
        const interval = setInterval(cargar, 30000);
        return () => clearInterval(interval);
    }, []);

    return { notificaciones, noLeidas, isLoading, marcarLeida, refrescar: cargar };
};
