import apiClient from './api';

export interface DetalleGasto {
    id: number;
    gastoId: number;
    descripcion: string;
    monto: number;
    fecha: string;
    notas?: string;
}

export interface CreateDetalleGastoDto {
    descripcion: string;
    monto: number;
    fecha: string;
    notas?: string;
}

export interface GastoConDetalles {
    id: number;
    fecha: string;
    categoriaId: number;
    categoriaNombre?: string;
    tipo?: string;
    descripcion?: string;
    monto: number;
    cuentaId?: number;
    notas?: string;
    tagIds?: number[];
    cantidadDetalles: number;
    montoConsumido: number;
    montoDisponible: number;
    detalles: DetalleGasto[];
}

export const detallesGastoService = {
    async getGastoConDetalles(gastoId: number): Promise<GastoConDetalles> {
        const response = await apiClient.get(`/Gastos/${gastoId}/con-detalles`);
        return response.data;
    },

    async getDetalles(gastoId: number): Promise<DetalleGasto[]> {
        const response = await apiClient.get(`/Gastos/${gastoId}/detalles`);
        return response.data;
    },

    async create(gastoId: number, dto: CreateDetalleGastoDto): Promise<DetalleGasto> {
        const response = await apiClient.post(`/Gastos/${gastoId}/detalles`, dto);
        return response.data;
    },

    async update(gastoId: number, detalleId: number, dto: CreateDetalleGastoDto): Promise<void> {
        await apiClient.put(`/Gastos/${gastoId}/detalles/${detalleId}`, dto);
    },

    async delete(gastoId: number, detalleId: number): Promise<void> {
        await apiClient.delete(`/Gastos/${gastoId}/detalles/${detalleId}`);
    },
};
