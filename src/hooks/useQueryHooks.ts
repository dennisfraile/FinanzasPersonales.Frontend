import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gastosService, type CreateGastoDto, type TransferirSaldoGastoDto } from '../services/gastosService';
import { ingresosService, type CreateIngresoDto } from '../services/ingresosService';
import { metasService, type CreateMetaDto } from '../services/metasService';
import { presupuestosService, type CreatePresupuestoDto } from '../services/presupuestosService';
import { categoriasService, type CreateCategoriaDto } from '../services/categoriasService';
import { tagsService, type CreateTagDto } from '../services/tagsService';
import { dashboardService } from '../services/dashboardService';
import { reportesService } from '../services/reportesService';
import gastosRecurrentesService from '../services/gastosRecurrentesService';
import type { CreateGastoRecurrenteDto, UpdateGastoRecurrenteDto } from '../services/gastosRecurrentesService';
import ingresosRecurrentesService from '../services/ingresosRecurrentesService';
import type { CreateIngresoRecurrenteDto, UpdateIngresoRecurrenteDto } from '../services/ingresosRecurrentesService';
import cuentasService from '../services/cuentasService';
import type { CuentaCreateDto, CuentaUpdateDto } from '../services/cuentasService';
import transferenciasService from '../services/transferenciasService';
import type { TransferenciaCreateDto } from '../services/transferenciasService';
import { notificacionesService } from '../services/notificacionesService';
import { cuentaDashboardService, type AsignarSurplusDto } from '../services/cuentaDashboardService';
import { detallesGastoService, type CreateDetalleGastoDto } from '../services/detallesGastoService';
import { deudasService, type CreateDeudaDto, type UpdateDeudaDto, type CreatePagoDeudaDto } from '../services/deudasService';
import { gastosCompartidosService, type CreateGastoCompartidoDto } from '../services/gastosCompartidosService';
import { plantillasGastoService, type CreatePlantillaGastoDto, type UpdatePlantillaGastoDto, type UsarPlantillaDto } from '../services/plantillasGastoService';
import { reglasCategoriaService, type CreateReglaCategoriaDto, type UpdateReglaCategoriaDto } from '../services/reglasCategoriaService';

// ============ QUERY KEYS ============
export const queryKeys = {
    gastos: ['gastos'] as const,
    ingresos: ['ingresos'] as const,
    metas: ['metas'] as const,
    presupuestos: ['presupuestos'] as const,
    categorias: ['categorias'] as const,
    tags: ['tags'] as const,
    dashboard: ['dashboard'] as const,
    reportes: {
        tendencias: (meses: number) => ['reportes', 'tendencias', meses] as const,
        comparativa: (mes?: number, ano?: number) => ['reportes', 'comparativa', mes, ano] as const,
        topCategorias: (mes?: number, ano?: number, limite?: number) => ['reportes', 'topCategorias', mes, ano, limite] as const,
        gastosTipo: (mes?: number, ano?: number) => ['reportes', 'gastosTipo', mes, ano] as const,
        proyeccion: ['reportes', 'proyeccion'] as const,
    },
    gastosRecurrentes: ['gastosRecurrentes'] as const,
    ingresosRecurrentes: ['ingresosRecurrentes'] as const,
    cuentas: ['cuentas'] as const,
    balanceTotal: ['balanceTotal'] as const,
    transferencias: ['transferencias'] as const,
    notificaciones: ['notificaciones'] as const,
    notificacionesNoLeidas: ['notificaciones', 'noLeidas'] as const,
    cuentaDashboard: (cuentaId: number) => ['cuentaDashboard', cuentaId] as const,
    presupuestoDashboard: (periodo: string) => ['presupuestoDashboard', periodo] as const,
    gastoConDetalles: (gastoId: number) => ['gastoConDetalles', gastoId] as const,
    deudas: ['deudas'] as const,
    deudaPagos: (deudaId: number) => ['deudaPagos', deudaId] as const,
    deudaProyeccion: (deudaId: number, pagoMensual?: number) => ['deudaProyeccion', deudaId, pagoMensual] as const,
    gastosCompartidos: ['gastosCompartidos'] as const,
    resumenSplit: ['resumenSplit'] as const,
    plantillas: ['plantillas'] as const,
    reglasCategoria: ['reglasCategoria'] as const,
};

// ============ DASHBOARD ============
export function useDashboardMetrics() {
    return useQuery({
        queryKey: queryKeys.dashboard,
        queryFn: () => dashboardService.getMetrics(),
    });
}

