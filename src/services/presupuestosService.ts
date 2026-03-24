import apiClient from './api';

export interface Presupuesto {
    id: number;
    categoriaId: number;
    categoriaNombre: string;
    montoLimite: number;
    periodo: string;
    mesAplicable: number;
    anoAplicable: number;
    semanaAplicable?: number;
    gastadoActual: number;
    disponible: number;
    porcentajeUtilizado: number;
    fechaInicio: string;
    fechaFin: string;
    comprometido: number;
    totalProyectado: number;
    porcentajeProyectado: number;
    transferencias: TransferenciaGastoResumen[];
    permiteRollover: boolean;
    rollover: number;
    limiteEfectivo: number;
}

export interface TransferenciaGastoResumen {
    id: number;
    monto: number;
    categoriaOrigenNombre: string;
    categoriaDestinoNombre: string;
    direccion: 'entrada' | 'salida';
    fecha: string;
}

export interface CreatePresupuestoDto {
    categoriaId: number;
    montoLimite: number;
    periodo: string;
    mesAplicable: number;
    anoAplicable: number;
    semanaAplicable?: number;
    permiteRollover?: boolean;
}

export interface PresupuestoComparacion {
    presupuestoId: number;
    categoriaId: number;
    categoriaNombre: string;
    montoLimite: number;
    gastadoActual: number;
    disponible: number;
    porcentajeUtilizado: number;
}

export interface PresupuestoDashboard {
    periodo: string;
    periodoLabel: string;
    fechaInicio: string;
    fechaFin: string;
    totalPresupuestado: number;
    totalGastado: number;
    totalDisponible: number;
    comparaciones: PresupuestoComparacion[];
}

export const presupuestosService = {
    async getAll(): Promise<Presupuesto[]> {
        const response = await apiClient.get('/Presupuestos');
        return response.data;
    },

    async create(presupuesto: CreatePresupuestoDto): Promise<Presupuesto> {
        const response = await apiClient.post('/Presupuestos', presupuesto);
        return response.data;
    },

    async update(id: number, presupuesto: CreatePresupuestoDto): Promise<void> {
        await apiClient.put(`/Presupuestos/${id}`, { id, ...presupuesto });
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/Presupuestos/${id}`);
    },

    async getDashboard(periodo: string): Promise<PresupuestoDashboard> {
        const response = await apiClient.get('/Presupuestos/dashboard', { params: { periodo } });
        return response.data;
    },
};
