import {
  formatINR,
  formatCompactINR,
  formatNumber,
  formatCompactNumber,
} from './currency';

export type NumberFormatType =
  | 'number'
  | 'currency'
  | 'compactCurrency'
  | 'compactNumber'
  | 'percent'
  | 'none';

export interface NumberFormatOptions {
  format?: NumberFormatType;
  decimals?: number;
  separator?: string;
  prefix?: string;
  suffix?: string;
  compact?: boolean;
  currency?: boolean;
}

/**
 * Parses raw number or strings like "12,840", "₹8.42L", "842000", "12.4%"
 * into a pure float for GSAP numeric interpolation.
 */
export function parseRawNumericValue(val: number | string | null | undefined): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;

  const str = String(val).trim();
  if (!str) return 0;

  // Crore multiplier: e.g. "₹2.18Cr" -> 2.18 * 10,000,000
  if (/cr/i.test(str)) {
    const cleaned = str.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed * 10000000;
  }

  // Lakh multiplier: e.g. "₹8.42L" -> 8.42 * 100,000
  if (/l(akh)?/i.test(str)) {
    const cleaned = str.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed * 100000;
  }

  // Thousand multiplier: e.g. "12.4k" -> 12.4 * 1,000
  if (/k/i.test(str)) {
    const cleaned = str.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed * 1000;
  }

  // Standard numeric string: "12,840", "98.4%", "₹50,000"
  const cleaned = str.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats an interpolated numeric value based on requested format options.
 */
export function formatNumberValue(
  value: number,
  options: NumberFormatOptions = {}
): string {
  const {
    format = 'number',
    decimals,
    separator,
    prefix = '',
    suffix = '',
    compact = false,
    currency = false,
  } = options;

  let formatted = '';

  // 1. Explicit or implicit compact currency
  if (format === 'compactCurrency' || (currency && compact) || (format === 'currency' && compact)) {
    formatted = formatCompactINR(value, decimals ?? 2);
  }
  // 2. Full currency (INR)
  else if (format === 'currency' || currency) {
    formatted = formatINR(value, decimals ?? 0);
  }
  // 3. Compact number without currency
  else if (format === 'compactNumber' || (format === 'number' && compact)) {
    formatted = formatCompactNumber(value, decimals ?? 2);
  }
  // 4. Percentage
  else if (format === 'percent') {
    const d = decimals !== undefined ? decimals : Number.isInteger(value) ? 0 : 1;
    formatted = `${value.toFixed(d)}%`;
  }
  // 5. Raw number
  else if (format === 'none') {
    formatted = decimals !== undefined ? value.toFixed(decimals) : String(Math.round(value));
  }
  // 6. Standard Indian number with grouping
  else {
    const d = decimals !== undefined ? decimals : Number.isInteger(value) ? 0 : 2;
    formatted = formatNumber(value, d);
  }

  // Apply custom separator if provided and different from default comma
  if (separator !== undefined && separator !== ',') {
    formatted = formatted.replace(/,/g, separator);
  }

  // Prepend prefix and append suffix if provided
  let finalResult = formatted;
  if (prefix && !finalResult.startsWith(prefix)) {
    finalResult = `${prefix}${finalResult}`;
  }
  if (suffix && !finalResult.endsWith(suffix)) {
    finalResult = `${finalResult}${suffix}`;
  }

  return finalResult;
}
