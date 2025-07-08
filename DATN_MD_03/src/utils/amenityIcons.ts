import {Icons} from '../assets/icons';

const DEFAULT_ICON = Icons.IconHome || '';

// Mapping cho furniture options với icons thật
export const furnitureMapping: Record<string, {label: string; icon: string}> = {
  dieuHoa: {label: 'Điều hòa', icon: Icons.IconDieuHoa || DEFAULT_ICON},
  mayNuocNong: {label: 'Máy nước nóng', icon: Icons.IconNongLanh || DEFAULT_ICON},
  tuLanh: {label: 'Tủ lạnh', icon: Icons.IconTuLanh || DEFAULT_ICON},
  mayGiat: {label: 'Máy giặt', icon: Icons.IconMayGiat || DEFAULT_ICON},
  quatTran: {label: 'Quạt trần', icon: Icons.IconQuatTran || DEFAULT_ICON},
  giuongNgu: {label: 'Giường ngủ', icon: Icons.IconGiuongNgu || DEFAULT_ICON},
  tuQuanAo: {label: 'Tủ quần áo', icon: Icons.IconTuQuanAo || DEFAULT_ICON},
  banGhe: {label: 'Bàn ghế', icon: Icons.IconBanGhe || DEFAULT_ICON},
  keBep: {label: 'Kệ bếp', icon: Icons.IconKeBep || DEFAULT_ICON},
  sofa: {label: 'Sofa', icon: Icons.IconSofa || DEFAULT_ICON},
  guong: {label: 'Gương', icon: Icons.IconGuong || DEFAULT_ICON},
  remCua: {label: 'Rèm cửa', icon: Icons.IconRemCua || DEFAULT_ICON},
  doGiaDung: {label: 'Đồ gia dụng', icon: DEFAULT_ICON},
  chanGaGoi: {label: 'Chăn ga gối', icon: Icons.IconChanGaGoi || DEFAULT_ICON},
  khac: {label: 'Khác', icon: DEFAULT_ICON},
};

// Mapping cho service options với icons thật
export const serviceMapping = {
  electricity: { label: 'Điện', icon: Icons.IconElectricalDefault || DEFAULT_ICON },
  water: { label: 'Nước', icon: Icons.IconWarterDropDefault || DEFAULT_ICON },
  cleaning: { label: 'Dịch vụ', icon: Icons.IconServiceDefault || DEFAULT_ICON },
  parking: { label: 'Gửi xe', icon: Icons.IconGuiXe || DEFAULT_ICON },
  internet: { label: 'Internet', icon: Icons.IconWifiDefault || DEFAULT_ICON },
  elevator: { label: 'Thang máy', icon: Icons.IconThangMayDefault || DEFAULT_ICON },
};

// Mapping cho amenities options với icons thật
export const amenitiesMapping: Record<string, {label: string; icon: string}> = {
  vsKhepKin: {label: 'Vệ sinh khép kín', icon: Icons.IconVeSinhKhepKin || DEFAULT_ICON},
  vsChung: {label: 'Vệ sinh chung', icon: Icons.IconVeSinhChung || DEFAULT_ICON},
  gacXep: {label: 'Gác xép', icon: Icons.IconGacXep || DEFAULT_ICON},
  banCong: {label: 'Ban công', icon: Icons.IconBanCong || DEFAULT_ICON},
  thangMay: {label: 'Thang máy', icon: Icons.IconThangMay || DEFAULT_ICON},
  baoVe247: {label: 'Bảo vệ 24/7', icon: Icons.IconBaoVe || DEFAULT_ICON},
  guiXeDien: {label: 'Gửi xe điện', icon: Icons.IconGuiXeDien || DEFAULT_ICON},
  guiXeMay: {label: 'Gửi xe máy', icon: Icons.IconGuiXeMay || DEFAULT_ICON},
  guiXeOto: {label: 'Gửi xe ô tô', icon: Icons.IconGuiXeOto || DEFAULT_ICON},
  nuoiPet: {label: 'Nuôi pet', icon: Icons.IconNuoiPet || DEFAULT_ICON},
  gioLinhHoat: {label: 'Giờ linh hoạt', icon: Icons.IconGioLinhHoat || DEFAULT_ICON},
  khongChungChu: {
    label: 'Không chung chủ',
    icon: Icons.IconKhongChungChu || DEFAULT_ICON,
  },
  raVaoVanTay: {label: 'Ra vào vân tay', icon: Icons.IconRaVaoVanTay || DEFAULT_ICON},
  wifiFree: {label: 'Wifi miễn phí', icon: Icons.IconWifiMienPhi || DEFAULT_ICON},
  wifiTraPhi: {label: 'Wifi trả phí', icon: Icons.IconWifiTraPhi || DEFAULT_ICON},
  khac: {label: 'Khác', icon: DEFAULT_ICON},
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
