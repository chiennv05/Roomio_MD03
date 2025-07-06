import {Icons} from '../assets/icons';

// Mapping cho furniture options với icons thật
export const furnitureMapping: Record<string, {label: string; icon: string}> = {
  dieuHoa: {label: 'Điều hòa', icon: Icons.IconDieuHoa || '❄️'}, // Có thể thay bằng Icons.IconAirConditioner nếu có
  mayNuocNong: {label: 'Máy nước nóng', icon: Icons.IconMayNuocNong || '🔥'},
  tuLanh: {label: 'Tủ lạnh', icon: Icons.IconTuLanh || '🧊'},
  mayGiat: {label: 'Máy giặt', icon: Icons.IconMayGiat || '🧺'},
  quatTran: {label: 'Quạt trần', icon: Icons.IconQuatTran || '💨'},
  giuongNgu: {label: 'Giường ngủ', icon: Icons.IconGiuongNgu || '🛏️'},
  tuQuanAo: {label: 'Tủ quần áo', icon: Icons.IconTuQuanAo || '👕'},
  banGhe: {label: 'Bàn ghế', icon: Icons.IconBanGhe || '🪑'},
  keBep: {label: 'Kệ bếp', icon: Icons.IconKeBep || '🍳'},
  sofa: {label: 'Sofa', icon: Icons.IconSofa || '🛋️'},
  guong: {label: 'Gương', icon: Icons.IconGuong || '🪞'},
  remCua: {label: 'Rèm cửa', icon: Icons.IconRemCua || '🪟'},
  doGiaDung: {label: 'Đồ gia dụng', icon: '🏠'},
  chanGaGoi: {label: 'Chăn ga gối', icon: Icons.IconChanGaGoi || '🛌'},
  khac: {label: 'Khác', icon: '📦'},
};

// Mapping cho amenities options với icons thật
export const amenitiesMapping: Record<string, {label: string; icon: string}> = {
  vsKhepKin: {label: 'Vệ sinh khép kín', icon: Icons.IconVeSinhKhepKin || '🚿'},
  vsChung: {label: 'Vệ sinh chung', icon: Icons.IconVeSinhChung || '🚻'},
  gacXep: {label: 'Gác xép', icon: Icons.IconGacXep || '🏠'},
  banCong: {label: 'Ban công', icon: Icons.IconBanCong || '🌅'},
  thangMay: {label: 'Thang máy', icon: Icons.IconThangMay || '🛗'},
  baoVe247: {label: 'Bảo vệ 24/7', icon: Icons.IconBaoVe || '🛡️'},
  guiXeDien: {label: 'Gửi xe điện', icon: Icons.IconGuiXeDien || '🛵'},
  guiXeMay: {label: 'Gửi xe máy', icon: Icons.IconGuiXeMay || '🏍️'},
  guiXeOto: {label: 'Gửi xe ô tô', icon: Icons.IconGuiXeOto || '🚗'},
  nuoiPet: {label: 'Nuôi pet', icon: Icons.IconNuoiPet || '🐕'},
  gioLinhHoat: {label: 'Giờ linh hoạt', icon: Icons.IconGioLinhHoat || '⏰'},
  khongChungChu: {
    label: 'Không chung chủ',
    icon: Icons.IconKhongChungChu || '🔒',
  },
  raVaoVanTay: {label: 'Ra vào vân tay', icon: Icons.IconRaVaoVanTay || '👆'},
  wifiFree: {label: 'Wifi miễn phí', icon: Icons.IconWifiMienPhi || '📶'}, // Sử dụng icon wifi thực
  wifiTraPhi: {label: 'Wifi trả phí', icon: Icons.IconWifiTraPhi || '💰'},
  khac: {label: 'Khác', icon: '📦'},
};

// Function để get icon cho furniture/amenity
export const getItemIcon = (
  type: 'furniture' | 'amenity',
  value: string,
): string => {
  if (type === 'furniture') {
    return furnitureMapping[value]?.icon || '📦';
  } else {
    return amenitiesMapping[value]?.icon || '📦';
  }
};

// Function để get label cho furniture/amenity
export const getItemLabel = (
  type: 'furniture' | 'amenity',
  value: string,
): string => {
  if (type === 'furniture') {
    return furnitureMapping[value]?.label || value;
  } else {
    return amenitiesMapping[value]?.label || value;
  }
};
