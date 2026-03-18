import apiClient from './api';

export interface Deuda {
    id: number;
    nombre: string;
    tipo: string;
    montoOriginal: number;
    saldoActual: number;
    tasaInteres: number;
    pagoMinimo: number | null;
    diaDePago: number | null;
    fechaInicio: string;
    fechaVencimiento: string | null;
    cuentaId: number | null;
    activa: boolean;
    notas: string | null;
    totalPagado: number;
    porcentajePagado: number;
}

export interface CreateDeudaDto {
    nombre: string;
    tipo: string;
    montoOriginal: number;
    saldoActual: number;
    tasaInteres: number;
    pagoMinimo: number | null;
    diaDePago: number | null;
    fechaInicio: string;
    fechaVencimiento: string | null;
    cuentaId: number | null;
    notas: string | null;
}

export interface UpdateDeudaDto {
    id: number;
    nombre: string;
    tipo: string;
    tasaInteres: number;
    pagoMinimo: number | null;
    diaDePago: number | null;
    fechaVencimiento: string | null;
    cuentaId: number | null;
    activa: boolean;
    notas: string | null;
}

export interface PagoDeuda {
    id: number;
    deudaId: number;
    monto: number;
    montoInteres: number | null;
    montoCapital: number | null;
    fecha: string;
    descripcion: string | null;
}

export interface CreatePagoDeudaDto {
    monto: number;
    fecha: string;
    descripcion: string | null;
}

export interface ProyeccionPago {
    mes: number;
    fechaPago: string;
    pagoMensual: number;
    interesDelMes: number;
    capitalDelMes: number;
    saldoRestante: number;
}

export const deudasService = {
    async getAll(): Promise<Deuda[]> {
        const response = await apiClient.get('/Deudas');
        return response.data;
    },

    async getById(id: number): Promise<Deuda> {
        const response = await apiClient.get(`/Deudas/${id}`);
        return response.data;
    },

    async create(data: CreateDeudaDto): Promise<Deuda> {
        const response = await apiClient.post('/Deudas', data);
        return response.data;
    },

    async update(id: number, data: UpdateDeudaDto): Promise<void> {
        await apiClient.put(`/Deudas/${id}`, data);
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/Deudas/${id}`);
    },

    async registrarPago(deudaId: number, data: CreatePagoDeudaDto): Promise<PagoDeuda> {
        const response = await apiClient.post(`/Deudas/${deudaId}/pagos`, data);
        return response.data;
    },

    async getPagos(deudaId: number): Promise<PagoDeuda[]> {
        const response = await apiClient.get(`/Deudas/${deudaId}/pagos`);
        return response.data;
    },

    async getProyeccion(deudaId: number, pagoMensual?: number): Promise<ProyeccionPago[]> {
        const params = pagoMensual ? { pagoMensual } : {};
        const response = await apiClient.get(`/Deudas/${deudaId}/proyeccion`, { params });
        return response.data;
    },
};
