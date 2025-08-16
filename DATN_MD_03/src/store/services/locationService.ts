import api from '../../api/api';
import {
  Province,
  District,
  MAIN_CITY_CODES,
  RawDistrict,
  RawProvince,
  Ward,
} from '../../types/Address';

// API endpoints: sử dụng BASE_URL từ configs để dễ đổi IP duy nhất
import {API_CONFIG} from '../../configs';
const BASE_LOCATION_URL = `${API_CONFIG.BASE_URL}/api/locations`;

// Định nghĩa RawProvince/RawDistrict đã được đặt trong types/Address.ts để tái sử dụng

export async function fetchCitiesOnly(): Promise<Province[]> {
  const url = `${BASE_LOCATION_URL}/provinces`;
  const res = await api.get<RawProvince[]>(url, {timeout: 8000});

  if ('isError' in res) {
    throw {message: res.message, status: res.status};
  }

  // Chỉ giữ 3 thành phố chính theo yêu cầu (sử dụng từ types để dễ thay đổi)
  const ALLOWED = new Set(MAIN_CITY_CODES as readonly string[]);

  const provinces = (res.data || [])
    .filter(p => ALLOWED.has(p.code))
    .map<Province>(p => ({
      name: p.name,
      code: Number(p.code),
      division_type: p.level || 'Thành phố',
      codename: '',
      phone_code: 0,
      districts: [],
    }))
    // Sắp xếp theo thứ tự mong muốn
    .sort((a, b) => {
      const order = MAIN_CITY_CODES as readonly string[];
      return (
        order.indexOf(String(a.code).padStart(2, '0')) -
        order.indexOf(String(b.code).padStart(2, '0'))
      );
    });

  return provinces;
}

export async function fetchDistrictsByProvince(
  provinceCode: number,
  provinceName?: string,
): Promise<District[]> {
  const codeStr = String(provinceCode).padStart(2, '0');
  const url = `${BASE_LOCATION_URL}/provinces/${codeStr}/districts`;
  const res = await api.get<RawDistrict[]>(url, {timeout: 8000});

  if ('isError' in res) {
    throw {message: res.message, status: res.status};
  }

  const districts = (res.data || []).map<District>(d => ({
    name: d.name,
    code: Number(d.code),
    cityCode: provinceCode,
    cityName: provinceName || '',
  }));

  return districts;
}
export async function fetchWardsByDistrict(
  districtCode: number,
): Promise<Ward[]> {
  const codeStr = String(districtCode).padStart(3, '0');
  console.log('fetchWardsByDistrict codeStr:', codeStr);
  const url = `${BASE_LOCATION_URL}/districts/${codeStr}/wards`;
  console.log(url);
  const res = await api.get<Ward[]>(url, {timeout: 8000});

  if ('isError' in res) {
    throw {message: res.message, status: res.status};
  }

  console.log('res', res);

  const wards = (res.data || []).map<Ward>(w => ({
    name: w.name,
    code: Number(w.code),
    division_type: w.division_type,
    codename: w.codename,
    district_code: districtCode,
  }));

  return wards;
}
