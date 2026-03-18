import apiClient from './api';

export interface PlantillaGasto {
    id: number;
    nombre: string;
    categoriaId: number;
    categoriaNombre: string | null;
    monto: number | null;
    descripcion: string | null;
    tipo: string | null;
    cuentaId: number | null;
    icono: string | null;
    color: string | null;
    ordenDisplay: number;
    vecesUsada: number;
}

export interface CreatePlantillaGastoDto {
    nombre: string;
    categoriaId: number;
    monto: number | null;
    descripcion: string | null;
    tipo: string | null;
    cuentaId: number | null;
    icono: string | null;
    color: string | null;
    ordenDisplay: number;
}

export interface UpdatePlantillaGastoDto extends CreatePlantillaGastoDto {
    id: number;
}

export interface UsarPlantillaDto {
    fecha: string | null;
    monto: number | null;
}

export const plantillasGastoService = {
    async getAll(): Promise<PlantillaGasto[]> {
        const response = await apiClient.get('/plantillas-gasto');
        return response.data;
    },

    async create(data: CreatePlantillaGastoDto): Promise<PlantillaGasto> {
        const response = await apiClient.post('/plantillas-gasto', data);
        return response.data;
    },

    async update(id: number, data: UpdatePlantillaGastoDto): Promise<void> {
        await apiClient.put(`/plantillas-gasto/${id}`, data);
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/plantillas-gasto/${id}`);
    },

    async usar(id: number, data: UsarPlantillaDto): Promise<any> {
        const response = await apiClient.post(`/plantillas-gasto/${id}/usar`, data);
        return response.data;
    },
};
