import apiClient from './api';

export interface Categoria {
    id: number;
    nombre: string;
    tipo: string;
}

export interface CreateCategoriaDto {
    nombre: string;
    tipo: string;
}

export const categoriasService = {
    async getAll(): Promise<Categoria[]> {
        const response = await apiClient.get('/Categorias');
        return response.data;
    },

    async getById(id: number): Promise<Categoria> {
        const response = await apiClient.get(`/Categorias/${id}`);
        return response.data;
    },

    async create(categoria: CreateCategoriaDto): Promise<Categoria> {
        // El backend ahora usa CreateCategoriaDto que no requiere UserId
        const response = await apiClient.post('/Categorias', {
            Nombre: categoria.nombre,
            Tipo: categoria.tipo
        });
        return response.data;
    },

    async update(id: number, categoria: CreateCategoriaDto): Promise<void> {
        await apiClient.put(`/Categorias/${id}`, {
            Id: id,
            Nombre: categoria.nombre,
            Tipo: categoria.tipo
        });
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/Categorias/${id}`);
    },
};
