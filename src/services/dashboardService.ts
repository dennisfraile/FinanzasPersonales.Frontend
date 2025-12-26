import axios from 'axios';

const API_URL = 'http://localhost:5050/api';

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

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const dashboardService = {
    getMetrics: async (): Promise<DashboardMetrics> => {
        const response = await axios.get<DashboardMetrics>(
            `${API_URL}/Dashboard/metrics`,
            getAuthHeaders()
        );
        return response.data;
    },
};
