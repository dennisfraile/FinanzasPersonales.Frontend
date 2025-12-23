import apiClient from './api';

export interface Adjunto {
    id: number;
    fileName: string;
    filePath: string;
    contentType: string;
    fileSize: number;
    gastoId?: number | null;
    ingresoId?: number | null;
    userId: string;
    fechaSubida: string;
}

const adjuntosService = {
    async upload(file: File, gastoId?: number, ingresoId?: number): Promise<Adjunto> {
        const formData = new FormData();
        formData.append('file', file);
        if (gastoId) formData.append('gastoId', gastoId.toString());
        if (ingresoId) formData.append('ingresoId', ingresoId.toString());

        const response = await apiClient.post('/Adjuntos/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    async download(id: number): Promise<Blob> {
        const response = await apiClient.get(`/Adjuntos/${id}/download`, {
            responseType: 'blob'
        });
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/Adjuntos/${id}`);
    },

    async getByGasto(gastoId: number): Promise<Adjunto[]> {
        const response = await apiClient.get(`/Adjuntos/gasto/${gastoId}`);
        return response.data;
    },

    async getByIngreso(ingresoId: number): Promise<Adjunto[]> {
        const response = await apiClient.get(`/Adjuntos/ingreso/${ingresoId}`);
        return response.data;
    }
};

export default adjuntosService;
