import axios from 'axios';

const API_URL = 'http://localhost:5050/api';

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

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const tagsService = {
    getAll: async (): Promise<Tag[]> => {
        const response = await axios.get<Tag[]>(`${API_URL}/Tags`, getAuthHeaders());
        return response.data;
    },

    create: async (dto: CreateTagDto): Promise<Tag> => {
        const response = await axios.post<Tag>(`${API_URL}/Tags`, dto, getAuthHeaders());
        return response.data;
    },

    update: async (id: number, dto: CreateTagDto): Promise<void> => {
        await axios.put(`${API_URL}/Tags/${id}`, dto, getAuthHeaders());
    },

    delete: async (id: number): Promise<void> => {
        await axios.delete(`${API_URL}/Tags/${id}`, getAuthHeaders());
    },
};
