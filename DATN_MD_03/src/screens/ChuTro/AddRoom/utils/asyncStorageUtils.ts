import AsyncStorage from '@react-native-async-storage/async-storage';

import {ItemSeviceOptions} from '.././utils/seviceOptions';
import {
  ServicePrices,
  ServicePriceConfig,
  CustomService,
} from '../../../../types';
import {ImageUploadResult} from '../../../../types/ImageUploadResult';

// Định nghĩa interface cho dữ liệu form
interface FormData {
  roomNumber: string;
  area: number | '';
  addressText: string;
  description: string;
  maxOccupancy: number | '';
  amenities: string[];
  furniture: string[];
  image: ImageUploadResult[];
  rentPrice: number | '';
  displayRentPrice: string;
  imageArr: string[];
  coordinates: [number, number] | null;
  address: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  houseNo: string;
  serviceOptionList: ItemSeviceOptions[];
  servicePrices: ServicePrices;
  servicePriceConfig: ServicePriceConfig;
  customServices: CustomService[];
}

// Lưu dữ liệu form vào AsyncStorage
export const saveFormDataToStorage = async (
  formData: FormData,
): Promise<void> => {
  try {
    await AsyncStorage.setItem('addRoomFormData', JSON.stringify(formData));
  } catch (e) {
    throw new Error('Không thể lưu dữ liệu vào AsyncStorage');
  }
};

export const getFormDataFromStorage = async (): Promise<FormData | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem('addRoomFormData');
    return jsonValue != null ? (JSON.parse(jsonValue) as FormData) : null;
  } catch (e) {
    throw new Error('Không thể lấy dữ liệu từ AsyncStorage');
  }
};

// Xóa dữ liệu form khỏi AsyncStorage
export const clearFormDataFromStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('addRoomFormData');
  } catch (e) {
    throw new Error('Không thể xóa dữ liệu khỏi AsyncStorage');
  }
};