// ============ GASTOS ============
export function useGastos() {
    return useQuery({
        queryKey: queryKeys.gastos,
        queryFn: () => gastosService.getAll(),
    });
}

export function useCreateGasto() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateGastoDto) => gastosService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.gastos });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
            queryClient.invalidateQueries({ queryKey: queryKeys.cuentas });
            queryClient.invalidateQueries({ queryKey: queryKeys.balanceTotal });
            queryClient.invalidateQueries({ queryKey: ['cuentaDashboard'] });
        },
    });
}

export function useUpdateGasto() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CreateGastoDto }) => gastosService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.gastos });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
            queryClient.invalidateQueries({ queryKey: queryKeys.cuentas });
            queryClient.invalidateQueries({ queryKey: queryKeys.balanceTotal });
            queryClient.invalidateQueries({ queryKey: ['cuentaDashboard'] });
        },
    });
}

export function useDeleteGasto() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => gastosService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.gastos });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
            queryClient.invalidateQueries({ queryKey: queryKeys.cuentas });
            queryClient.invalidateQueries({ queryKey: queryKeys.balanceTotal });
            queryClient.invalidateQueries({ queryKey: ['cuentaDashboard'] });
        },
    });
}

export function useTransferirSaldoGasto() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: TransferirSaldoGastoDto) => gastosService.transferirSaldo(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.gastos });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
            queryClient.invalidateQueries({ queryKey: ['gastoConDetalles'] });
        },
    });
}

// ============ INGRESOS ============
export function useIngresos() {
    return useQuery({
        queryKey: queryKeys.ingresos,
        queryFn: () => ingresosService.getAll(),
    });
}

export function useCreateIngreso() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateIngresoDto) => ingresosService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.ingresos });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
            queryClient.invalidateQueries({ queryKey: queryKeys.cuentas });
            queryClient.invalidateQueries({ queryKey: queryKeys.balanceTotal });
            queryClient.invalidateQueries({ queryKey: ['cuentaDashboard'] });
        },
    });
}

export function useUpdateIngreso() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CreateIngresoDto }) => ingresosService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.ingresos });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
            queryClient.invalidateQueries({ queryKey: queryKeys.cuentas });
            queryClient.invalidateQueries({ queryKey: queryKeys.balanceTotal });
            queryClient.invalidateQueries({ queryKey: ['cuentaDashboard'] });
        },
    });
}

export function useDeleteIngreso() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => ingresosService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.ingresos });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
            queryClient.invalidateQueries({ queryKey: queryKeys.cuentas });
            queryClient.invalidateQueries({ queryKey: queryKeys.balanceTotal });
            queryClient.invalidateQueries({ queryKey: ['cuentaDashboard'] });
        },
    });
}

// ============ METAS ============
export function useMetas() {
    return useQuery({
        queryKey: queryKeys.metas,
        queryFn: () => metasService.getAll(),
    });
}

export function useCreateMeta() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateMetaDto) => metasService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.metas });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
        },
    });
}

export function useUpdateMeta() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CreateMetaDto }) => metasService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.metas });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
        },
    });
}

export function useDeleteMeta() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => metasService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.metas });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
        },
    });
}

export function useAbonarMeta() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, monto }: { id: number; monto: number }) => metasService.abonar(id, monto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.metas });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
            queryClient.invalidateQueries({ queryKey: queryKeys.cuentas });
            queryClient.invalidateQueries({ queryKey: queryKeys.balanceTotal });
        },
    });
}

// ============ PRESUPUESTOS ============
export function usePresupuestos() {
    return useQuery({
        queryKey: queryKeys.presupuestos,
        queryFn: () => presupuestosService.getAll(),
    });
}

export function useCreatePresupuesto() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreatePresupuestoDto) => presupuestosService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.presupuestos });
        },
    });
}

export function useUpdatePresupuesto() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CreatePresupuestoDto }) => presupuestosService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.presupuestos });
        },
    });
}

export function useDeletePresupuesto() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => presupuestosService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.presupuestos });
        },
    });
}

// ============ CATEGORIAS ============
export function useCategorias() {
    return useQuery({
        queryKey: queryKeys.categorias,
        queryFn: () => categoriasService.getAll(),
    });
}

export function useCreateCategoria() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateCategoriaDto) => categoriasService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categorias });
        },
    });
}

export function useUpdateCategoria() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CreateCategoriaDto }) => categoriasService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categorias });
        },
    });
}

export function useDeleteCategoria() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => categoriasService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categorias });
        },
    });
}

