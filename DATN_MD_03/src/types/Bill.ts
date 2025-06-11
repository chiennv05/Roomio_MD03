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
