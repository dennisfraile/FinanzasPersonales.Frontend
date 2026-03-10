import apiClient from './api';

export interface TransaccionSummary {
    id: number;
    tipo: 'Gasto' | 'Ingreso';
    descripcion: string;
    monto: number;
    categoriaNombre?: string;
}

export interface DiaCalendario {
    fecha: string;
    totalIngresos: number;
    totalGastos: number;
    balance: number;
    cantidadTransacciones: number;
    transacciones: TransaccionSummary[];
}

export interface CalendarioData {
    mes: number;
    ano: number;
    dias: DiaCalendario[];
}

export const calendarioService = {
    getCalendario: async (mes: number, ano: number): Promise<CalendarioData> => {
        const response = await apiClient.get<CalendarioData>('/Reportes/calendario', {
            params: { mes, ano },
        });
        return response.data;
    },
};
