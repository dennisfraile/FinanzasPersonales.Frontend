import { useState, useEffect } from 'react';
import type { CuentaDto } from '../services/cuentasService';
import cuentasService from '../services/cuentasService';
import { toast } from 'react-toastify';

export const useCuentas = () => {
    const [cuentas, setCuentas] = useState<CuentaDto[]>([]);
    const [balanceTotal, setBalanceTotal] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCuentas = async () => {
        try {
            setIsLoading(true);
            const data = await cuentasService.getCuentas();
            setCuentas(data);

            const balance = await cuentasService.getBalanceTotal();
            setBalanceTotal(balance);
        } catch (error) {
            console.error('Error fetching cuentas:', error);
            toast.error('Error al cargar cuentas');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCuentas();
    }, []);

    return {
        cuentas,
        balanceTotal,
        isLoading,
        refetch: fetchCuentas
    };
};
