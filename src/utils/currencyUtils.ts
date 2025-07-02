/**
 * Utility functions for currency handling
 */

/**
 * Converts a string currency value to a number for database storage
 * @param value - String value from input (e.g., "123,45" or "123.45")
 * @returns Number value for database
 */
export const stringToNumber = (value: string): number => {
  if (!value || value.trim() === '') return 0;
  
  // Remove everything except digits, comma, and dot
  const cleanValue = value.replace(/[^\d,.]/g, '');
  
  // If empty after cleaning, return 0
  if (!cleanValue) return 0;
  
  // Replace comma with dot for parsing
  const normalizedValue = cleanValue.replace(',', '.');
  
  // Parse as float
  const numericValue = parseFloat(normalizedValue);
  
  return isNaN(numericValue) ? 0 : numericValue;
};

/**
 * Converts a number to a formatted currency string for display
 * @param value - Number value from database
 * @returns Formatted currency string
 */
export const numberToString = (value: number): string => {
  if (value === 0) return '';
  return value.toString();
};

/**
 * Formats a number as Brazilian currency
 * @param value - Number value
 * @returns Formatted Brazilian currency string
 */
export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};