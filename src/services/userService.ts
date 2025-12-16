import apiClient from './api';

export interface UserProfile {
    id: string;
    email: string;
    userName?: string;
}

export interface UpdateUserProfile {
    userName?: string;
}

export interface ChangePassword {
    currentPassword: string;
    newPassword: string;
}

export const userService = {
    async getProfile(): Promise<UserProfile> {
        const response = await apiClient.get('/Auth/profile');
        return response.data;
    },

    async updateProfile(data: UpdateUserProfile): Promise<void> {
        await apiClient.put('/Auth/profile', data);
    },

    async changePassword(data: ChangePassword): Promise<void> {
        await apiClient.put('/Auth/change-password', data);
    },
};
