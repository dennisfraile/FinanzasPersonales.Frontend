import { useState } from 'react';
import { Download } from 'lucide-react';

interface ExportColumn {
    key: string;
    label: string;
}

interface ExportButtonProps {
    data: Record<string, unknown>[];
    columns: ExportColumn[];
    filename: string;
    className?: string;
}

function escapeCSV(val: unknown): string {
    const str = val == null ? '' : String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

const ExportButton: React.FC<ExportButtonProps> = ({ data, columns, filename, className }) => {
    const [isExporting, setIsExporting] = useState(false);

    const exportCSV = () => {
        setIsExporting(true);
        try {
            const header = columns.map(c => escapeCSV(c.label)).join(',');
            const rows = data.map(row =>
                columns.map(c => escapeCSV(row[c.key])).join(',')
            );
            const csv = [header, ...rows].join('\n');
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button
            type="button"
            onClick={exportCSV}
            disabled={isExporting || data.length === 0}
            className={className || "bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"}
            title="Exportar a CSV"
        >
            <Download size={18} />
            <span className="hidden sm:inline">Exportar</span>
        </button>
    );
};

export default ExportButton;
