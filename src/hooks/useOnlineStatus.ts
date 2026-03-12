import { useState, useEffect, useCallback } from 'react';
import { syncOfflineQueue, getQueueLength } from '../utils/offlineQueue';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(getQueueLength());
  const [isSyncing, setIsSyncing] = useState(false);

  const sync = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);
    try {
      await syncOfflineQueue();
      setPendingCount(getQueueLength());
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      sync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [sync]);

  // Update pending count periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setPendingCount(getQueueLength());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return { isOnline, pendingCount, isSyncing, sync };
}
