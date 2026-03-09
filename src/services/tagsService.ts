import apiClient from './api';

export interface Tag {
    id: number;
    nombre: string;
    color: string;
    fechaCreacion: string;
}

export interface CreateTagDto {
    nombre: string;
    color: string;
}

export const tagsService = {
    getAll: async (): Promise<Tag[]> => {
        const response = await apiClient.get<Tag[]>('/Tags');
        return response.data;
    },

    create: async (dto: CreateTagDto): Promise<Tag> => {
        const response = await apiClient.post<Tag>('/Tags', dto);
        return response.data;
    },

    update: async (id: number, dto: CreateTagDto): Promise<void> => {
        await apiClient.put(`/Tags/${id}`, dto);
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/Tags/${id}`);
    },
};
