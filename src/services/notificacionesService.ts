import apiClient from './api';

export interface NotificacionDto {
    id: number;
    tipo: string;
    titulo: string;
    mensaje: string;
    fechaCreacion: string;
    leida: boolean;
    referenciaId?: number;
}

export interface ConfiguracionNotificacionesDto {
    alertasPresupuesto: boolean;
    umbralPresupuesto: number;
    alertasMetas: boolean;
    diasAntesMeta: number;
    email?: string;
}

export const notificacionesService = {
    async getNotificaciones(soloNoLeidas: boolean = false): Promise<NotificacionDto[]> {
        const response = await apiClient.get(`/Notificaciones?soloNoLeidas=${soloNoLeidas}`);
        return response.data;
    },

    async getNoLeidas(): Promise<number> {
        const response = await apiClient.get('/Notificaciones/no-leidas');
        return response.data;
    },

    async marcarLeida(id: number): Promise<void> {
        await apiClient.put(`/Notificaciones/${id}/leer`);
    },

    async getConfiguracion(): Promise<ConfiguracionNotificacionesDto> {
        const response = await apiClient.get('/Notificaciones/configuracion');
        return response.data;
    },

    async updateConfiguracion(config: ConfiguracionNotificacionesDto): Promise<void> {
        await apiClient.put('/Notificaciones/configuracion', config);
    }
};