// ============ TAGS ============
export function useTags() {
    return useQuery({
        queryKey: queryKeys.tags,
        queryFn: () => tagsService.getAll(),
    });
}

export function useCreateTag() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateTagDto) => tagsService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tags });
        },
    });
}

export function useUpdateTag() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CreateTagDto }) => tagsService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tags });
        },
    });
}

export function useDeleteTag() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => tagsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tags });
        },
    });
}

// ============ REPORTES ============
export function useTendencias(meses: number = 6) {
    return useQuery({
        queryKey: queryKeys.reportes.tendencias(meses),
        queryFn: () => reportesService.getTendencias(meses),
    });
}

export function useComparativa(mes?: number, ano?: number) {
    return useQuery({
        queryKey: queryKeys.reportes.comparativa(mes, ano),
        queryFn: () => reportesService.getComparativa(mes, ano),
    });
}

export function useTopCategorias(mes?: number, ano?: number, limite: number = 5) {
    return useQuery({
        queryKey: queryKeys.reportes.topCategorias(mes, ano, limite),
        queryFn: () => reportesService.getTopCategorias(mes, ano, limite),
    });
}

export function useGastosTipo(mes?: number, ano?: number) {
    return useQuery({
        queryKey: queryKeys.reportes.gastosTipo(mes, ano),
        queryFn: () => reportesService.getGastosTipo(mes, ano),
    });
}

export function useProyeccion() {
    return useQuery({
        queryKey: queryKeys.reportes.proyeccion,
        queryFn: () => reportesService.getProyeccion(),
    });
}

// ============ GASTOS RECURRENTES ============
export function useGastosRecurrentes() {
    return useQuery({
        queryKey: queryKeys.gastosRecurrentes,
        queryFn: () => gastosRecurrentesService.getAll(),
    });
}

export function useCreateGastoRecurrente() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateGastoRecurrenteDto) => gastosRecurrentesService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.gastosRecurrentes });
        },
    });
}

export function useUpdateGastoRecurrente() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateGastoRecurrenteDto }) => gastosRecurrentesService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.gastosRecurrentes });
        },
    });
}

export function useDeleteGastoRecurrente() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => gastosRecurrentesService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.gastosRecurrentes });
        },
    });
}

export function useGenerarGastoRecurrente() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => gastosRecurrentesService.generar(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.gastosRecurrentes });
            queryClient.invalidateQueries({ queryKey: queryKeys.gastos });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
            queryClient.invalidateQueries({ queryKey: queryKeys.cuentas });
            queryClient.invalidateQueries({ queryKey: queryKeys.balanceTotal });
        },
    });
}

export function useGenerarPendientes() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => gastosRecurrentesService.generarPendientes(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.gastosRecurrentes });
            queryClient.invalidateQueries({ queryKey: queryKeys.gastos });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
            queryClient.invalidateQueries({ queryKey: queryKeys.cuentas });
            queryClient.invalidateQueries({ queryKey: queryKeys.balanceTotal });
        },
    });
}

// ============ INGRESOS RECURRENTES ============
export function useIngresosRecurrentes() {
    return useQuery({
        queryKey: queryKeys.ingresosRecurrentes,
        queryFn: () => ingresosRecurrentesService.getAll(),
    });
}

export function useCreateIngresoRecurrente() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateIngresoRecurrenteDto) => ingresosRecurrentesService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.ingresosRecurrentes });
        },
    });
}

export function useUpdateIngresoRecurrente() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateIngresoRecurrenteDto }) => ingresosRecurrentesService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.ingresosRecurrentes });
        },
    });
}

export function useDeleteIngresoRecurrente() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => ingresosRecurrentesService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.ingresosRecurrentes });
        },
    });
}

export function useGenerarIngresoRecurrente() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => ingresosRecurrentesService.generar(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.ingresosRecurrentes });
            queryClient.invalidateQueries({ queryKey: queryKeys.ingresos });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
            queryClient.invalidateQueries({ queryKey: queryKeys.cuentas });
            queryClient.invalidateQueries({ queryKey: queryKeys.balanceTotal });
        },
    });
}

export function useGenerarPendientesIngresos() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => ingresosRecurrentesService.generarPendientes(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.ingresosRecurrentes });
            queryClient.invalidateQueries({ queryKey: queryKeys.ingresos });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
            queryClient.invalidateQueries({ queryKey: queryKeys.cuentas });
            queryClient.invalidateQueries({ queryKey: queryKeys.balanceTotal });
        },
    });
}

