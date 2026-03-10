import { useState, useCallback } from 'react';
import { Upload, File as FileIcon, X } from 'lucide-react';
import { toast } from 'react-toastify';

interface FileUploadProps {
    onFileSelected: (file: File) => void;
    accept?: string;
    maxSizeMB?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    onFileSelected,
    accept = '.pdf',
    maxSizeMB = 5
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const validateFile = (file: File): boolean => {
        // Validar tamaño
        const maxBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxBytes) {
            toast.error(`El archivo excede el tamaño máximo de ${maxSizeMB}MB`);
            return false;
        }

        // Validar tipo (solo PDF)
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            toast.error('Solo se permiten archivos PDF. Por favor, escanea tus comprobantes como PDF.');
            return false;
        }

        return true;
    };

    const handleFile = (file: File) => {
        if (validateFile(file)) {
            setSelectedFile(file);
            onFileSelected(file);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
    };

    return (
        <div className="w-full">
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                    transition-colors duration-200
                    ${isDragging
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                    }
                `}
            >
                <input
                    type="file"
                    accept={accept}
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Arrastra tu comprobante PDF aquí o haz click para seleccionar
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                        Solo archivos PDF, máximo {maxSizeMB}MB
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                        💡 Escanea tus comprobantes como PDF
                    </p>
                </label>
            </div>

            {selectedFile && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileIcon size={20} className="text-red-600" />
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={clearFile}
                        className="text-gray-500 hover:text-red-600"
                        aria-label="Quitar archivo"
                    >
                        <X size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};
