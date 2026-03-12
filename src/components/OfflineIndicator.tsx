import { WifiOff, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export default function OfflineIndicator() {
  const { isOnline, pendingCount, isSyncing, sync } = useOnlineStatus();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className={`fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-lg transition-all ${
      isOnline ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
    }`}>
      {!isOnline && (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Sin conexión</span>
        </>
      )}
      {isOnline && pendingCount > 0 && (
        <>
          <button
            onClick={sync}
            disabled={isSyncing}
            className="flex items-center gap-1 hover:underline disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>
              {isSyncing ? 'Sincronizando...' : `${pendingCount} pendiente${pendingCount > 1 ? 's' : ''}`}
            </span>
          </button>
        </>
      )}
    </div>
  );
}
