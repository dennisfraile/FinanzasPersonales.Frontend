import { useState, useEffect, useCallback } from 'react';
import { FileText, Download, Trash2, Upload as UploadIcon, X, Image as ImageIcon } from 'lucide-react';
import adjuntosService from '../services/adjuntosService';
import type { Adjunto } from '../services/adjuntosService';
import { FileUpload } from './FileUpload';
import { toast } from 'react-toastify';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

function isImageFile(fileName: string, contentType?: string): boolean {
    if (contentType && contentType.startsWith('image/')) return true;
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
    return IMAGE_EXTENSIONS.includes(ext);
}

interface AdjuntosListProps {
    gastoId?: number;
    ingresoId?: number;
}

export const AdjuntosList: React.FC<AdjuntosListProps> = ({ gastoId, ingresoId }) => {
    const [adjuntos, setAdjuntos] = useState<Adjunto[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewFileName, setPreviewFileName] = useState<string>('');

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

    const handlePreview = async (adjunto: Adjunto) => {
        try {
            const blob = await adjuntosService.download(adjunto.id);
            const url = window.URL.createObjectURL(blob);
            setPreviewUrl(url);
            setPreviewFileName(adjunto.fileName);
        } catch (error) {
            toast.error('Error al cargar vista previa');
        }
    };

    const closePreview = useCallback(() => {
        if (previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setPreviewFileName('');
    }, [previewUrl]);

    const handleClick = (adjunto: Adjunto) => {
        if (isImageFile(adjunto.fileName, adjunto.contentType)) {
            handlePreview(adjunto);
        } else {
            handleDownload(adjunto);
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
                            <button
                                type="button"
                                className="flex items-center gap-2 min-w-0 flex-1 text-left"
                                onClick={() => handleClick(adj)}
                                title={isImageFile(adj.fileName, adj.contentType) ? 'Ver imagen' : 'Descargar'}
                            >
                                {isImageFile(adj.fileName, adj.contentType) ? (
                                    <ImageIcon size={20} className="text-green-600 flex-shrink-0" />
                                ) : (
                                    <FileText size={20} className="text-red-600 flex-shrink-0" />
                                )}
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {adj.fileName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {(adj.fileSize / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </button>
                            <div className="flex gap-2 flex-shrink-0">
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

            {/* Image preview modal */}
            {previewUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
                    onClick={closePreview}
                >
                    <div
                        className="relative flex flex-col items-center max-w-4xl w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={closePreview}
                            className="absolute -top-10 right-0 p-1 text-white hover:text-gray-300 transition-colors"
                            title="Cerrar"
                        >
                            <X size={28} />
                        </button>
                        <img
                            src={previewUrl}
                            alt={previewFileName}
                            className="max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl"
                        />
                        <p className="mt-3 text-sm text-white/80 text-center truncate max-w-full">
                            {previewFileName}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
