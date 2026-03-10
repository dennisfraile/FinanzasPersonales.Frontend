import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useQueryNotificaciones, useNotificacionesNoLeidas, useMarcarNotificacionLeida } from './useQueryHooks';
import { useSignalR } from './useSignalR';

export const useNotificaciones = () => {
    const queryClient = useQueryClient();
    const { data: notificaciones = [], isLoading: isLoadingNotif, refetch: refetchNotif } = useQueryNotificaciones(false);
    const { data: noLeidas = 0, refetch: refetchNoLeidas } = useNotificacionesNoLeidas();
    const marcarLeidaMutation = useMarcarNotificacionLeida();
    const { startConnection, onNotificacion } = useSignalR();

    const isLoading = isLoadingNotif;

    const marcarLeida = async (id: number) => {
        try {
            await marcarLeidaMutation.mutateAsync(id);
        } catch (error) {
            console.error('Error marcando como leida:', error);
        }
    };

    const refrescar = async () => {
        await Promise.all([refetchNotif(), refetchNoLeidas()]);
    };

    // Handle incoming SignalR notification by invalidating queries
    const handleNuevaNotificacion = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    }, [queryClient]);

    useEffect(() => {
        // Start SignalR connection
        startConnection().catch((err) => {
            console.error('SignalR connection failed, relying on polling fallback:', err);
        });

        // Listen for real-time notifications
        const cleanup = onNotificacion(handleNuevaNotificacion);

        return () => {
            if (cleanup) cleanup();
        };
    }, [startConnection, onNotificacion, handleNuevaNotificacion]);

    return { notificaciones, noLeidas, isLoading, marcarLeida, refrescar };
};
