import {Icons} from '../assets/icons';

const DEFAULT_ICON = Icons.IconHome || '';

// Mapping cho furniture options với icons thật
export const furnitureMapping: Record<string, {label: string; icon: string}> = {
  dieuHoa: {label: 'Điều hòa', icon: Icons.IconDieuHoaSelectd || DEFAULT_ICON},
  mayNuocNong: {label: 'Máy nước nóng', icon: Icons.IconBinhNongLanhSelectd || DEFAULT_ICON},
  tuLanh: {label: 'Tủ lạnh', icon: Icons.IconFridgeSelectd || DEFAULT_ICON},
  mayGiat: {label: 'Máy giặt', icon: Icons.IconMayGiatSelectd || DEFAULT_ICON},
  quatTran: {label: 'Quạt trần', icon: Icons.IconCeilingFanSelectd || DEFAULT_ICON},
  giuongNgu: {label: 'Giường ngủ', icon: Icons.IconGiuongNguSelectd || DEFAULT_ICON},
  tuQuanAo: {label: 'Tủ quần áo', icon: Icons.IconTuQuanAoSelectd || DEFAULT_ICON},
  banGhe: {label: 'Bàn ghế', icon: Icons.IconTableChairSelectd || DEFAULT_ICON},
  keBep: {label: 'Kệ bếp', icon: Icons.IconKeBepSelectd || DEFAULT_ICON},
  sofa: {label: 'Sofa', icon: Icons.IconChairSelectd || DEFAULT_ICON},
  guong: {label: 'Gương', icon: Icons.IconGuongSelectd || DEFAULT_ICON},
  remCua: {label: 'Rèm cửa', icon: Icons.IconCurtainsSelectd || DEFAULT_ICON},
  doGiaDung: {label: 'Đồ gia dụng', icon: Icons.IconDoGiaDungDefault|| DEFAULT_ICON},
  chanGaGoi: {label: 'Chăn ga gối', icon: Icons.IconBlanketSelectd || DEFAULT_ICON},
  khac: {label: 'Khác', icon: DEFAULT_ICON},
};

// Mapping cho service options với icons thật
export const serviceMapping = {
  electricity: { label: 'Điện', icon: Icons.IconElectricalDefault || DEFAULT_ICON },
  water: { label: 'Nước', icon: Icons.IconWarterDropDefault || DEFAULT_ICON },
  cleaning: { label: 'Dịch vụ', icon: Icons.IconServiceDefault || DEFAULT_ICON },
  parking: { label: 'Gửi xe', icon: Icons.IconSacXeSelectd || DEFAULT_ICON },
  internet: { label: 'Internet', icon: Icons.IconWifiSelectd || DEFAULT_ICON },
  elevator: { label: 'Thang máy', icon: Icons.IconThangMaySelectd || DEFAULT_ICON },
  security: { label: 'Bảo vệ', icon: Icons.IconSecuritySelectd || DEFAULT_ICON },
  wifi: { label: 'Wifi', icon: Icons.IconWifiSelectd || DEFAULT_ICON },
  pet: { label: 'Nuôi pet', icon: Icons.IconPetSelectd || DEFAULT_ICON },
  other: { label: 'Khác', icon: DEFAULT_ICON },
};

// Mapping cho amenities options với icons thật
export const amenitiesMapping: Record<string, {label: string; icon: string}> = {
  vsKhepKin: {label: 'Vệ sinh khép kín', icon: Icons.IconToiletSelectd || DEFAULT_ICON},
  vsChung: {label: 'Vệ sinh chung', icon: Icons.IconToiletSelectd || DEFAULT_ICON},
  gacXep: {label: 'Gác xép', icon: Icons.IconGacXepSelectd || DEFAULT_ICON},
  banCong: {label: 'Ban công', icon: Icons.IconRoomsBalconySelectd || DEFAULT_ICON},
  thangMay: {label: 'Thang máy', icon: Icons.IconThangMaySelectd || DEFAULT_ICON},
  baoVe247: {label: 'Bảo vệ 24/7', icon: Icons.IconSecuritySelectd || DEFAULT_ICON},
  guiXeDien: {label: 'Gửi xe điện', icon: Icons.IconSacXeSelectd || DEFAULT_ICON},
  guiXeMay: {label: 'Gửi xe máy', icon: Icons.IconSacXeSelectd || DEFAULT_ICON},
  guiXeOto: {label: 'Gửi xe ô tô', icon: Icons.IconSacXeSelectd || DEFAULT_ICON},
  nuoiPet: {label: 'Nuôi pet', icon: Icons.IconPetSelectd || DEFAULT_ICON},
  gioLinhHoat: {label: 'Giờ linh hoạt', icon: Icons.IconAccessTimeSelectd || DEFAULT_ICON},
  khongChungChu: {
    label: 'Không chung chủ',
    icon: Icons.IconPersonSelectd || DEFAULT_ICON,
  },
  raVaoVanTay: {label: 'Ra vào vân tay', icon: Icons.IconSecuritySelectd || DEFAULT_ICON},
  wifiFree: {label: 'Wifi miễn phí', icon: Icons.IconWifiSelectd || DEFAULT_ICON},
  wifiTraPhi: {label: 'Wifi trả phí', icon: Icons.IconWifiSelectd || DEFAULT_ICON},
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
