import { createContext, useContext, useCallback, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';

export interface ConfirmOptions {
    message: string;
    title?: string;
    confirmText?: string;
    cancelText?: string;
    /** Estilo destructivo (botón rojo). true por defecto: casi todos los usos son borrados. */
    danger?: boolean;
}

/** Devuelve una promesa que resuelve true si el usuario confirma, false si cancela. */
type ConfirmFn = (options: string | ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | undefined>(undefined);

/**
 * Provider de confirmación montado una vez en App. Reemplaza window.confirm por
 * un diálogo accesible y tematizado. Uso:
 *   const confirm = useConfirm();
 *   if (await confirm('¿Eliminar?')) { ... }
 */
export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const resolverRef = useRef<((value: boolean) => void) | null>(null);

    const confirm = useCallback<ConfirmFn>((opts) => {
        const normalized = typeof opts === 'string' ? { message: opts } : opts;
        setOptions(normalized);
        return new Promise<boolean>((resolve) => {
            resolverRef.current = resolve;
        });
    }, []);

    const handleClose = useCallback((result: boolean) => {
        resolverRef.current?.(result);
        resolverRef.current = null;
        setOptions(null);
    }, []);

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {options && (
                <ConfirmDialog
                    {...options}
                    onConfirm={() => handleClose(true)}
                    onCancel={() => handleClose(false)}
                />
            )}
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within ConfirmProvider');
    }
    return context;
};
