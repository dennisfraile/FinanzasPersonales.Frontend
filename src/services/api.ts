import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7102';

const apiClient = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: 30000,
    withCredentials: true, // enviar/recibir cookies de auth
    headers: { 'Content-Type': 'application/json' },
});

// Lee el valor de una cookie (la csrf NO es HttpOnly).
function readCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

// CSRF double-submit: enviar el header en métodos mutantes.
apiClient.interceptors.request.use((config) => {
    const method = (config.method || 'get').toUpperCase();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        const csrf = readCookie('csrf_token');
        if (csrf) config.headers['X-CSRF-Token'] = csrf;
    }
    return config;
});

// Refresh-on-401: ante un 401, intentar /Auth/refresh UNA vez y reintentar.
let refreshing: Promise<void> | null = null;
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        const status = error.response?.status;
        const isRefreshCall = original?.url?.includes('/Auth/refresh');

        if (status === 401 && !original?._retried && !isRefreshCall) {
            original._retried = true;
            try {
                if (!refreshing) {
                    refreshing = apiClient.post('/Auth/refresh').then(() => undefined).finally(() => { refreshing = null; });
                }
                await refreshing;
                return apiClient(original);
            } catch {
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }
        if (status === 401) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
