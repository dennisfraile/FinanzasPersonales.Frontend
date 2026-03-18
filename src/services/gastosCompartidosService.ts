import apiClient from './api';

export interface ParticipanteGasto {
    id: number;
    nombre: string;
    email: string | null;
    montoAsignado: number;
    montoPagado: number;
    liquidado: boolean;
    fechaLiquidacion: string | null;
}

export interface GastoCompartido {
    id: number;
    descripcion: string;
    montoTotal: number;
    fecha: string;
    categoriaId: number | null;
    categoriaNombre: string | null;
    metodoDivision: string;
    montoRecuperado: number;
    montoPendiente: number;
    participantes: ParticipanteGasto[];
}

export interface CreateParticipanteDto {
    nombre: string;
    email: string | null;
    montoAsignado: number | null;
    porcentaje: number | null;
}

export interface CreateGastoCompartidoDto {
    descripcion: string;
    montoTotal: number;
    fecha: string;
    categoriaId: number | null;
    metodoDivision: string;
    participantes: CreateParticipanteDto[];
}

export interface DeudorResumen {
    nombre: string;
    totalDeuda: number;
    totalPagado: number;
    pendiente: number;
}

export interface ResumenSplit {
    totalPendientePorCobrar: number;
    totalRecuperado: number;
    deudores: DeudorResumen[];
}

export const gastosCompartidosService = {
    async getAll(): Promise<GastoCompartido[]> {
        const response = await apiClient.get('/gastos-compartidos');
        return response.data;
    },

    async getById(id: number): Promise<GastoCompartido> {
        const response = await apiClient.get(`/gastos-compartidos/${id}`);
        return response.data;
    },

    async create(data: CreateGastoCompartidoDto): Promise<GastoCompartido> {
        const response = await apiClient.post('/gastos-compartidos', data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/gastos-compartidos/${id}`);
    },

    async liquidarParticipante(gastoId: number, participanteId: number, monto: number): Promise<void> {
        await apiClient.put(`/gastos-compartidos/${gastoId}/participantes/${participanteId}/liquidar`, { monto });
    },

    async getResumen(): Promise<ResumenSplit> {
        const response = await apiClient.get('/gastos-compartidos/resumen');
        return response.data;
    },
};
