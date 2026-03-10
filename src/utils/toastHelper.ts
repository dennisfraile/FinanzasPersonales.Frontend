import { toast, type ToastOptions } from 'react-toastify';

const defaultOptions: ToastOptions = {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
};

export const toastHelper = {
    success: (message: string, options?: ToastOptions) => {
        toast.success(`✅ ${message}`, { ...defaultOptions, ...options });
    },

    error: (message: string, suggestion?: string, options?: ToastOptions) => {
        const fullMessage = suggestion
            ? `❌ ${message}\n💡 ${suggestion}`
            : `❌ ${message}`;
        toast.error(fullMessage, { ...defaultOptions, autoClose: 5000, ...options });
    },

    warning: (message: string, options?: ToastOptions) => {
        toast.warning(`⚠️ ${message}`, { ...defaultOptions, autoClose: 4000, ...options });
    },

    info: (message: string, options?: ToastOptions) => {
        toast.info(`ℹ️ ${message}`, { ...defaultOptions, ...options });
    },

    // Friendly error handlers
    handleApiError: (error: any, context: string = 'operación') => {
        if (error.response?.status === 401) {
            toastHelper.error(
                'Sesión expirada',
                'Por favor inicia sesión nuevamente'
            );
        } else if (error.response?.status === 403) {
            toastHelper.error(
                'No tienes permisos',
                'Contacta al administrador si necesitas acceso'
            );
        } else if (error.response?.status === 404) {
            toastHelper.error(
                'Recurso no encontrado',
                'El elemento que buscas no existe o fue eliminado'
            );
        } else if (error.response?.status === 409) {
            toastHelper.error(
                'Conflicto de datos',
                'Ya existe un registro similar. Verifica la información'
            );
        } else if (error.response?.status >= 500) {
            toastHelper.error(
                'Error del servidor',
                'Intenta nuevamente en unos momentos o contacta soporte'
            );
        } else if (error.request) {
            toastHelper.error(
                'Error de conexión',
                'Verifica tu conexión a internet e intenta nuevamente'
            );
        } else {
            toastHelper.error(
                `Error al ${context}`,
                error.response?.data?.message || error.message || 'Intenta nuevamente'
            );
        }
    },
};
