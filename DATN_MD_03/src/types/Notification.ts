export type NotificationType = 'heThong' | 'thanhToan' | 'hopDong' | 'hoTro' | 'lichXemPhong';
export type NotificationStatus = 'unread' | 'read';

export interface RentRequestData {
  tenantInfo?: {
    fullName: string;
    phone: string;
    identityNumber: string;
    email: string;
    birthDate: string;
  };
  roomId?: string;
  tenantId?: string;
  message: string;
  requestDate: string;
}

export interface BillData {
  isPaid: boolean;
  needConfirmation: boolean;
}

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  content: string;
  status: NotificationStatus;
  rentRequestData: RentRequestData;
  billData: BillData;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  data: {
    notifications: Notification[];
    pagination: NotificationPagination;
    unreadCount: number;
  };
}

export interface NotificationState {
  loading: boolean;
  notifications: Notification[];
  pagination: NotificationPagination | null;
  unreadCount: number;
  error: string | null;
  refreshing: boolean;
  loadingMore: boolean;
}
