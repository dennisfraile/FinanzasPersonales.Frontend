import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7102';

const apiClient = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar token JWT automáticamente
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para manejar errores
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
