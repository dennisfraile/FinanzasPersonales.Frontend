import { useQueryCuentas, useBalanceTotal } from './useQueryHooks';

export const useCuentas = () => {
    const { data: cuentas = [], isLoading: isLoadingCuentas, refetch: refetchCuentas } = useQueryCuentas();
    const { data: balanceTotal = 0, isLoading: isLoadingBalance, refetch: refetchBalance } = useBalanceTotal();

    const isLoading = isLoadingCuentas || isLoadingBalance;

    const refetch = async () => {
        await Promise.all([refetchCuentas(), refetchBalance()]);
    };

    return {
        cuentas,
        balanceTotal,
        isLoading,
        refetch
    };
};
