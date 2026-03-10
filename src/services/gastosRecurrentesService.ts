import apiClient from './api';

export interface GastoRecurrente {
    id: number;
    descripcion: string;
    categoriaId: number;
    categoriaNombre?: string;
    monto: number;
    cuentaId?: number | null;
    cuentaNombre?: string;
    frecuencia: string; // 'Semanal' | 'Quincenal' | 'Mensual' | 'Anual'
    diaDePago: number;
    proximaFecha: string;
    ultimaGeneracion?: string | null;
    activo: boolean;
    fechaCreacion: string;
}

export interface CreateGastoRecurrenteDto {
    descripcion: string;
    categoriaId: number;
    monto: number;
    cuentaId?: number | null;
    frecuencia: string;
    diaDePago: number;
}

export interface UpdateGastoRecurrenteDto extends CreateGastoRecurrenteDto {
    activo: boolean;
}

const gastosRecurrentesService = {
    async getAll(): Promise<GastoRecurrente[]> {
        const response = await apiClient.get('/GastosRecurrentes');
        return response.data;
    },

    async getById(id: number): Promise<GastoRecurrente> {
        const response = await apiClient.get(`/GastosRecurrentes/${id}`);
        return response.data;
    },

    async create(data: CreateGastoRecurrenteDto): Promise<GastoRecurrente> {
        const response = await apiClient.post('/GastosRecurrentes', data);
        return response.data;
    },

    async update(id: number, data: UpdateGastoRecurrenteDto): Promise<void> {
        await apiClient.put(`/GastosRecurrentes/${id}`, data);
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/GastosRecurrentes/${id}`);
    },

    async generar(id: number): Promise<void> {
        await apiClient.post(`/GastosRecurrentes/${id}/generar`);
    },

    async generarPendientes(): Promise<{ generados: number; mensaje: string }> {
        const response = await apiClient.post('/GastosRecurrentes/generar-pendientes');
        return response.data;
    }
};

export default gastosRecurrentesService;
