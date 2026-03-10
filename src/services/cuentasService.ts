import apiClient from './api';

export interface CuentaDto {
  id: number;
  nombre: string;
  tipo: string;
  balanceActual: number;
  balanceInicial: number;
  moneda: string;
  color?: string;
  icono?: string;
  activa: boolean;
  fechaCreacion: string;
}

export interface CuentaCreateDto {
  nombre: string;
  tipo: string;
  balanceInicial: number;
  moneda?: string;
  color?: string;
  icono?: string;
}

export interface CuentaUpdateDto {
  nombre: string;
  balanceActual: number;
  color?: string;
  icono?: string;
  activa: boolean;
}

class CuentasService {
  async getCuentas(): Promise<CuentaDto[]> {
    const response = await apiClient.get<CuentaDto[]>('/Cuentas');
    return response.data;
  }

  async getCuenta(id: number): Promise<CuentaDto> {
    const response = await apiClient.get<CuentaDto>(`/Cuentas/${id}`);
    return response.data;
  }

  async createCuenta(data: CuentaCreateDto): Promise<CuentaDto> {
    const response = await apiClient.post<CuentaDto>('/Cuentas', data);
    return response.data;
  }

  async updateCuenta(id: number, data: CuentaUpdateDto): Promise<void> {
    await apiClient.put(`/Cuentas/${id}`, data);
  }

  async deleteCuenta(id: number): Promise<void> {
    await apiClient.delete(`/Cuentas/${id}`);
  }

  async getBalanceTotal(): Promise<number> {
    const response = await apiClient.get<number>('/Cuentas/balance-total');
    return response.data;
  }
}

export default new CuentasService();
