import apiClient from './api';

export interface PlantillaIngreso {
    id: number;
    nombre: string;
    categoriaId: number;
    categoriaNombre?: string;
    monto?: number | null;
    descripcion?: string;
    cuentaId?: number | null;
    icono?: string;
    color?: string;
    ordenDisplay: number;
    vecesUsada: number;
    fechaCreacion: string;
}

export interface CreatePlantillaIngresoDto {
    nombre: string;
    categoriaId: number;
    monto?: number | null;
    descripcion?: string;
    cuentaId?: number | null;
    icono?: string;
    color?: string;
    ordenDisplay?: number;
}

export interface UpdatePlantillaIngresoDto extends CreatePlantillaIngresoDto {
    id: number;
}

export interface UsarPlantillaIngresoDto {
    fecha?: string;
    monto?: number;
}

export const plantillasIngresoService = {
    async getAll(): Promise<PlantillaIngreso[]> {
        const response = await apiClient.get('/plantillas-ingreso');
        return response.data;
    },
    async create(data: CreatePlantillaIngresoDto): Promise<PlantillaIngreso> {
        const response = await apiClient.post('/plantillas-ingreso', data);
        return response.data;
    },
    async update(id: number, data: UpdatePlantillaIngresoDto): Promise<void> {
        await apiClient.put(`/plantillas-ingreso/${id}`, data);
    },
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/plantillas-ingreso/${id}`);
    },
    async usar(id: number, data: UsarPlantillaIngresoDto): Promise<unknown> {
        const response = await apiClient.post(`/plantillas-ingreso/${id}/usar`, data);
        return response.data;
    },
};
