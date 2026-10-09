/**
 * Centralized currency and number formatting helpers for INR (Indian Rupees).
 * Follows strict Indian numbering system conventions (Lakhs, Crores, Thousands).
 */

/**
 * Full INR currency formatting: ₹1,200, ₹8,450, ₹25,000, ₹1,00,000, ₹10,00,000
 */
export function formatINR(amount: number, decimals: number = 0): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Compact INR currency formatting: ₹8.42L, ₹5.18L, ₹3.24L, ₹2.18Cr, ₹12.4K
 */
export function formatCompactINR(amount: number, defaultDecimals: number = 2): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }

  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);

  // 1 Crore = 10,000,000
  if (abs >= 10000000) {
    const val = abs / 10000000;
    const formatted = val % 1 === 0 ? val.toFixed(0) : val.toFixed(defaultDecimals);
    return `${sign}₹${formatted}Cr`;
  }

  // 1 Lakh = 100,000
  if (abs >= 100000) {
    const val = abs / 100000;
    const formatted = val % 1 === 0 ? val.toFixed(0) : val.toFixed(defaultDecimals);
    return `${sign}₹${formatted}L`;
  }

  // 1 Thousand = 1,000
  if (abs >= 10000) {
    const val = abs / 1000;
    const formatted = val % 1 === 0 ? val.toFixed(0) : val.toFixed(1);
    return `${sign}₹${formatted}K`;
  }

  return formatINR(amount, 0);
}

/**
 * Standard Indian number formatting: 12,840, 2,421, 386, 1,00,000
 */
export function formatNumber(num: number, decimals: number = 0): string {
  if (isNaN(num) || num === null || num === undefined) {
    return '0';
  }
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Compact non-currency Indian numbering: 12.4K, 8.42L, 2.18Cr
 */
export function formatCompactNumber(num: number, defaultDecimals: number = 2): string {
  if (isNaN(num) || num === null || num === undefined) {
    return '0';
  }

  const sign = num < 0 ? '-' : '';
  const abs = Math.abs(num);

  if (abs >= 10000000) {
    const val = abs / 10000000;
    const formatted = val % 1 === 0 ? val.toFixed(0) : val.toFixed(defaultDecimals);
    return `${sign}${formatted}Cr`;
  }

  if (abs >= 100000) {
    const val = abs / 100000;
    const formatted = val % 1 === 0 ? val.toFixed(0) : val.toFixed(defaultDecimals);
    return `${sign}${formatted}L`;
  }

  if (abs >= 10000) {
    const val = abs / 1000;
    const formatted = val % 1 === 0 ? val.toFixed(0) : val.toFixed(1);
    return `${sign}${formatted}K`;
  }

  return formatNumber(num, 0);
}
