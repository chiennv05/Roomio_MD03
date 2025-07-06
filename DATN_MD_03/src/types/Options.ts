export type OptionCategory =
  | 'electronics' // Đồ điện tử
  | 'roomItems' // Nội thất phòng
  | 'household' // Đồ gia dụng
  | 'others' // Khác
  | 'sanitation' // Vệ sinh
  | 'space' // Không gian
  | 'building' // Tiện ích tòa nhà
  | 'parking' // Gửi xe
  | 'rules' // Quy định
  | 'internet'; // Internet

export interface OptionItem {
  value: string; // ví dụ: "dieuHoa"
  label: string; // ví dụ: "Điều hòa"
  category: OptionCategory;
  iconBase: string; // ví dụ: "IconDieuHoa"
}

export interface OptionsGroup {
  options: OptionItem[];
  categories: Record<OptionCategory, string>;
}

export interface FilterOptionsData {
  furniture: OptionsGroup;
  amenities: OptionsGroup;
}
