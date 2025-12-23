import axios from 'axios';

const API_URL = 'http://localhost:5050/api';

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

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const calendarioService = {
    getCalendario: async (mes: number, ano: number): Promise<CalendarioData> => {
        const response = await axios.get<CalendarioData>(
            `${API_URL}/Reportes/calendario`,
            {
                ...getAuthHeaders(),
                params: { mes, ano },
            }
        );
        return response.data;
    },
};
