import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useQueryNotificaciones, useNotificacionesNoLeidas, useMarcarNotificacionLeida } from './useQueryHooks';
import { useSignalRContext } from '../context/SignalRContext';

export const useNotificaciones = () => {
    const queryClient = useQueryClient();
    const { isConnected, onNotificacion } = useSignalRContext();
    const { data: notificaciones = [], isLoading: isLoadingNotif, refetch: refetchNotif } = useQueryNotificaciones(false, isConnected);
    const { data: noLeidas = 0, refetch: refetchNoLeidas } = useNotificacionesNoLeidas(isConnected);
    const marcarLeidaMutation = useMarcarNotificacionLeida();

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

    // Una notificación en tiempo real invalida las queries para refrescar el badge/lista.
    const handleNuevaNotificacion = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    }, [queryClient]);

    useEffect(() => {
        // La conexión la gestiona SignalRProvider (única, montada una vez).
        // Aquí solo nos suscribimos al evento.
        const cleanup = onNotificacion(handleNuevaNotificacion);
        return cleanup;
    }, [onNotificacion, handleNuevaNotificacion]);

    return { notificaciones, noLeidas, isLoading, marcarLeida, refrescar };
};
