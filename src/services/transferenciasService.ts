import apiClient from './api';

export interface TransferenciaDto {
    id: number;
    cuentaOrigenId: number;
    cuentaOrigenNombre: string;
    cuentaDestinoId: number;
    cuentaDestinoNombre: string;
    monto: number;
    fecha: string;
    descripcion?: string;
}

export interface TransferenciaCreateDto {
    cuentaOrigenId: number;
    cuentaDestinoId: number;
    monto: number;
    descripcion?: string;
}

class TransferenciasService {
    async getTransferencias(): Promise<TransferenciaDto[]> {
        const response = await apiClient.get<TransferenciaDto[]>('/Transferencias');
        return response.data;
    }

    async createTransferencia(data: TransferenciaCreateDto): Promise<TransferenciaDto> {
        const response = await apiClient.post<TransferenciaDto>('/Transferencias', data);
        return response.data;
    }
}

export default new TransferenciasService();
