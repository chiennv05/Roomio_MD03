export interface RoomFormData {
  roomNumber: string;
  area: number | '' | undefined;
  addressText: string; // vẫn có thể giữ nếu muốn hiển thị toàn bộ
  houseNo: string;
  street: string;
  ward: string;
  district: string;
  province: string;
  maxOccupancy: number | '' | undefined;
  imageArr: string[];
  serviceOptionList: {status: boolean; value: string}[];
  description: string;
  rentPrice: number | '' | undefined;
}

export const validateRoomForm = (
  form: RoomFormData,
): {valid: boolean; message?: string} => {
  if (!form.roomNumber.trim()) {
    return {valid: false, message: 'Vui lòng nhập số phòng'};
  }
  if (!form.area || typeof form.area !== 'number' || form.area <= 0) {
    return {valid: false, message: 'Diện tích không hợp lệ'};
  }

  if (!form.area || form.area <= 0) {
    return {valid: false, message: 'Diện tích không hợp lệ'};
  }

  if (!form.addressText.trim()) {
    return {valid: false, message: 'Vui lòng nhập địa chỉ'};
  }

  if (!form.maxOccupancy || form.maxOccupancy <= 0) {
    return {valid: false, message: 'Số người ở không hợp lệ'};
  }

  if (!form.imageArr || form.imageArr.length === 0) {
    return {valid: false, message: 'Vui lòng thêm ít nhất 1 ảnh'};
  }

  // ✅ Phải có cả điện và nước
  const hasElectricity = form.serviceOptionList.some(
    i => i.value === 'electricity' && i.status === true,
  );
  const hasWater = form.serviceOptionList.some(
    i => i.value === 'water' && i.status === true,
  );

  if (!hasElectricity || !hasWater) {
    return {valid: false, message: 'Vui lòng chọn cả dịch vụ điện và nước'};
  }
  // ✅ Kiểm tra địa chỉ
  if (!form.province || !form.district || !form.ward) {
    return {valid: false, message: 'Vui lòng chọn đầy đủ địa chỉ'};
  }
  // ✅ Kiểm tra địa chỉ chi tiết
  if (!form.street.trim()) {
    return {valid: false, message: 'Vui lòng nhập tên đường'};
  }
  if (!form.houseNo.trim()) {
    return {valid: false, message: 'Vui lòng nhập số nhà'};
  }
  // ✅ Kiểm tra mô tả
  if (!form.description.trim()) {
    return {valid: false, message: 'Vui lòng nhập mô tả phòng'};
  }
  // ✅ Kiểm tra giá thuê
  if (!form.rentPrice || form.rentPrice <= 0) {
    return {valid: false, message: 'Giá thuê không hợp lệ'};
  }

  return {valid: true};
};
