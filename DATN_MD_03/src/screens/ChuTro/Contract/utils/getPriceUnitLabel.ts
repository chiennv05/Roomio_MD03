/**
 * Hàm trả về đơn vị hiển thị tiếng Việt dựa vào priceType và loại dịch vụ.
 * @param priceType Giá trị priceType
 * @param serviceName Tên dịch vụ để xử lý riêng điện/nước nếu cần
 * @returns Chuỗi hiển thị đơn vị tính
 */
export const getPriceUnitLabel = (
  priceType: string,
  serviceName?: 'electricity' | 'water',
): string => {
  // Ưu tiên xử lý riêng điện/nước
  if (serviceName === 'electricity') {
    return priceType === 'perUsage' ? 'số' : 'phòng';
  }

  if (serviceName === 'water') {
    return priceType === 'perUsage' ? 'khối' : 'phòng';
  }

  // Mặc định xử lý cho dịch vụ tùy chọn
  switch (priceType) {
    case 'perPerson':
      return 'người';
    case 'perRoom':
      return 'phòng';
    case 'perUsage':
      return 'lần sử dụng';
    default:
      return '';
  }
};
