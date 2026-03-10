import React from 'react';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                        <div className="text-red-500 text-5xl mb-4">!</div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                            Algo salió mal
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Ha ocurrido un error inesperado. Por favor, recarga la página.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Recargar página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
