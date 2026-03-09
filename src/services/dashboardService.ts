import apiClient from './api';

export interface MesFinanciero {
    mes: string;
    ingresos: number;
    gastos: number;
}

export interface CategoriaTop {
    nombre: string;
    total: number;
    color: string;
}

export interface DashboardMetrics {
    totalIngresosDelMes: number;
    totalGastosDelMes: number;
    balanceDelMes: number;
    cambioMesAnterior: number;
    tendencia6Meses: MesFinanciero[];
    top5Categorias: CategoriaTop[];
}

export const dashboardService = {
    getMetrics: async (): Promise<DashboardMetrics> => {
        const response = await apiClient.get<DashboardMetrics>('/Dashboard/metrics');
        return response.data;
    },
};
