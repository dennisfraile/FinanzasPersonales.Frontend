import apiClient from './api';

export interface DashboardData {
    mesActual: {
        totalIngresos: number;
        totalGastos: number;
        balance: number;
        metasActivas: number;
        presupuestosActivos: number;
    };
}

export interface GraficaData {
    titulo: string;
    datos: Array<{
        etiqueta: string;
        valor: number;
    }>;
}

export const dashboardService = {
    async getResumen(mes?: number, ano?: number): Promise<DashboardData> {
        const params = new URLSearchParams();
        if (mes) params.append('mes', mes.toString());
        if (ano) params.append('ano', ano.toString());
        const response = await apiClient.get(`/Dashboard?${params.toString()}`);
        return response.data;
    },

    async getIngresosVsGastos(): Promise<GraficaData> {
        const response = await apiClient.get('/Dashboard/grafica/ingresos-vs-gastos');
        return response.data;
    },

    async getGastosPorCategoria(mes?: number, ano?: number): Promise<GraficaData> {
        const params = new URLSearchParams();
        if (mes) params.append('mes', mes.toString());
        if (ano) params.append('ano', ano.toString());
        const response = await apiClient.get(`/Dashboard/grafica/gastos-por-categoria?${params.toString()}`);
        return response.data;
    },

    async getProgresoMetas(): Promise<GraficaData> {
        const response = await apiClient.get('/Dashboard/grafica/progreso-metas');
        return response.data;
    },
};
