import axios from 'axios';

const API_URL = 'http://localhost:5050/api';

export interface PeriodoFinanciero {
    fechaInicio: string;
    fechaFin: string;
    totalIngresos: number;
    totalGastos: number;
    balance: number;
    cantidadIngresos: number;
    cantidadGastos: number;
}

export interface ComparacionPeriodos {
    periodo1: PeriodoFinanciero;
    periodo2: PeriodoFinanciero;
    diferenciaIngresos: number;
    diferenciaGastos: number;
    diferenciaBalance: number;
    porcentajeCambioIngresos: number;
    porcentajeCambioGastos: number;
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const comparacionService = {
    compararPeriodos: async (
        fecha1Inicio: string,
        fecha1Fin: string,
        fecha2Inicio: string,
        fecha2Fin: string
    ): Promise<ComparacionPeriodos> => {
        const response = await axios.get<ComparacionPeriodos>(
            `${API_URL}/Reportes/comparar-periodos`,
            {
                ...getAuthHeaders(),
                params: { fecha1Inicio, fecha1Fin, fecha2Inicio, fecha2Fin },
            }
        );
        return response.data;
    },
};
