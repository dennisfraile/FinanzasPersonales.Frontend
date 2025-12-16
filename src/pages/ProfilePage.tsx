import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService, type UpdateUserProfile, type ChangePassword } from '../services/userService';
import { toast } from 'react-toastify';
import { User, Lock, Save } from 'lucide-react';

export const ProfilePage = () => {
    const { user, refreshUserProfile } = useAuth();
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [isLoadingPassword, setIsLoadingPassword] = useState(false);

    const [profileData, setProfileData] = useState<UpdateUserProfile>({
        userName: user?.userName || ''
    });

    const [passwordData, setPasswordData] = useState<ChangePassword>({
        currentPassword: '',
        newPassword: ''
    });

    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (user) {
            setProfileData({ userName: user.userName || '' });
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoadingProfile(true);
        try {
            await userService.updateProfile(profileData);
            await refreshUserProfile();
            toast.success('Perfil actualizado exitosamente');
        } catch (error: any) {
            console.error('Error updating profile:', error);
            const errorMessage = error.response?.data?.message || error.response?.data?.Message || 'Error al actualizar el perfil';
            const errors = error.response?.data?.errors || error.response?.data?.Errors;

            if (errors && Array.isArray(errors) && errors.length > 0) {
                errors.forEach((err: string) => toast.error(err));
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setIsLoadingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setIsLoadingPassword(true);
        try {
            await userService.changePassword(passwordData);
            toast.success('Contraseña cambiada exitosamente');
            setPasswordData({ currentPassword: '', newPassword: '' });
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Error changing password:', error);
            const errorMessage = error.response?.data?.message || error.response?.data?.Message || 'Error al cambiar la contraseña';
            const errors = error.response?.data?.errors || error.response?.data?.Errors;

            if (errors && Array.isArray(errors) && errors.length > 0) {
                errors.forEach((err: string) => toast.error(err));
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setIsLoadingPassword(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">👤 Mi Perfil</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Gestiona tu información personal</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Información del Perfil */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <User className="text-blue-600 dark:text-blue-400" size={24} />
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Información Personal</h2>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">El email no se puede modificar</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nombre de Usuario
                                </label>
                                <input
                                    type="text"
                                    value={profileData.userName || ''}
                                    onChange={(e) => setProfileData({ userName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ingresa tu nombre"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoadingProfile}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save size={18} />
                                {isLoadingProfile ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </form>
                    </div>

                    {/* Cambiar Contraseña */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Lock className="text-red-600 dark:text-red-400" size={24} />
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Cambiar Contraseña</h2>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Contraseña Actual
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nueva Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Confirmar Nueva Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoadingPassword}
                                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Lock size={18} />
                                {isLoadingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
