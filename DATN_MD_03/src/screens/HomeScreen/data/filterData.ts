export interface CheckboxItem {
  id: string;
  label: string;
}

export const FURNITURE_ITEMS: CheckboxItem[] = [
  { id: 'dieu_hoa', label: 'Điều hòa' },
  { id: 'nong_lanh', label: 'Nóng lạnh' },
  { id: 'ke_bep', label: 'Kệ bếp' },
  { id: 'tu_lanh', label: 'Tủ lạnh' },
  { id: 'giuong_ngu', label: 'Giường ngủ' },
  { id: 'may_giat', label: 'Máy giặt' },
  { id: 'do_gia_dung', label: 'Đồ gia dụng' },
  { id: 'ban_ghe', label: 'Bàn ghế' },
  { id: 'chan_ga_goi', label: 'Chăn ga gối' },
  { id: 'quat_tran', label: 'Quạt trần' },
  { id: 'rem', label: 'Rèm' },
  { id: 'sofa', label: 'Sofa' },
  { id: 'guong_toan_than', label: 'Gương toàn thân' },
];

export const AMENITY_ITEMS: CheckboxItem[] = [
  { id: 've_sinh_khep_kin', label: 'Vệ sinh khép kín' },
  { id: 'gac_xep', label: 'Gác xép' },
  { id: 'ban_cong', label: 'Ban công' },
  { id: 'thang_may', label: 'Thang máy' },
  { id: 'nuoi_pet', label: 'Nuôi pet' },
  { id: 'gio_linh_hoat', label: 'Giờ linh hoạt' },
  { id: 'gui_xe_dien', label: 'Gửi xe điện' },
  { id: 'khong_chung_chu', label: 'Không chung chủ' },
  { id: 'ra_vao_van_tay', label: 'Ra vào vân tay' },
  { id: 'khac', label: 'Khác' },
]; 