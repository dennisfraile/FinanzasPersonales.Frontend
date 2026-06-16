import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { userService, type UserProfile } from '../services/userService';

interface AuthContextType {
    user: { id: string; email: string; userName?: string; fotoUrl?: string } | null;
    loginWithGoogle: (idToken: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<{ id: string; email: string; userName?: string; fotoUrl?: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadUserProfile = async () => {
        try {
            const profile: UserProfile = await userService.getProfile();
            setUser({
                id: profile.id,
                email: profile.email,
                userName: profile.userName,
                fotoUrl: profile.fotoUrl
            });
        } catch (error) {
            console.error('Error loading profile:', error);
            setUser(null);
        }
    };

    useEffect(() => {
        loadUserProfile().finally(() => setIsLoading(false));
    }, []);

    const loginWithGoogle = async (idToken: string) => {
        await authService.loginWithGoogle(idToken);
        await loadUserProfile();
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    const refreshUserProfile = async () => {
        await loadUserProfile();
    };

    return (
        <AuthContext.Provider value={{ user, loginWithGoogle, logout, isLoading, refreshUserProfile }}>
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
