import apiClient from './api';

export interface Ingreso {
    id: number;
    fecha: string;
    categoriaId: number;
    categoriaNombre?: string;
    descripcion?: string;
    monto: number;
    cuentaId?: number | null;
    notas?: string;
    tagIds?: number[];
}

export interface CreateIngresoDto {
    fecha: string;
    categoriaId: number;
    descripcion?: string;
    monto: number;
    cuentaId?: number | null; // NUEVO
    tagIds?: number[];
}

export const ingresosService = {
    async getAll(): Promise<Ingreso[]> {
        const response = await apiClient.get('/Ingresos');
        return response.data.items || response.data;
    },

    async create(ingreso: CreateIngresoDto): Promise<Ingreso> {
        const response = await apiClient.post('/Ingresos', ingreso);
        return response.data;
    },

    async update(id: number, ingreso: CreateIngresoDto): Promise<void> {
        await apiClient.put(`/Ingresos/${id}`, { id, ...ingreso });
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/Ingresos/${id}`);
    },
};
