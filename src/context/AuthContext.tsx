import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService, type AuthResponse } from '../services/authService';
import { userService, type UserProfile } from '../services/userService';

interface AuthContextType {
    user: { id: string; email: string; userName?: string } | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<{ id: string; email: string; userName?: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadUserProfile = async () => {
        try {
            const profile: UserProfile = await userService.getProfile();
            setUser({
                id: profile.id,
                email: profile.email,
                userName: profile.userName
            });
        } catch (error) {
            console.error('Error loading profile:', error);
            setUser(null);
        }
    };

    useEffect(() => {
        // Verificar si hay token al cargar
        const token = authService.getToken();
        if (token) {
            loadUserProfile();
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const response: AuthResponse = await authService.login({ email, password });
        localStorage.setItem('token', response.token);
        await loadUserProfile();
    };

    const register = async (email: string, password: string) => {
        const response: AuthResponse = await authService.register({ email, password });
        localStorage.setItem('token', response.token);
        await loadUserProfile();
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const refreshUserProfile = async () => {
        await loadUserProfile();
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isLoading, refreshUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
