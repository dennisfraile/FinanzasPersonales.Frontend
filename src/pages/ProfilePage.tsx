import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService, type UpdateUserProfile } from '../services/userService';
import { toast } from 'react-toastify';
import { User, Save } from 'lucide-react';

export const ProfilePage = () => {
    const { user, refreshUserProfile } = useAuth();
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);

    const [profileData, setProfileData] = useState<UpdateUserProfile>({
        userName: user?.userName || ''
    });

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
            toast.error(errorMessage);
        } finally {
            setIsLoadingProfile(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mi perfil</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Gestiona tu informacion personal</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    {/* Foto de perfil de Google */}
                    {user?.fotoUrl && (
                        <div className="flex justify-center mb-6">
                            <img
                                src={user.fotoUrl}
                                alt="Foto de perfil"
                                className="w-20 h-20 rounded-full border-2 border-blue-500"
                                referrerPolicy="no-referrer"
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-2 mb-4">
                        <User className="text-blue-600 dark:text-blue-400" size={24} />
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Informacion Personal</h2>
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
                                aria-label="Email"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Vinculado a tu cuenta de Google</p>
                        </div>

                        <div>
                            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nombre de Usuario
                            </label>
                            <input
                                id="userName"
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
            </div>
        </div>
    );
};
