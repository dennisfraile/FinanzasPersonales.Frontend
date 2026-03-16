import apiClient from './api';

export interface Gasto {
    id: number;
    fecha: string;
    categoriaId: number;
    categoriaNombre?: string;
    tipo?: string;
    descripcion?: string;
    monto: number;
    tagIds?: number[];
    cantidadDetalles?: number;
    montoDisponible?: number | null;
}

export interface CreateGastoDto {
    fecha: string;
    categoriaId: number;
    tipo: string;
    descripcion: string;
    monto: number;
    cuentaId?: number | null; // NUEVO
    tagIds?: number[];
}

export const gastosService = {
    async getAll(): Promise<Gasto[]> {
        const response = await apiClient.get('/Gastos');
        return response.data.items || response.data;
    },

    async getById(id: number): Promise<Gasto> {
        const response = await apiClient.get(`/Gastos/${id}`);
        return response.data;
    },

    async create(gasto: CreateGastoDto): Promise<Gasto> {
        const response = await apiClient.post('/Gastos', gasto);
        return response.data;
    },

    async update(id: number, gasto: CreateGastoDto): Promise<void> {
        await apiClient.put(`/Gastos/${id}`, { id, ...gasto });
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/Gastos/${id}`);
    },
};
