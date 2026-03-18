import apiClient from './api';

export interface ReglaCategoria {
    id: number;
    patron: string;
    tipoCoincidencia: string;
    categoriaId: number;
    categoriaNombre: string | null;
    tipoTransaccion: string;
    prioridad: number;
    activa: boolean;
}

export interface CreateReglaCategoriaDto {
    patron: string;
    tipoCoincidencia: string;
    categoriaId: number;
    tipoTransaccion: string;
    prioridad: number;
}

export interface UpdateReglaCategoriaDto extends CreateReglaCategoriaDto {
    id: number;
    activa: boolean;
}

export interface CategoriaSugerida {
    categoriaId: number;
    categoriaNombre: string;
    reglaId: number;
    patronCoincidido: string;
}

export const reglasCategoriaService = {
    async getAll(): Promise<ReglaCategoria[]> {
        const response = await apiClient.get('/reglas-categoria');
        return response.data;
    },

    async create(data: CreateReglaCategoriaDto): Promise<ReglaCategoria> {
        const response = await apiClient.post('/reglas-categoria', data);
        return response.data;
    },

    async update(id: number, data: UpdateReglaCategoriaDto): Promise<void> {
        await apiClient.put(`/reglas-categoria/${id}`, data);
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/reglas-categoria/${id}`);
    },

    async sugerir(descripcion: string, tipo: string): Promise<CategoriaSugerida | null> {
        const response = await apiClient.get('/reglas-categoria/sugerir', { params: { descripcion, tipo } });
        return response.data;
    },
};
