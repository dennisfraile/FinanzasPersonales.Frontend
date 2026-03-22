import { useState } from 'react';
import { type CsvPreviewResponse, type CsvImportRequest, type CsvPreviewRow, type CsvImportResult, importacionCsvService } from '../services/importacionCsvService';
import { Upload, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import HelpTooltip from '../components/HelpTooltip';
import { sectionHelp } from '../utils/helpContent';
import { CuentaSelector } from '../components/CuentaSelector';
import { useCategorias } from '../hooks/useQueryHooks';
import { useQueryClient } from '@tanstack/react-query';

type Step = 'upload' | 'mapping' | 'preview' | 'result';

export const ImportacionCsvPage = () => {
    const { data: categorias = [] } = useCategorias();
    const queryClient = useQueryClient();

    const [step, setStep] = useState<Step>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<CsvPreviewResponse | null>(null);
    const [validationRows, setValidationRows] = useState<CsvPreviewRow[]>([]);
    const [importResult, setImportResult] = useState<CsvImportResult | null>(null);
    const [loading, setLoading] = useState(false);

    const [mapping, setMapping] = useState<CsvImportRequest>({
        cuentaId: 0,
        mapeo: {
            columnaFecha: 0,
            columnaMonto: 1,
            columnaDescripcion: 2,
            formatoFecha: 'yyyy-MM-dd',
            montoNegativoEsGasto: true,
        },
        categoriaIdDefault: null,
        primeraFilaEsEncabezado: true,
    });

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        if (!selectedFile.name.endsWith('.csv')) {
            toast.error('Solo se permiten archivos .csv');
            return;
        }
        setFile(selectedFile);
        setLoading(true);
        try {
            const data = await importacionCsvService.preview(selectedFile);
            setPreview(data);
            setStep('mapping');
            if (data.columnas.length > 0) {
                setMapping(prev => ({
                    ...prev,
                    mapeo: {
                        ...prev.mapeo,
                        columnaDescripcion: data.columnas.length > 2 ? 2 : null,
                    },
                }));
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al leer el archivo CSV');
        } finally {
            setLoading(false);
        }
    };

    const handleValidate = async () => {
        if (!file || !mapping.cuentaId) {
            toast.error('Selecciona una cuenta destino');
            return;
        }
        setLoading(true);
        try {
            const rows = await importacionCsvService.validate(file, mapping);
            setValidationRows(rows);
            setStep('preview');
        } catch (error: any) {
            console.error('Error:', error);
            toast.error(error?.response?.data || 'Error al validar');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const result = await importacionCsvService.ejecutar(file, mapping);
            setImportResult(result);
            setStep('result');
            queryClient.invalidateQueries({ queryKey: ['gastos'] });
            queryClient.invalidateQueries({ queryKey: ['ingresos'] });
            queryClient.invalidateQueries({ queryKey: ['cuentas'] });
            queryClient.invalidateQueries({ queryKey: ['balanceTotal'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            toast.success(`${result.filasImportadas} transacciones importadas`);
        } catch (error: any) {
            console.error('Error:', error);
            toast.error(error?.response?.data || 'Error al importar');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setStep('upload');
        setFile(null);
        setPreview(null);
        setValidationRows([]);
        setImportResult(null);
    };

    const gastoCategorias = categorias.filter((c: any) => c.tipo === 'Gasto');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-5xl mx-auto px-4 py-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">Importar CSV <HelpTooltip content={sectionHelp.importacionCsv} /></h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Importa transacciones desde un archivo CSV de tu banco</p>

                {/* Steps indicator */}
                <div className="flex items-center gap-2 mb-8">
                    {(['upload', 'mapping', 'preview', 'result'] as Step[]).map((s, i) => {
                        const labels = ['Subir', 'Mapear', 'Previsualizar', 'Resultado'];
                        const active = s === step;
                        const done = ['upload', 'mapping', 'preview', 'result'].indexOf(step) > i;
                        return (
                            <div key={s} className="flex items-center gap-2">
                                {i > 0 && <div className={`w-8 h-0.5 ${done ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />}
                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${active ? 'bg-blue-600 text-white' : done ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                    {done && <CheckCircle2 size={12} />}
                                    {labels[i]}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Step 1: Upload */}
                {step === 'upload' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
                        <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Selecciona un archivo CSV</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">Archivo .csv de hasta 5MB con tus transacciones bancarias</p>
                        <label className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 cursor-pointer">
                            <input type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
                            {loading ? 'Leyendo archivo...' : 'Seleccionar archivo'}
                        </label>
                    </div>
                )}

                {/* Step 2: Mapping */}
                {step === 'mapping' && preview && (
                    <div className="space-y-6">
                        {/* Preview table */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                            <h3 className="font-semibold dark:text-white mb-3">Vista previa del archivo ({preview.totalFilas} filas)</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr>
                                            {preview.columnas.map((col, i) => (
                                                <th key={i} className="text-left py-2 px-3 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs">
                                                    Col {i}: {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                        {preview.primerasFilas.slice(0, 5).map((row, i) => (
                                            <tr key={i}>
                                                {row.map((cell, j) => (
                                                    <td key={j} className="py-2 px-3 dark:text-gray-300 text-xs truncate max-w-[150px]">{cell}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mapping config */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <h3 className="font-semibold dark:text-white mb-4">Configuración de mapeo</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Columna de Fecha</label>
                                    <select value={mapping.mapeo.columnaFecha} onChange={(e) => setMapping({ ...mapping, mapeo: { ...mapping.mapeo, columnaFecha: Number(e.target.value) } })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                        {preview.columnas.map((col, i) => <option key={i} value={i}>Col {i}: {col}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Columna de Monto</label>
                                    <select value={mapping.mapeo.columnaMonto} onChange={(e) => setMapping({ ...mapping, mapeo: { ...mapping.mapeo, columnaMonto: Number(e.target.value) } })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                        {preview.columnas.map((col, i) => <option key={i} value={i}>Col {i}: {col}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Columna de Descripción</label>
                                    <select value={mapping.mapeo.columnaDescripcion ?? ''} onChange={(e) => setMapping({ ...mapping, mapeo: { ...mapping.mapeo, columnaDescripcion: e.target.value !== '' ? Number(e.target.value) : null } })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                        <option value="">Ninguna</option>
                                        {preview.columnas.map((col, i) => <option key={i} value={i}>Col {i}: {col}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Formato de Fecha</label>
                                    <select value={mapping.mapeo.formatoFecha} onChange={(e) => setMapping({ ...mapping, mapeo: { ...mapping.mapeo, formatoFecha: e.target.value } })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                        <option value="yyyy-MM-dd">yyyy-MM-dd (2024-01-15)</option>
                                        <option value="dd/MM/yyyy">dd/MM/yyyy (15/01/2024)</option>
                                        <option value="MM/dd/yyyy">MM/dd/yyyy (01/15/2024)</option>
                                        <option value="dd-MM-yyyy">dd-MM-yyyy (15-01-2024)</option>
                                    </select>
                                </div>
                                <CuentaSelector value={mapping.cuentaId || null} onChange={(id) => setMapping({ ...mapping, cuentaId: id || 0 })} label="Cuenta Destino" required={true} />
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Categoría por defecto</label>
                                    <select value={mapping.categoriaIdDefault || ''} onChange={(e) => setMapping({ ...mapping, categoriaIdDefault: e.target.value ? Number(e.target.value) : null })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                        <option value="">Sin categoría</option>
                                        {gastoCategorias.map((c: any) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <label className="flex items-center gap-2 text-sm dark:text-gray-300">
                                    <input type="checkbox" checked={mapping.primeraFilaEsEncabezado} onChange={(e) => setMapping({ ...mapping, primeraFilaEsEncabezado: e.target.checked })}
                                        className="rounded" />
                                    Primera fila es encabezado
                                </label>
                                <label className="flex items-center gap-2 text-sm dark:text-gray-300">
                                    <input type="checkbox" checked={mapping.mapeo.montoNegativoEsGasto} onChange={(e) => setMapping({ ...mapping, mapeo: { ...mapping.mapeo, montoNegativoEsGasto: e.target.checked } })}
                                        className="rounded" />
                                    Monto negativo = gasto
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={reset} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center gap-2">
                                <ArrowLeft size={16} /> Atrás
                            </button>
                            <button onClick={handleValidate} disabled={loading || !mapping.cuentaId} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                                {loading ? 'Validando...' : 'Previsualizar'} <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Preview validation */}
                {step === 'preview' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                            <h3 className="font-semibold dark:text-white mb-3">Previsualización ({validationRows.length} filas)</h3>
                            <div className="overflow-x-auto max-h-96">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="text-left py-2 px-2 text-gray-600 dark:text-gray-400">#</th>
                                            <th className="text-left py-2 px-2 text-gray-600 dark:text-gray-400">Fecha</th>
                                            <th className="text-right py-2 px-2 text-gray-600 dark:text-gray-400">Monto</th>
                                            <th className="text-left py-2 px-2 text-gray-600 dark:text-gray-400">Descripción</th>
                                            <th className="text-left py-2 px-2 text-gray-600 dark:text-gray-400">Tipo</th>
                                            <th className="text-left py-2 px-2 text-gray-600 dark:text-gray-400">Categoría</th>
                                            <th className="text-left py-2 px-2 text-gray-600 dark:text-gray-400">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                        {validationRows.map((row) => (
                                            <tr key={row.fila} className={row.error ? 'bg-red-50 dark:bg-red-900/10' : row.esDuplicado ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}>
                                                <td className="py-2 px-2 dark:text-gray-300">{row.fila}</td>
                                                <td className="py-2 px-2 dark:text-gray-300">{row.fecha ? new Date(row.fecha).toLocaleDateString() : '-'}</td>
                                                <td className={`py-2 px-2 text-right font-medium ${row.tipoDetectado === 'Gasto' ? 'text-red-600' : 'text-green-600'}`}>
                                                    ${row.monto?.toFixed(2) || '-'}
                                                </td>
                                                <td className="py-2 px-2 dark:text-gray-300 truncate max-w-[150px]">{row.descripcion || '-'}</td>
                                                <td className="py-2 px-2">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${row.tipoDetectado === 'Gasto' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                                                        {row.tipoDetectado}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-2 text-xs dark:text-gray-400">{row.categoriaNombreSugerida || '-'}</td>
                                                <td className="py-2 px-2">
                                                    {row.error ? (
                                                        <span className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle size={12} />{row.error}</span>
                                                    ) : row.esDuplicado ? (
                                                        <span className="text-xs text-yellow-600">Duplicado</span>
                                                    ) : (
                                                        <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 size={12} />OK</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                <strong>{validationRows.filter(r => !r.error && !r.esDuplicado).length}</strong> filas se importarán |
                                <strong> {validationRows.filter(r => r.esDuplicado).length}</strong> duplicados (se omitirán) |
                                <strong> {validationRows.filter(r => r.error).length}</strong> con errores
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setStep('mapping')} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center gap-2">
                                <ArrowLeft size={16} /> Atrás
                            </button>
                            <button onClick={handleImport} disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
                                {loading ? 'Importando...' : 'Importar'} <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Result */}
                {step === 'result' && importResult && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
                        <CheckCircle2 size={64} className="mx-auto text-green-500 mb-4" />
                        <h3 className="text-2xl font-bold dark:text-white mb-4">Importación Completada</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 max-w-lg mx-auto">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                                <p className="text-xl font-bold dark:text-white">{importResult.totalFilas}</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Importadas</p>
                                <p className="text-xl font-bold text-green-600">{importResult.filasImportadas}</p>
                            </div>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Duplicadas</p>
                                <p className="text-xl font-bold text-yellow-600">{importResult.filasDuplicadas}</p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Errores</p>
                                <p className="text-xl font-bold text-red-600">{importResult.filasError}</p>
                            </div>
                        </div>

                        {importResult.errores.length > 0 && (
                            <div className="text-left max-w-lg mx-auto mb-6">
                                <h4 className="font-semibold dark:text-white mb-2 text-sm">Errores:</h4>
                                <div className="max-h-40 overflow-y-auto bg-red-50 dark:bg-red-900/10 rounded-lg p-3">
                                    {importResult.errores.map((err, i) => (
                                        <p key={i} className="text-xs text-red-700 dark:text-red-400">Fila {err.fila}: {err.mensaje}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button onClick={reset} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                            Importar otro archivo
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
