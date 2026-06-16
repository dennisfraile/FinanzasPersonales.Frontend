import { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from './AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7102';

type NotificacionCallback = (notificacion: unknown) => void;

interface SignalRContextType {
    /** true cuando el WebSocket está vivo; permite desactivar el polling de fallback. */
    isConnected: boolean;
    /** Suscribe un handler a 'NuevaNotificacion'. Devuelve la función para desuscribir. */
    onNotificacion: (callback: NotificacionCallback) => () => void;
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

/**
 * Provider único de SignalR montado una sola vez (en App, dentro de AuthProvider).
 * Sustituye al antiguo hook useSignalR, que se instanciaba en Layout y en
 * useNotificaciones por separado y abría DOS WebSockets (uno huérfano).
 *
 * Los handlers se guardan en un Set y un único listener hace fan-out, de modo que
 * los consumidores pueden suscribirse antes incluso de que exista la conexión
 * (los effects hijos corren antes que el del provider padre).
 */
export const SignalRProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const userId = user?.id;
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const subscribersRef = useRef<Set<NotificacionCallback>>(new Set());
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Solo conectamos cuando hay sesión iniciada.
        if (!userId) return;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_URL}/hubs/notificaciones`, {
                withCredentials: true,
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        // Un único listener que reparte a todos los suscriptores.
        connection.on('NuevaNotificacion', (notificacion: unknown) => {
            subscribersRef.current.forEach((cb) => cb(notificacion));
        });

        connection.onreconnecting(() => setIsConnected(false));
        connection.onreconnected(() => setIsConnected(true));
        connection.onclose(() => setIsConnected(false));

        connectionRef.current = connection;

        let cancelled = false;
        connection
            .start()
            .then(() => {
                if (!cancelled) setIsConnected(true);
            })
            .catch((err) => {
                console.error('SignalR connection failed, relying on polling fallback:', err);
                if (!cancelled) setIsConnected(false);
            });

        return () => {
            cancelled = true;
            setIsConnected(false);
            connection.stop().catch(() => {
                /* la conexión puede no haber arrancado todavía; ignorar */
            });
            connectionRef.current = null;
        };
        // Reconectamos solo cuando cambia el usuario real (login/logout), no en
        // cada refresh de perfil que produzca un nuevo objeto user.
    }, [userId]);

    const onNotificacion = useCallback((callback: NotificacionCallback) => {
        subscribersRef.current.add(callback);
        return () => {
            subscribersRef.current.delete(callback);
        };
    }, []);

    return (
        <SignalRContext.Provider value={{ isConnected, onNotificacion }}>
            {children}
        </SignalRContext.Provider>
    );
};

export const useSignalRContext = () => {
    const context = useContext(SignalRContext);
    if (!context) {
        throw new Error('useSignalRContext must be used within SignalRProvider');
    }
    return context;
};
