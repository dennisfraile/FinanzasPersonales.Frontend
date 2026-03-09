import { useEffect, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7102';

export function useSignalR() {
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const startConnection = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (connectionRef.current) {
      await connectionRef.current.stop();
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/notificaciones`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    try {
      await connection.start();
    } catch (err) {
      console.error('SignalR connection error:', err);
    }
  }, []);

  const onNotificacion = useCallback((callback: (notificacion: any) => void) => {
    connectionRef.current?.on('NuevaNotificacion', callback);
    return () => {
      connectionRef.current?.off('NuevaNotificacion', callback);
    };
  }, []);

  useEffect(() => {
    return () => {
      connectionRef.current?.stop();
    };
  }, []);

  return { startConnection, onNotificacion, connection: connectionRef };
}
