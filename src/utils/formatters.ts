/**
 * Formateadores centralizados. La moneda del proyecto es USD con locale en-US
 * (igual que la versión móvil). Antes había 7 definiciones locales de
 * formatCurrency con locales inconsistentes (es-MX vs en-US).
 */

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_CURRENCY = 'USD';

export interface FormatCurrencyOptions {
    /** Código ISO de moneda (p. ej. la moneda propia de una cuenta). Por defecto USD. */
    currency?: string | null;
    /** Decimales mínimos. Por defecto los del locale (2 para USD). */
    minimumFractionDigits?: number;
    /** Decimales máximos. Por defecto los del locale (2 para USD). */
    maximumFractionDigits?: number;
}

/**
 * Formatea un importe como moneda. Por defecto USD/en-US → "$1,234.56".
 * Ejemplos:
 *   formatCurrency(1234.5)                                  -> "$1,234.50"
 *   formatCurrency(1234.5, { currency: cuenta.moneda })     -> moneda de la cuenta
 *   formatCurrency(1234.5, { minimumFractionDigits: 0,
 *                            maximumFractionDigits: 0 })     -> "$1,235"
 */
export function formatCurrency(amount: number, options: FormatCurrencyOptions = {}): string {
    const { currency, minimumFractionDigits, maximumFractionDigits } = options;
    return new Intl.NumberFormat(DEFAULT_LOCALE, {
        style: 'currency',
        currency: currency || DEFAULT_CURRENCY,
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(amount);
}
