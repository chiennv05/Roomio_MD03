export type NotificationType = 'heThong' | 'thanhToan' | 'hopDong' | 'hoTro';
export type NotificationStatus = 'unread' | 'read';

export interface Notification {
  _id?: string;
  userId: string;
  contractId?: string;
  type: NotificationType;
  content: string;
  status: NotificationStatus;
  rentRequestData?: {
    roomId: string;
    tenantId: string;
    message: string;
    requestDate: string;
  };
  billData?: {
    invoiceId: string;
    amount: number;
    dueDate: string;
    status: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
