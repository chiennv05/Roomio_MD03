export interface RoomFormData {
  roomNumber: string;
  area: number | '' | undefined;
  addressText: string;
  maxOccupancy: number | '' | undefined;
  imageArr: string[];
  serviceOptionList: {status: boolean; value: string}[];
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

  return {valid: true};
};
