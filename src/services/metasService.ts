import apiClient from './api';

export interface Meta {
    id: number;
    metas: string;
    montoTotal: number;
    ahorroActual: number;
    montoRestante: number;
    cuentaId?: number | null;
    abonoAutomatico: boolean;
    montoAbono?: number | null;
    frecuenciaAbono?: string | null;
    diaAbono?: number | null;
    proximoAbono?: string | null;
    ultimoAbono?: string | null;
}

export interface CreateMetaDto {
    metas: string;
    montoTotal: number;
    ahorroActual: number;
    montoRestante: number;
    cuentaId?: number | null;
    abonoAutomatico?: boolean;
    montoAbono?: number | null;
    frecuenciaAbono?: string | null;
    diaAbono?: number | null;
}

export const metasService = {
    async getAll(): Promise<Meta[]> {
        const response = await apiClient.get('/Metas');
        return response.data;
    },

    async create(meta: CreateMetaDto): Promise<Meta> {
        const response = await apiClient.post('/Metas', meta);
        return response.data;
    },

    async update(id: number, meta: CreateMetaDto): Promise<void> {
        await apiClient.put(`/Metas/${id}`, { id, ...meta });
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/Metas/${id}`);
    },

    async abonar(id: number, monto: number): Promise<void> {
        await apiClient.post(`/Metas/${id}/abonar`, { monto });
    },

    async getProgreso(id: number): Promise<any> {
        const response = await apiClient.get(`/Metas/${id}/progreso`);
        return response.data;
    },

    async getProyecciones(): Promise<any[]> {
        const response = await apiClient.get('/Metas/proyecciones');
        return response.data;
    },
};
