import apiClient from './api';

export interface GastoProgramado {
    id: number;
    descripcion: string;
    categoriaId: number;
    categoriaNombre?: string;
    cuentaId?: number | null;
    cuentaNombre?: string;
    monto: number;
    montoPagado?: number | null;
    esMontoVariable: boolean;
    fechaVencimiento: string;
    fechaPago?: string | null;
    estado: string; // 'Pendiente' | 'Pagado' | 'Vencido' | 'Cancelado'
    gastoRecurrenteId?: number | null;
    gastoGeneradoId?: number | null;
    notas?: string | null;
    fechaCreacion: string;
    diasParaVencimiento: number;
}

export interface CreateGastoProgramadoDto {
    descripcion: string;
    categoriaId: number;
    cuentaId?: number | null;
    monto: number;
    esMontoVariable: boolean;
    fechaVencimiento: string;
    notas?: string | null;
}

export interface UpdateGastoProgramadoDto {
    descripcion: string;
    categoriaId: number;
    cuentaId?: number | null;
    monto: number;
    esMontoVariable: boolean;
    fechaVencimiento: string;
    notas?: string | null;
}

export interface PagarGastoProgramadoDto {
    montoPagado?: number | null;
    cuentaId?: number | null;
    fechaPago?: string | null;
}

const gastosProgramadosService = {
    async getAll(estado?: string): Promise<GastoProgramado[]> {
        const params = estado ? { estado } : {};
        const response = await apiClient.get('/GastosProgramados', { params });
        return response.data;
    },

    async getById(id: number): Promise<GastoProgramado> {
        const response = await apiClient.get(`/GastosProgramados/${id}`);
        return response.data;
    },

    async create(data: CreateGastoProgramadoDto): Promise<GastoProgramado> {
        const response = await apiClient.post('/GastosProgramados', data);
        return response.data;
    },

    async update(id: number, data: UpdateGastoProgramadoDto): Promise<void> {
        await apiClient.put(`/GastosProgramados/${id}`, data);
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/GastosProgramados/${id}`);
    },

    async pagar(id: number, data: PagarGastoProgramadoDto): Promise<GastoProgramado> {
        const response = await apiClient.post(`/GastosProgramados/${id}/pagar`, data);
        return response.data;
    },

    async cancelar(id: number): Promise<void> {
        await apiClient.post(`/GastosProgramados/${id}/cancelar`);
    },
};

export default gastosProgramadosService;
