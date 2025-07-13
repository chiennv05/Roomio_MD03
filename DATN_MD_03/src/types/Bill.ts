export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue' | 'canceled' | 'pending_confirmation' | 'pending';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'momo' | 'vnpay' | 'zalopay';

export interface Invoice {
  _id?: string;
  id?: string;
  contractId: any; // Có thể là string hoặc object với nhiều thông tin
  roomId: any; // Có thể là string hoặc object với nhiều thông tin
  tenantId: any; // Có thể là string hoặc object với thông tin người thuê
  landlordId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate?: string;
  dueDate: string;
  paymentDate?: string;
  paidAmount?: number;
  subtotal: number;
  totalAmount: number;
  note?: string;
  period?: string | { month: number; year: number }; // API trả về có thể là chuỗi hoặc object
  paymentMethod?: PaymentMethod;
  notified: boolean;
  items?: InvoiceItem[];
  createdAt?: string;
  updatedAt?: string;
  month?: number; // Tháng của hóa đơn
  year?: number; // Năm của hóa đơn
  paidAt?: string; // Thời điểm đánh dấu đã thanh toán
  isRoommate?: boolean; // Đánh dấu đây là hóa đơn của người ở cùng
}

export interface InvoiceItem {
  _id?: string;
  invoiceId: string;
  serviceTypeId?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  previousReading?: number;
  currentReading?: number;
  type: 'fixed' | 'variable' | 'one_off';
  isRecurring: boolean;
  category: 'rent' | 'utility' | 'service' | 'maintenance' | 'other';
  isPerPerson: boolean;
  personCount?: number;
  paymentStatus?: 'pending' | 'paid' | 'partial';
  templateId?: string;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

// Legacy Bill type for backward compatibility
export type BillStatus = 'pending' | 'paid' | 'overdue';
export type BillType = 'rent' | 'electric' | 'water' | 'other';

export interface Bill {
  roomId: string;
  landlordId: string;
  tenantId: string;
  contractId: string;
  billType: BillType;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status: BillStatus;
  description: string;
  receiptImage?: string;
  periodStart: string;
  periodEnd: string;
  meterReadingStart?: number;
  meterReadingEnd?: number;
  unitPrice?: number;
  paymentMethod?: string;
  paymentReference?: string;
}
