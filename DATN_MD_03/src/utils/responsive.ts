import {Dimensions, Platform, PixelRatio} from 'react-native';

// Lấy kích thước màn hình thiết bị hiện tại
const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Kích thước cơ sở dùng để thiết kế (ví dụ theo iPhone 14 Pro Max)
const guidelineBaseWidth = 390;
const guidelineBaseHeight = 844;

/**
 * scale: Tỷ lệ thay đổi kích thước theo chiều ngang
 * Dùng để điều chỉnh kích thước theo chiều rộng màn hình thiết bị hiện tại
 */
export const scale = (size: number) =>
  (SCREEN_WIDTH / guidelineBaseWidth) * size;

/**
 * verticalScale: Tỷ lệ thay đổi kích thước theo chiều dọc
 * Dùng để điều chỉnh kích thước theo chiều cao màn hình
 */
export const verticalScale = (size: number) =>
  (SCREEN_HEIGHT / guidelineBaseHeight) * size;

/**
 * moderateScale: Tỷ lệ thay đổi có kiểm soát
 * Kết hợp giữa kích thước gốc và scale để tạo ra kích thước phù hợp hơn, tránh quá to/nhỏ
 * factor: hệ số điều chỉnh (mặc định 0.5)
 */
export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

/**
 * responsiveFont: Tự động điều chỉnh kích thước font theo màn hình
 */
export const responsiveFont = (size: number) => moderateScale(size);

/**
 * responsiveIcon: Tự động điều chỉnh kích thước icon, hệ số lớn hơn để dễ nhìn
 */
export const responsiveIcon = (size: number) => moderateScale(size, 0.7);

/**
 * responsiveSpacing: Tự động điều chỉnh khoảng cách (margin/padding) theo kích thước màn hình
 */
export const responsiveSpacing = (size: number) => moderateScale(size, 0.6);

/**
 * isIpad: Kiểm tra xem thiết bị có phải iPad hay không (chạy iOS và kích thước lớn)
 */
export const isIpad =
  Platform.OS === 'ios' && (SCREEN_WIDTH >= 768 || SCREEN_HEIGHT >= 1024);

/**
 * isSmallDevice: Thiết bị có chiều rộng nhỏ hơn 360 (thường là các máy cũ, nhỏ)
 */
export const isSmallDevice = SCREEN_WIDTH < 360;

/**
 * isTablet: Thiết bị có chiều ngắn nhất >= 600 (Android tablet hoặc iPad)
 */
export const isTablet = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) >= 600;

/**
 * SCREEN: Đối tượng chứa thông tin màn hình hiện tại (rộng, cao, mật độ điểm ảnh)
 */
export const SCREEN = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  ratio: PixelRatio.get(),
};
