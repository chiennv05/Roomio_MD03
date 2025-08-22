import {Colors} from '../../../../theme/color';

export const getStatusInfo = (status: string, approvalStatus: string) => {
  // Ưu tiên 1: Chờ duyệt
  if (approvalStatus === 'choDuyet') {
    return {
      label: 'Chờ duyệt',
      color: Colors.gray150,
      textColor: Colors.gray60,
    }; // vàng
  }
  if (approvalStatus === 'tuChoi') {
    return {
      label: 'Từ chối',
      color: Colors.red,
      textColor: Colors.white,
    };
  }

  // Ưu tiên 3: Nếu đã được duyệt thì xét trạng thái phòng
  switch (status) {
    case 'trong':
      return {
        label: 'Phòng trống',
        color: Colors.limeGreen,
        textColor: Colors.black,
      }; // xanh lá
    case 'daThue':
      return {
        label: 'Đã thuê',
        color: Colors.dearkOlive,
        textColor: Colors.limeGreen,
      }; // xám đậm
    case 'an':
      return {label: 'Ẩn', color: '#607D8B', textColor: Colors.white}; // xám xanh
    default:
      return {label: 'Không rõ', color: '#9e9e9e'};
  }
};
