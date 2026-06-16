import apiClient from './api';

export interface AuthResponse {
    isSuccess: boolean;
    message: string;
}

export const authService = {
    async loginWithGoogle(idToken: string): Promise<AuthResponse> {
        // El backend setea las cookies HttpOnly; no se recibe token en el body.
        const response = await apiClient.post('/Auth/google', { idToken });
        return response.data;
    },

    async logout() {
        try {
            await apiClient.post('/Auth/logout');
        } catch {
            /* ignorar: limpiamos cliente igualmente */
        }
        localStorage.removeItem('offline_queue');
        localStorage.removeItem('onboarding_dismissed');

        if ('caches' in window) {
            try {
                const keys = await caches.keys();
                await Promise.all(keys.filter((k) => k.startsWith('api-')).map((k) => caches.delete(k)));
            } catch {
                /* noop */
            }
        }
        window.location.href = '/login';
    },
};
