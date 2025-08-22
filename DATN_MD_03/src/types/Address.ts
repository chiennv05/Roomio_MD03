export interface Province {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code: number;
  districts: District[];
}

export interface District {
  name: string;
  code: number;
  cityCode: number;
  cityName: string;
}

export interface Ward {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  district_code: number;
}

export interface SelectedAddress {
  province?: Province;
  district?: District;
  ward?: Ward;
}

// Danh sách mã thành phố chính dùng trong app (Hà Nội, Đà Nẵng, TP.HCM)
export type MainCityCode = '01' | '48' | '79';
export const MAIN_CITY_CODES: readonly MainCityCode[] = [
  '01',
  '48',
  '79',
] as const;
export const MAIN_CITY_ORDER: readonly MainCityCode[] = MAIN_CITY_CODES;

// Kiểu dữ liệu response thô từ API location
export interface RawProvince {
  _id: string;
  code: string; // mã tỉnh/thành (chuỗi)
  name: string;
  level: string; // ví dụ: "Thành phố Trung ương" | "Tỉnh"
}

export interface RawDistrict {
  code: string; // mã quận/huyện (chuỗi)
  name: string;
  level: string; // ví dụ: "Quận" | "Huyện" | "Thị xã"
}
