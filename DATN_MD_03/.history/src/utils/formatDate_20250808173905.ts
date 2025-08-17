
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Chưa có';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Ngày không hợp lệ';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Lỗi định dạng ngày';
  }

};
// export const formatDate = (input: string | undefined | null) => {
//   if (!input) {
//     return ''; // Return empty string or some default date format if needed
//   }

//   const parts = input.split('/');
//   // Check if we have all three parts (day, month, year)
//   if (parts.length !== 3) {
//     return ''; // Return empty string or some default date format if needed
//   }

//   const day = parts[0]?.padStart(2, '0') || '01';
//   const month = parts[1]?.padStart(2, '0') || '01';
//   const year = parts[2] || new Date().getFullYear().toString();
//   return `${year}-${month}-${day}`;
// };
