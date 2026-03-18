import apiClient from './api';

export interface CsvPreviewResponse {
    primerasFilas: string[][];
    totalFilas: number;
    columnas: string[];
}

export interface CsvColumnMapping {
    columnaFecha: number;
    columnaMonto: number;
    columnaDescripcion: number | null;
    formatoFecha: string;
    montoNegativoEsGasto: boolean;
}

export interface CsvImportRequest {
    cuentaId: number;
    mapeo: CsvColumnMapping;
    categoriaIdDefault: number | null;
    primeraFilaEsEncabezado: boolean;
}

export interface CsvPreviewRow {
    fila: number;
    fecha: string | null;
    monto: number | null;
    descripcion: string | null;
    tipoDetectado: string | null;
    esDuplicado: boolean;
    categoriaIdSugerida: number | null;
    categoriaNombreSugerida: string | null;
    error: string | null;
}

export interface CsvImportError {
    fila: number;
    mensaje: string;
}

export interface CsvImportResult {
    importacionId: number;
    totalFilas: number;
    filasImportadas: number;
    filasDuplicadas: number;
    filasError: number;
    errores: CsvImportError[];
}

export const importacionCsvService = {
    async preview(file: File): Promise<CsvPreviewResponse> {
        const formData = new FormData();
        formData.append('archivo', file);
        const response = await apiClient.post('/importacion/preview', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    async validate(file: File, request: CsvImportRequest): Promise<CsvPreviewRow[]> {
        const formData = new FormData();
        formData.append('archivo', file);
        formData.append('request', JSON.stringify(request));
        const response = await apiClient.post('/importacion/validate', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    async ejecutar(file: File, request: CsvImportRequest): Promise<CsvImportResult> {
        const formData = new FormData();
        formData.append('archivo', file);
        formData.append('request', JSON.stringify(request));
        const response = await apiClient.post('/importacion/ejecutar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
};
