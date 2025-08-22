/**
 * Các hàm util để format dữ liệu
 */

/**
 * Format ngày tháng từ chuỗi ISO sang dạng dd/mm/yyyy
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) {return '';}
  try {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  } catch (error) {
    return 'Ngày không hợp lệ';
  }
};

/**
 * Format số tiền thành dạng có dấu chấm ngăn cách và đơn vị tiền tệ
 */
export const formatMoney = (
  money?: number,
  suffix: string = '/tháng',
): string => {
  if (money === undefined || money === null) {return 'Không có';}
  try {
    return money.toLocaleString('vi-VN') + 'đ' + suffix;
  } catch (error) {
    return 'Số tiền không hợp lệ';
  }
};

/**
 * Format số điện thoại với dấu cách
 */
export const formatPhoneNumber = (phone?: string): string => {
  if (!phone) {return 'Không có';}
  // Loại bỏ các ký tự không phải số
  const cleaned = phone.replace(/\D/g, '');
  // Format số điện thoại Vietnam: 0xxx xxx xxx
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  // Nếu không đúng định dạng thì trả về nguyên bản
  return phone;
};

/**
 * Xử lý URL ảnh
 */
export const getPhotoUrl = (photoPath?: string, baseUrl?: string): string => {
  if (!photoPath) {return '';}
  // Nếu là URL đầy đủ, trả về nguyên gốc
  if (photoPath.startsWith('http')) {return photoPath;}
  // Nếu là đường dẫn tương đối và có baseUrl
  if (baseUrl) {return `${baseUrl}${photoPath}`;}
  // Trả về đường dẫn tương đối nếu không có baseUrl
  return photoPath;
};

/**
 * Rút gọn văn bản nếu quá dài
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {return text;}
  return text.slice(0, maxLength) + '...';
};
