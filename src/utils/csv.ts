/**
 * Exporta filas a un archivo CSV y dispara su descarga.
 * Centraliza la logica que estaba duplicada en GastosPage e IngresosPage
 * (escape de comillas, BOM UTF-8 para Excel, blob y descarga).
 *
 * @param baseName  Nombre base del archivo; se le anade la fecha y `.csv`.
 * @param headers   Cabeceras de columna.
 * @param rows      Filas (cada celda se convierte a string y se escapa).
 */
export function exportToCsv(baseName: string, headers: string[], rows: (string | number)[][]): void {
    const csv = [headers, ...rows]
        .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
        .join('\n');
    // BOM para que Excel detecte UTF-8 correctamente.
    const blob = new Blob([String.fromCharCode(0xFEFF) + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
