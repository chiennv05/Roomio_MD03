export type NotificationType = 'heThong' | 'thanhToan' | 'hopDong' | 'hoTro';
export type NotificationStatus = 'unread' | 'read';

export interface Notification {
  userId: string;
  contractId?: string;
  type: NotificationType;
  content: string;
  status: NotificationStatus;
  rentRequestData?: any;
  billData?: any;
}
