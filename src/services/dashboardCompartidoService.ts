import apiClient from './api';

export interface DashboardCompartidoLink {
    id: number;
    token: string;
    nombreDestinatario: string | null;
    fechaCreacion: string;
    fechaExpiracion: string | null;
    seccionesPermitidas: string;
}

export const dashboardCompartidoService = {
    async crearLink(data: { nombreDestinatario?: string; diasExpiracion?: number; secciones?: string[] }): Promise<{ token: string; expira: string | null }> {
        const response = await apiClient.post('/dashboard-compartido', data);
        return response.data;
    },
    async misLinks(): Promise<DashboardCompartidoLink[]> {
        const response = await apiClient.get('/dashboard-compartido');
        return response.data;
    },
    async revocarLink(id: number): Promise<void> {
        await apiClient.delete(`/dashboard-compartido/${id}`);
    },
    async verDashboard(token: string): Promise<any> {
        const response = await apiClient.get(`/dashboard-compartido/view/${token}`);
        return response.data;
    },
};
