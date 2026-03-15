import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';

export const LoginPage = () => {
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleGoogleSuccess = async (response: CredentialResponse) => {
        if (!response.credential) {
            setError('No se recibio credencial de Google');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            await loginWithGoogle(response.credential);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al iniciar sesion con Google');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Error al conectar con Google. Intenta de nuevo.');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="text-center mb-8">
                    <img src="/logo.png" alt="Mis finanzas" className="h-20 w-20 mx-auto mb-4 rounded-full object-cover" />
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Mis finanzas</h1>
                    <p className="text-gray-600">Inicia sesion con tu cuenta de Google</p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            size="large"
                            width="300"
                            text="signin_with"
                            shape="rectangular"
                            theme="outline"
                        />
                    </div>
                )}

                <p className="text-center mt-6 text-sm text-gray-500">
                    Al iniciar sesion, aceptas nuestros terminos y condiciones.
                </p>
            </div>
        </div>
    );
};
