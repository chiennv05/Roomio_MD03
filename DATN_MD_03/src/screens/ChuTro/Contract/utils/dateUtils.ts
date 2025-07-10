/**
 * Format date to YYYY-MM-DD string
 * @param date - Date object to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format date to DD/MM/YYYY string
 * @param date - Date object to format
 * @returns Formatted date string
 */
export const formatDateVN = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format date string to display format
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string in DD/MM/YYYY
 */
export const formatDateString = (dateString: string): string => {
  const date = new Date(dateString);
  return formatDateVN(date);
};

/**
 * Calculate contract term in months between two dates
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of months
 */
export const calculateContractTerm = (startDate: Date, endDate: Date): number => {
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  return Math.max(1, diffMonths); // Minimum 1 month
};

/**
 * Calculate contract term from current date to end date
 * @param selectedDate - End date
 * @returns Number of months from now
 */
export const calculateContractTermFromNow = (selectedDate: Date): number => {
  const currentDate = new Date();
  return calculateContractTerm(currentDate, selectedDate);
};

/**
 * Add months to a date
 * @param date - Base date
 * @param months - Number of months to add
 * @returns New date with added months
 */
export const addMonthsToDate = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/**
 * Calculate end date from start date and contract term
 * @param startDate - Start date
 * @param contractTermMonths - Contract term in months
 * @returns End date
 */
export const calculateEndDate = (startDate: Date, contractTermMonths: number): Date => {
  return addMonthsToDate(startDate, contractTermMonths);
};

/**
 * Check if a date is in the past
 * @param date - Date to check
 * @returns True if date is in the past
 */
export const isDateInPast = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

/**
 * Get date limits for date pickers
 * @param yearsInFuture - Number of years in the future (default: 5)
 * @returns Object with today and max date
 */
export const getDateLimits = (yearsInFuture: number = 5) => {
  const today = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() + yearsInFuture);
  
  return {
    today,
    maxDate,
  };
};