// ============ CUENTAS ============
export function useQueryCuentas() {
    return useQuery({
        queryKey: queryKeys.cuentas,
        queryFn: () => cuentasService.getCuentas(),
    });
}

export function useBalanceTotal() {
    return useQuery({
        queryKey: queryKeys.balanceTotal,
        queryFn: () => cuentasService.getBalanceTotal(),
    });
}

export function useCreateCuenta() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CuentaCreateDto) => cuentasService.createCuenta(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cuentas });
            queryClient.invalidateQueries({ queryKey: queryKeys.balanceTotal });
        },
    });
}

export function useUpdateCuenta() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CuentaUpdateDto }) => cuentasService.updateCuenta(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cuentas });
            queryClient.invalidateQueries({ queryKey: queryKeys.balanceTotal });
        },
    });
}

export function useDeleteCuenta() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => cuentasService.deleteCuenta(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cuentas });
            queryClient.invalidateQueries({ queryKey: queryKeys.balanceTotal });
        },
    });
}

// ============ TRANSFERENCIAS ============
export function useTransferencias() {
    return useQuery({
        queryKey: queryKeys.transferencias,
        queryFn: () => transferenciasService.getTransferencias(),
    });
}

export function useCreateTransferencia() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: TransferenciaCreateDto) => transferenciasService.createTransferencia(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.transferencias });
            queryClient.invalidateQueries({ queryKey: queryKeys.cuentas });
            queryClient.invalidateQueries({ queryKey: queryKeys.balanceTotal });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
        },
    });
}

// ============ NOTIFICACIONES ============
export function useQueryNotificaciones(soloNoLeidas: boolean = false) {
    return useQuery({
        queryKey: [...queryKeys.notificaciones, soloNoLeidas],
        queryFn: () => notificacionesService.getNotificaciones(soloNoLeidas),
        refetchInterval: 30000,
        refetchIntervalInBackground: false, // No polling cuando la pestaña está inactiva
    });
}

export function useNotificacionesNoLeidas() {
    return useQuery({
        queryKey: queryKeys.notificacionesNoLeidas,
        queryFn: () => notificacionesService.getNoLeidas(),
        refetchInterval: 30000,
        refetchIntervalInBackground: false, // No polling cuando la pestaña está inactiva
    });
}

export function useMarcarNotificacionLeida() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => notificacionesService.marcarLeida(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notificaciones });
            queryClient.invalidateQueries({ queryKey: queryKeys.notificacionesNoLeidas });
        },
    });
}

// ============ CUENTA DASHBOARD ============
export function useCuentaDashboard(cuentaId: number | null, page = 1, pageSize = 50) {
    return useQuery({
        queryKey: [...queryKeys.cuentaDashboard(cuentaId!), page, pageSize],
        queryFn: () => cuentaDashboardService.getDashboard(cuentaId!, page, pageSize),
        enabled: !!cuentaId,
    });
}

export function useAsignarSurplus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: AsignarSurplusDto) => cuentaDashboardService.asignarSurplus(data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cuentaDashboard(variables.cuentaId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.cuentas });
            queryClient.invalidateQueries({ queryKey: queryKeys.balanceTotal });
            queryClient.invalidateQueries({ queryKey: queryKeys.metas });
        },
    });
}

// ============ PRESUPUESTO DASHBOARD ============
export function usePresupuestoDashboard(periodo: string) {
    return useQuery({
        queryKey: queryKeys.presupuestoDashboard(periodo),
        queryFn: () => presupuestosService.getDashboard(periodo),
    });
}

// ============ DETALLES DE GASTO (SUB-COMPRAS) ============
export function useGastoConDetalles(gastoId: number | null) {
    return useQuery({
        queryKey: queryKeys.gastoConDetalles(gastoId!),
        queryFn: () => detallesGastoService.getGastoConDetalles(gastoId!),
        enabled: !!gastoId,
    });
}

export function useCreateDetalleGasto() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ gastoId, data }: { gastoId: number; data: CreateDetalleGastoDto }) =>
            detallesGastoService.create(gastoId, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.gastoConDetalles(variables.gastoId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.gastos });
        },
    });
}

export function useUpdateDetalleGasto() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ gastoId, detalleId, data }: { gastoId: number; detalleId: number; data: CreateDetalleGastoDto }) =>
            detallesGastoService.update(gastoId, detalleId, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.gastoConDetalles(variables.gastoId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.gastos });
        },
    });
}

