import apiClient from './api';

export interface IngresoRecurrente {
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

export interface CreateIngresoRecurrenteDto {
    descripcion: string;
    categoriaId: number;
    monto: number;
    cuentaId?: number | null;
    frecuencia: string;
    diaDePago: number;
}

export interface UpdateIngresoRecurrenteDto extends CreateIngresoRecurrenteDto {
    activo: boolean;
}

const ingresosRecurrentesService = {
    async getAll(): Promise<IngresoRecurrente[]> {
        const response = await apiClient.get('/IngresosRecurrentes');
        return response.data;
    },

    async getById(id: number): Promise<IngresoRecurrente> {
        const response = await apiClient.get(`/IngresosRecurrentes/${id}`);
        return response.data;
    },

    async create(data: CreateIngresoRecurrenteDto): Promise<IngresoRecurrente> {
        const response = await apiClient.post('/IngresosRecurrentes', data);
        return response.data;
    },

    async update(id: number, data: UpdateIngresoRecurrenteDto): Promise<void> {
        await apiClient.put(`/IngresosRecurrentes/${id}`, data);
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/IngresosRecurrentes/${id}`);
    },

    async generar(id: number): Promise<void> {
        await apiClient.post(`/IngresosRecurrentes/${id}/generar`);
    },

    async generarPendientes(): Promise<{ generados: number; mensaje: string }> {
        const response = await apiClient.post('/IngresosRecurrentes/generar-pendientes');
        return response.data;
    }
};

export default ingresosRecurrentesService;
