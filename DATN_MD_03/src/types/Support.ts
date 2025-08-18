// 🎨 Beautiful Support Status Types
export type SupportStatus = 'mo' | 'dangXuLy' | 'hoanTat';

// 🎯 Priority Levels for Visual Hierarchy
export type SupportPriority = 'thap' | 'trungBinh' | 'cao' | 'khanan';

// 📂 Support Categories with Beautiful Icons
export type SupportCategory =
  | 'tatCa' // All categories
  | 'kyThuat' // Technical support
  | 'thanhToan' // Payment issues
  | 'hopDong' // Contract support
  | 'goiDangKy' // Package registration
  | 'khac'; // Other issues

// 🎨 Filter Types for Beautiful UI
export type SupportStatusFilter = 'tatCa' | 'mo' | 'dangXuLy' | 'hoanTat';
export type SupportCategoryFilter =
  | 'tatCa'
  | 'kyThuat'
  | 'thanhToan'
  | 'hopDong';

// 💬 Beautiful Message Interface
export interface SupportMessage {
  _id?: string;
  sender: 'admin' | 'user';
  message: string;
  createdAt?: string;
  isRead?: boolean;
  attachments?: string[];
}

// 🎨 Beautiful Stats Interface for Dashboard
export interface SupportStats {
  total: number;
  open: number;
  processing: number;
  completed: number;
}

// 🎯 Filter Tab Interface for Beautiful UI
export interface FilterTab {
  key: SupportStatusFilter | SupportCategoryFilter;
  label: string;
  count?: number;
  color?: string;
  isActive?: boolean;
}

// 🎨 Beautiful Action Button Interface
export interface SupportAction {
  key: 'edit' | 'delete' | 'view' | 'respond';
  label: string;
  icon: string;
  color: string;
  backgroundColor: string;
  onPress: () => void;
}

// 🎨 Beautiful Support Interface with Enhanced UI Data
export interface Support {
  _id?: string;
  userId: string;
  title: string;
  content: string;
  status: SupportStatus;
  adminResponse?: string;
  adminId?:
    | string
    | {
        _id: string;
        username: string;
        fullName: string;
        avatar?: string;
      };
  priority: SupportPriority;
  category: SupportCategory;
  messages?: SupportMessage[];
  processedAt?: string;
  createdAt?: string;
  updatedAt?: string;

  // 🎨 Enhanced UI Properties
  isUrgent?: boolean;
  hasUnreadMessages?: boolean;
  estimatedResponseTime?: string;
  satisfactionRating?: number;
  tags?: string[];
  attachments?: string[];

  // 🎯 Display Properties for Beautiful UI
  statusColor?: string;
  statusIcon?: string;
  priorityColor?: string;
  categoryIcon?: string;
  formattedDate?: string;
  timeAgo?: string;
}

// 🎨 Beautiful Support List Item for UI
export interface SupportListItem extends Support {
  displayTitle: string;
  displayStatus: string;
  displayCategory: string;
  displayDate: string;
  statusBadgeColor: string;
  priorityBadgeColor: string;
  canEdit: boolean;
  canDelete: boolean;
  actions: SupportAction[];
}

// 🎯 Pagination Interface for Beautiful Lists
export interface SupportPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 🎨 Beautiful Filter State Interface
export interface SupportFilterState {
  status: SupportStatusFilter;
  category: SupportCategoryFilter;
  priority?: SupportPriority;
  dateRange?: {
    start: string;
    end: string;
  };
  searchQuery?: string;
}

// 🎨 Beautiful Constants for UI
export const SUPPORT_STATUS_LABELS: Record<SupportStatus, string> = {
  mo: 'Mở',
  dangXuLy: 'Đang xử lý',
  hoanTat: 'Hoàn tất',
};

export const SUPPORT_STATUS_COLORS: Record<SupportStatus, string> = {
  mo: '#6C757D', // Gray for open
  dangXuLy: '#FFC107', // Yellow for processing
  hoanTat: '#28A745', // Green for completed
};

export const SUPPORT_CATEGORY_LABELS: Record<SupportCategory, string> = {
  tatCa: 'Tất cả',
  kyThuat: 'Kỹ thuật',
  thanhToan: 'Thanh toán',
  hopDong: 'Hợp đồng',
  goiDangKy: 'Gói đăng ký',
  khac: 'Khác',
};

export const SUPPORT_PRIORITY_LABELS: Record<SupportPriority, string> = {
  thap: 'Thấp',
  trungBinh: 'Trung bình',
  cao: 'Cao',
  khanan: 'Khẩn cấp',
};

export const SUPPORT_PRIORITY_COLORS: Record<SupportPriority, string> = {
  thap: '#28A745', // Green for low
  trungBinh: '#17A2B8', // Blue for medium
  cao: '#FFC107', // Yellow for high
  khanan: '#DC3545', // Red for urgent
};

// 🎯 Beautiful Filter Options
export const STATUS_FILTER_OPTIONS: FilterTab[] = [
  {key: 'tatCa', label: 'Tất cả', color: '#84CC16'},
  {key: 'mo', label: 'Mở', color: '#6C757D'},
  {key: 'dangXuLy', label: 'Đang xử lý', color: '#FFC107'},
  {key: 'hoanTat', label: 'Hoàn tất', color: '#28A745'},
];

export const CATEGORY_FILTER_OPTIONS: FilterTab[] = [
  {key: 'tatCa', label: 'Tất cả', color: '#84CC16'},
  {key: 'kyThuat', label: 'Kỹ thuật', color: '#17A2B8'},
  {key: 'thanhToan', label: 'Thanh toán', color: '#FFC107'},
  {key: 'hopDong', label: 'Hợp đồng', color: '#6F42C1'},
];

// 🎨 Beautiful Icons for Categories
export const SUPPORT_CATEGORY_ICONS: Record<SupportCategory, string> = {
  tatCa: 'apps',
  kyThuat: 'build',
  thanhToan: 'payment',
  hopDong: 'description',
  goiDangKy: 'card_membership',
  khac: 'help_outline',
};

// 🎯 Response Templates for Beautiful UI
export interface SupportResponseTemplate {
  id: string;
  title: string;
  content: string;
  category: SupportCategory;
  isQuickReply: boolean;
}

// 🎨 Beautiful Form Validation
export interface SupportFormErrors {
  title?: string;
  content?: string;
  category?: string;
  priority?: string;
}

// 🎯 Beautiful Loading States
export interface SupportLoadingState {
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isLoadingMore: boolean;
}

// 🎨 Beautiful Sort Options
export type SupportSortField =
  | 'createdAt'
  | 'updatedAt'
  | 'priority'
  | 'status';
export type SortDirection = 'asc' | 'desc';

export interface SupportSortOption {
  field: SupportSortField;
  direction: SortDirection;
  label: string;
}