export function useDeleteDetalleGasto() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ gastoId, detalleId }: { gastoId: number; detalleId: number }) =>
            detallesGastoService.delete(gastoId, detalleId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.gastoConDetalles(variables.gastoId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.gastos });
        },
    });
}

// ============ DEUDAS ============
export function useDeudas() {
    return useQuery({
        queryKey: queryKeys.deudas,
        queryFn: () => deudasService.getAll(),
    });
}

export function useCreateDeuda() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateDeudaDto) => deudasService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.deudas });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
        },
    });
}

export function useUpdateDeuda() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateDeudaDto }) => deudasService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.deudas });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
        },
    });
}

export function useDeleteDeuda() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deudasService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.deudas });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
        },
    });
}

export function useRegistrarPagoDeuda() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ deudaId, data }: { deudaId: number; data: CreatePagoDeudaDto }) =>
            deudasService.registrarPago(deudaId, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.deudas });
            queryClient.invalidateQueries({ queryKey: queryKeys.deudaPagos(variables.deudaId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.cuentas });
            queryClient.invalidateQueries({ queryKey: queryKeys.balanceTotal });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
        },
    });
}

export function useDeudaPagos(deudaId: number | null) {
    return useQuery({
        queryKey: queryKeys.deudaPagos(deudaId!),
        queryFn: () => deudasService.getPagos(deudaId!),
        enabled: !!deudaId,
    });
}

export function useDeudaProyeccion(deudaId: number | null, pagoMensual?: number) {
    return useQuery({
        queryKey: queryKeys.deudaProyeccion(deudaId!, pagoMensual),
        queryFn: () => deudasService.getProyeccion(deudaId!, pagoMensual),
        enabled: !!deudaId,
    });
}

// ============ GASTOS COMPARTIDOS ============
export function useGastosCompartidos() {
    return useQuery({
        queryKey: queryKeys.gastosCompartidos,
        queryFn: () => gastosCompartidosService.getAll(),
    });
}

export function useResumenSplit() {
    return useQuery({
        queryKey: queryKeys.resumenSplit,
        queryFn: () => gastosCompartidosService.getResumen(),
    });
}

export function useCreateGastoCompartido() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateGastoCompartidoDto) => gastosCompartidosService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.gastosCompartidos });
            queryClient.invalidateQueries({ queryKey: queryKeys.resumenSplit });
        },
    });
}

export function useDeleteGastoCompartido() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => gastosCompartidosService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.gastosCompartidos });
            queryClient.invalidateQueries({ queryKey: queryKeys.resumenSplit });
        },
    });
}

export function useLiquidarParticipante() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ gastoId, participanteId, monto }: { gastoId: number; participanteId: number; monto: number }) =>
            gastosCompartidosService.liquidarParticipante(gastoId, participanteId, monto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.gastosCompartidos });
            queryClient.invalidateQueries({ queryKey: queryKeys.resumenSplit });
        },
    });
}

// ============ PLANTILLAS DE GASTO ============
export function usePlantillas() {
    return useQuery({
        queryKey: queryKeys.plantillas,
        queryFn: () => plantillasGastoService.getAll(),
    });
}

export function useCreatePlantilla() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreatePlantillaGastoDto) => plantillasGastoService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.plantillas });
        },
    });
}

export function useUpdatePlantilla() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdatePlantillaGastoDto }) => plantillasGastoService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.plantillas });
        },
    });
}

export function useDeletePlantilla() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => plantillasGastoService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.plantillas });
        },
    });
}

export function useUsarPlantilla() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UsarPlantillaDto }) => plantillasGastoService.usar(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.plantillas });
            queryClient.invalidateQueries({ queryKey: queryKeys.gastos });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
            queryClient.invalidateQueries({ queryKey: queryKeys.cuentas });
            queryClient.invalidateQueries({ queryKey: queryKeys.balanceTotal });
        },
    });
}

// ============ REGLAS DE CATEGORIZACIÓN ============
export function useReglasCategoria() {
    return useQuery({
        queryKey: queryKeys.reglasCategoria,
        queryFn: () => reglasCategoriaService.getAll(),
    });
}

export function useCreateReglaCategoria() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateReglaCategoriaDto) => reglasCategoriaService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.reglasCategoria });
        },
    });
}

export function useUpdateReglaCategoria() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateReglaCategoriaDto }) => reglasCategoriaService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.reglasCategoria });
        },
    });
}

export function useDeleteReglaCategoria() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => reglasCategoriaService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.reglasCategoria });
        },
    });
}
