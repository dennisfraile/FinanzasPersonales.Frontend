import apiClient from './api';

export interface Presupuesto {
    id: number;
    categoriaId: number;
    categoriaNombre: string;
    montoLimite: number;
    periodo: string;
    mesAplicable: number;
    anoAplicable: number;
    gastadoActual: number;
    disponible: number;
    porcentajeUtilizado: number;
}

export interface CreatePresupuestoDto {
    categoriaId: number;
    montoLimite: number;
    periodo: string;
    mesAplicable: number;
    anoAplicable: number;
}

export const presupuestosService = {
    async getAll(): Promise<Presupuesto[]> {
        const response = await apiClient.get('/Presupuestos');
        return response.data;
    },

    async create(presupuesto: CreatePresupuestoDto): Promise<Presupuesto> {
        const response = await apiClient.post('/Presupuestos', presupuesto);
        return response.data;
    },

    async update(id: number, presupuesto: CreatePresupuestoDto): Promise<void> {
        await apiClient.put(`/Presupuestos/${id}`, { id, ...presupuesto });
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/Presupuestos/${id}`);
    },
};
