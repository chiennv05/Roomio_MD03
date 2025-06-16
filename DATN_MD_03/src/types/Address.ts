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