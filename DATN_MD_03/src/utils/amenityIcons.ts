import { Icons } from '../assets/icons';

// Mapping cho furniture options với icons thật
export const furnitureMapping: Record<string, { label: string; icon: string }> = {
  dieuHoa: { label: 'Điều hòa', icon: '❄️' }, // Có thể thay bằng Icons.IconAirConditioner nếu có
  mayNuocNong: { label: 'Máy nước nóng', icon: '🔥' },
  tuLanh: { label: 'Tủ lạnh', icon: '🧊' },
  mayGiat: { label: 'Máy giặt', icon: '🧺' },
  quatTran: { label: 'Quạt trần', icon: '💨' },
  giuongNgu: { label: 'Giường ngủ', icon: '🛏️' },
  tuQuanAo: { label: 'Tủ quần áo', icon: '👕' },
  banGhe: { label: 'Bàn ghế', icon: '🪑' },
  keBep: { label: 'Kệ bếp', icon: '🍳' },
  sofa: { label: 'Sofa', icon: '🛋️' },
  guong: { label: 'Gương', icon: '🪞' },
  remCua: { label: 'Rèm cửa', icon: '🪟' },
  doGiaDung: { label: 'Đồ gia dụng', icon: '🏠' },
  chanGaGoi: { label: 'Chăn ga gối', icon: '🛌' },
  khac: { label: 'Khác', icon: '📦' },
};

// Mapping cho amenities options với icons thật
export const amenitiesMapping: Record<string, { label: string; icon: string }> = {
  vsKhepKin: { label: 'Vệ sinh khép kín', icon: '🚿' },
  vsChung: { label: 'Vệ sinh chungVệ sinh chung', icon: '🚻' },
  gacXep: { label: 'Gác xép', icon: '🏠' },
  banCong: { label: 'Ban công', icon: '🌅' },
  thangMay: { label: 'Thang máy', icon: '🛗' },
  baoVe247: { label: 'Bảo vệ 24/7', icon: '🛡️' },
  guiXeDien: { label: 'Gửi xe điện', icon: '🛵' },
  guiXeMay: { label: 'Gửi xe máy', icon: '🏍️' },
  guiXeOto: { label: 'Gửi xe ô tô', icon: '🚗' },
  nuoiPet: { label: 'Nuôi pet', icon: '🐕' },
  gioLinhHoat: { label: 'Giờ linh hoạt', icon: '⏰' },
  khongChungChu: { label: 'Không chung chủ', icon: '🔒' },
  raVaoVanTay: { label: 'Ra vào vân tay', icon: '👆' },
  wifiFree: { label: 'Wifi miễn phí', icon: Icons.IconWifi || '📶' }, // Sử dụng icon wifi thực
  wifiTraPhi: { label: 'Wifi trả phí', icon: Icons.IconWifi || '💰' },
  khac: { label: 'Khác', icon: '📦' },
};

// Function để get icon cho furniture/amenity
export const getItemIcon = (type: 'furniture' | 'amenity', value: string): string => {
  if (type === 'furniture') {
    return furnitureMapping[value]?.icon || '📦';
  } else {
    return amenitiesMapping[value]?.icon || '📦';
  }
};

// Function để get label cho furniture/amenity
export const getItemLabel = (type: 'furniture' | 'amenity', value: string): string => {
  if (type === 'furniture') {
    return furnitureMapping[value]?.label || value;
  } else {
    return amenitiesMapping[value]?.label || value;
  }
}; 