import {SupportCategory, SupportPriority, SupportStatus} from '../types/Support';

/**
 * Utility functions for Support module
 */

// Get category display text
export const getCategoryText = (category: SupportCategory): string => {
  switch (category) {
    case 'kyThuat':
      return 'Kỹ thuật';
    case 'thanhToan':
      return 'Thanh toán';
    case 'hopDong':
      return 'Hợp đồng';
    case 'goiDangKy':
      return 'Gói đăng ký';
    case 'khac':
      return 'Khác';
    default:
      return 'Không xác định';
  }
};

// Get priority display text
export const getPriorityText = (priority: SupportPriority): string => {
  switch (priority) {
    case 'thap':
      return 'Thấp';
    case 'trungBinh':
      return 'Trung bình';
    case 'cao':
      return 'Cao';
    case 'khanan':
      return 'Khẩn cấp';
    default:
      return 'Không xác định';
  }
};

// Get status display text
export const getStatusText = (status: SupportStatus): string => {
  switch (status) {
    case 'mo':
      return 'Mở';
    case 'dangXuLy':
      return 'Đang xử lý';
    case 'hoanTat':
      return 'Hoàn tất';
    default:
      return 'Không xác định';
  }
};

// Category options for dropdowns and filters
export const CATEGORY_OPTIONS = [
  {key: 'kyThuat', value: 'kyThuat' as SupportCategory, label: 'Kỹ thuật'},
  {key: 'thanhToan', value: 'thanhToan' as SupportCategory, label: 'Thanh toán'},
  {key: 'hopDong', value: 'hopDong' as SupportCategory, label: 'Hợp đồng'},
  {key: 'goiDangKy', value: 'goiDangKy' as SupportCategory, label: 'Gói đăng ký'},
  {key: 'khac', value: 'khac' as SupportCategory, label: 'Khác'},
];

// Priority options for dropdowns
export const PRIORITY_OPTIONS = [
  {key: 'thap', value: 'thap' as SupportPriority, label: 'Thấp'},
  {key: 'trungBinh', value: 'trungBinh' as SupportPriority, label: 'Trung bình'},
  {key: 'cao', value: 'cao' as SupportPriority, label: 'Cao'},
  {key: 'khanan', value: 'khanan' as SupportPriority, label: 'Khẩn cấp'},
];

// Status options for filters
export const STATUS_OPTIONS = [
  {key: 'mo', value: 'mo' as SupportStatus, label: 'Mở'},
  {key: 'dangXuLy', value: 'dangXuLy' as SupportStatus, label: 'Đang xử lý'},
  {key: 'hoanTat', value: 'hoanTat' as SupportStatus, label: 'Hoàn tất'},
];

// Filter category options (with "Tất cả" option)
export const FILTER_CATEGORY_OPTIONS = [
  {key: '', label: 'Tất cả'},
  ...CATEGORY_OPTIONS,
];

// Filter status options (with "Tất cả" option)
export const FILTER_STATUS_OPTIONS = [
  {key: '', label: 'Tất cả'},
  ...STATUS_OPTIONS,
];

// Get priority color and background
export const getPriorityInfo = (priority: SupportPriority) => {
  switch (priority) {
    case 'thap':
      return {
        color: '#10B981', // Green
        bgColor: '#D1FAE5',
      };
    case 'trungBinh':
      return {
        color: '#F59E0B', // Yellow
        bgColor: '#FEF3C7',
      };
    case 'cao':
      return {
        color: '#EF4444', // Red
        bgColor: '#FEE2E2',
      };
    case 'khanan':
      return {
        color: '#DC2626', // Dark Red
        bgColor: '#FECACA',
      };
    default:
      return {
        color: '#6B7280', // Gray
        bgColor: '#F3F4F6',
      };
  }
};

// Get status color and background
export const getStatusInfo = (status: SupportStatus) => {
  switch (status) {
    case 'mo':
      return {
        color: '#3B82F6', // Blue
        bgColor: '#DBEAFE',
      };
    case 'dangXuLy':
      return {
        color: '#F59E0B', // Yellow
        bgColor: '#FEF3C7',
      };
    case 'hoanTat':
      return {
        color: '#10B981', // Green
        bgColor: '#D1FAE5',
      };
    default:
      return {
        color: '#6B7280', // Gray
        bgColor: '#F3F4F6',
      };
  }
};
