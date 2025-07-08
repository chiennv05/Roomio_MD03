export const formatDate = (input: string | undefined | null) => {
  if (!input) {
    return ''; // Return empty string or some default date format if needed
  }

  const parts = input.split('/');
  // Check if we have all three parts (day, month, year)
  if (parts.length !== 3) {
    return ''; // Return empty string or some default date format if needed
  }

  const day = parts[0]?.padStart(2, '0') || '01';
  const month = parts[1]?.padStart(2, '0') || '01';
  const year = parts[2] || new Date().getFullYear().toString();
  return `${year}-${month}-${day}`;
};
