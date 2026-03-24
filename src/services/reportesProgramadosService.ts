import apiClient from './api';

export interface ReporteProgramado {
    id: number;
    frecuencia: string;
    emailDestino: string;
    seccionesIncluir: string;
    activo: boolean;
    ultimoEnvio: string | null;
    fechaCreacion: string;
}

export interface CreateReporteProgramadoDto {
    frecuencia: string;
    emailDestino: string;
    seccionesIncluir: string[];
    activo?: boolean;
}

export const reportesProgramadosService = {
    async getAll(): Promise<ReporteProgramado[]> {
        const response = await apiClient.get('/reportes-programados');
        return response.data;
    },
    async create(data: CreateReporteProgramadoDto): Promise<ReporteProgramado> {
        const response = await apiClient.post('/reportes-programados', data);
        return response.data;
    },
    async update(id: number, data: CreateReporteProgramadoDto): Promise<void> {
        await apiClient.put(`/reportes-programados/${id}`, data);
    },
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/reportes-programados/${id}`);
    },
    async toggleActivo(id: number): Promise<void> {
        await apiClient.patch(`/reportes-programados/${id}/toggle`);
    },
};
