import apiClient from './api';

export interface AuthResponse {
    token: string;
    isSuccess: boolean;
    message: string;
}

export const authService = {
    async loginWithGoogle(idToken: string): Promise<AuthResponse> {
        const response = await apiClient.post('/Auth/google', { idToken });
        return response.data;
    },

    logout() {
        localStorage.removeItem('token');
        window.location.href = '/login';
    },

    getToken(): string | null {
        return localStorage.getItem('token');
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    },
};
