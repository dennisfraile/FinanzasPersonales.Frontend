import apiClient from './api';

// Interfaces
export interface PeriodoDto {
    inicio: string;
    fin: string;
}

export interface DatoMensualDto {
    mes: number;
    ano: number;
    periodo: string;
    totalIngresos: number;
    totalGastos: number;
    balance: number;
}

export interface TendenciasMensualesDto {
    periodo: PeriodoDto;
    datos: DatoMensualDto[];
}

export interface ResumenMesDto {
    mes: number;
    ano: number;
    totalIngresos: number;
    totalGastos: number;
    balance: number;
}

export interface CambiosDto {
    ingresosPorcentaje: number;
    gastosPorcentaje: number;
    balancePorcentaje: number;
}

export interface ComparativaCategoriaDto {
    categoriaId: number;
    nombre: string;
    mesActual: number;
    mesAnterior: number;
    cambio: number;
}

export interface ComparativaMesDto {
    mesActual: ResumenMesDto;
    mesAnterior: ResumenMesDto;
    cambios: CambiosDto;
    categorias: ComparativaCategoriaDto[];
}

export interface CategoriaGastoDto {
    categoriaId: number;
    nombre: string;
    total: number;
    porcentaje: number;
    cantidadTransacciones: number;
}

export interface TopCategoriasDto {
    mes: number;
    ano: number;
    totalGastos: number;
    categorias: CategoriaGastoDto[];
}

export interface GastosPorTipoDetalleDto {
    total: number;
    porcentaje: number;
    promedio: number;
}

export interface GastosTipoDto {
    mes: number;
    ano: number;
    gastosFijos: GastosPorTipoDetalleDto;
    gastosVariables: GastosPorTipoDetalleDto;
    totalGastos: number;
}

export interface MesActualDto {
    mes: number;
    ano: number;
    gastosActuales: number;
    diasTranscurridos: number;
    diasTotales: number;
}

export interface ProyeccionDetalleDto {
    gastoEstimado: number;
    promedioUltimos3Meses: number;
    diferencia: number;
    porcentajeIncremento: number;
    alerta: boolean;
    mensaje: string;
}

export interface ProyeccionGastosDto {
    mesActual: MesActualDto;
    proyeccion: ProyeccionDetalleDto;
}

// Service
export const reportesService = {
    /**
     * Obtiene tendencias mensuales de ingresos y gastos
     */
    async getTendencias(meses: number = 6): Promise<TendenciasMensualesDto> {
        const response = await apiClient.get(`/Reportes/tendencias?meses=${meses}`);
        return response.data;
    },

    /**
     * Obtiene comparativa entre mes actual y anterior
     */
    async getComparativa(mes?: number, ano?: number): Promise<ComparativaMesDto> {
        const params = new URLSearchParams();
        if (mes) params.append('mes', mes.toString());
        if (ano) params.append('ano', ano.toString());

        const response = await apiClient.get(`/Reportes/comparativa?${params.toString()}`);
        return response.data;
    },

    /**
     * Obtiene las top categorías con más gastos
     */
    async getTopCategorias(mes?: number, ano?: number, limite: number = 5): Promise<TopCategoriasDto> {
        const params = new URLSearchParams();
        if (mes) params.append('mes', mes.toString());
        if (ano) params.append('ano', ano.toString());
        params.append('limite', limite.toString());

        const response = await apiClient.get(`/Reportes/top-categorias?${params.toString()}`);
        return response.data;
    },

    /**
     * Obtiene análisis de gastos fijos vs variables
     */
    async getGastosTipo(mes?: number, ano?: number): Promise<GastosTipoDto> {
        const params = new URLSearchParams();
        if (mes) params.append('mes', mes.toString());
        if (ano) params.append('ano', ano.toString());

        const response = await apiClient.get(`/Reportes/gastos-tipo?${params.toString()}`);
        return response.data;
    },

    /**
     * Obtiene proyección de gastos del mes actual
     */
    async getProyeccion(): Promise<ProyeccionGastosDto> {
        const response = await apiClient.get('/Reportes/proyeccion');
        return response.data;
    }
};
