import apiClient from './api';

export interface TransaccionTimeline {
    id: number;
    fecha: string;
    tipo: 'Ingreso' | 'Gasto' | 'TransferenciaEntrada' | 'TransferenciaSalida';
    descripcion: string;
    categoria?: string;
    monto: number;
    balanceDespues: number;
    esRecurrente: boolean;
}

export interface RecurrenteProximo {
    id: number;
    tipo: 'Ingreso' | 'Gasto';
    descripcion: string;
    monto: number;
    proximaFecha: string;
    frecuencia: string;
}

export interface ResumenMensualCuenta {
    mes: number;
    ano: number;
    periodo: string;
    totalIngresos: number;
    totalGastos: number;
    balance: number;
}

export interface SurplusQuincena {
    periodo: string;
    fechaInicio: string;
    fechaFin: string;
    totalIngresos: number;
    totalGastos: number;
    surplus: number;
    periodoTerminado: boolean;
}

export interface CuentaDashboard {
    cuentaId: number;
    nombre: string;
    tipo: string;
    balanceActual: number;
    balanceInicial: number;
    moneda: string;
    color?: string;
    transacciones: TransaccionTimeline[];
    totalTransacciones: number;
    proximos: RecurrenteProximo[];
    resumenMensual: ResumenMensualCuenta[];
    surplusActual?: SurplusQuincena;
}

export interface AsignarSurplusDto {
    cuentaId: number;
    destino: 'BalanceInicial' | 'Meta';
    metaId?: number;
    monto: number;
}

export const cuentaDashboardService = {
    getDashboard: async (cuentaId: number, page = 1, pageSize = 50): Promise<CuentaDashboard> => {
        const response = await apiClient.get<CuentaDashboard>(`/dashboard/cuenta/${cuentaId}`, {
            params: { page, pageSize }
        });
        return response.data;
    },

    asignarSurplus: async (data: AsignarSurplusDto): Promise<void> => {
        await apiClient.post('/dashboard/cuenta/asignar-surplus', data);
    }
};
