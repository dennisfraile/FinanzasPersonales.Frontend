import { useState, useEffect } from 'react';
import { FileText, Download, Trash2, Upload as UploadIcon } from 'lucide-react';
import adjuntosService from '../services/adjuntosService';
import type { Adjunto } from '../services/adjuntosService';
import { FileUpload } from './FileUpload';
import { toast } from 'react-toastify';

interface AdjuntosListProps {
    gastoId?: number;
    ingresoId?: number;
}

export const AdjuntosList: React.FC<AdjuntosListProps> = ({ gastoId, ingresoId }) => {
    const [adjuntos, setAdjuntos] = useState<Adjunto[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);

    useEffect(() => {
        loadAdjuntos();
    }, [gastoId, ingresoId]);

    const loadAdjuntos = async () => {
        try {
            const data = gastoId
                ? await adjuntosService.getByGasto(gastoId)
                : ingresoId
                    ? await adjuntosService.getByIngreso(ingresoId)
                    : [];
            setAdjuntos(data);
        } catch (error) {
            console.error('Error loading adjuntos:', error);
        }
    };

    const handleFileSelected = async (file: File) => {
        setIsUploading(true);
        try {
            await adjuntosService.upload(file, gastoId, ingresoId);
            toast.success('Comprobante subido exitosamente');
            setShowUpload(false);
            loadAdjuntos();
        } catch (error: any) {
            const message = error?.response?.data || 'Error al subir archivo';
            toast.error(message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownload = async (adjunto: Adjunto) => {
        try {
            const blob = await adjuntosService.download(adjunto.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = adjunto.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error('Error al descargar archivo');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este comprobante?')) return;
        try {
            await adjuntosService.delete(id);
            toast.success('Comprobante eliminado');
            loadAdjuntos();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    return (
        <div className="mt-4">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                    Comprobantes ({adjuntos.length})
                </h4>
                <button
                    onClick={() => setShowUpload(!showUpload)}
                    className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                >
                    <UploadIcon size={16} />
                    Subir PDF
                </button>
            </div>

            {showUpload && (
                <div className="mb-4">
                    <FileUpload onFileSelected={handleFileSelected} />
                    {isUploading && (
                        <p className="text-sm text-blue-600 mt-2">Subiendo archivo...</p>
                    )}
                </div>
            )}

            {adjuntos.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    No hay comprobantes adjuntos
                </p>
            ) : (
                <div className="space-y-2">
                    {adjuntos.map((adj) => (
                        <div
                            key={adj.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                            <div className="flex items-center gap-2">
                                <FileText size={20} className="text-red-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {adj.fileName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {(adj.fileSize / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDownload(adj)}
                                    className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                                    title="Descargar"
                                >
                                    <Download size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(adj.id)}
                                    className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                                    title="Eliminar"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
