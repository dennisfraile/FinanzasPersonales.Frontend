import apiClient from '../services/api';

interface QueuedRequest {
  id: string;
  method: 'post' | 'put' | 'delete';
  url: string;
  data?: unknown;
  timestamp: number;
}

const QUEUE_KEY = 'offline_queue';

function getQueue(): QueuedRequest[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedRequest[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueueRequest(method: 'post' | 'put' | 'delete', url: string, data?: unknown): void {
  const queue = getQueue();
  queue.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    method,
    url,
    data,
    timestamp: Date.now(),
  });
  saveQueue(queue);
}

export function getQueueLength(): number {
  return getQueue().length;
}

export async function syncOfflineQueue(): Promise<{ synced: number; failed: number }> {
  const queue = getQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  const remaining: QueuedRequest[] = [];

  for (const req of queue) {
    try {
      await apiClient.request({
        method: req.method,
        url: req.url,
        data: req.data,
      });
      synced++;
    } catch {
      // Keep failed requests that are less than 24 hours old
      if (Date.now() - req.timestamp < 86_400_000) {
        remaining.push(req);
      }
      failed++;
    }
  }

  saveQueue(remaining);
  return { synced, failed };
}
