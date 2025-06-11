export type CostType = 'thu' | 'chi';
export type CostCategory =
  | 'suaChua'
  | 'baoTri'
  | 'vatTu'
  | 'dichVu'
  | 'tienPhong'
  | 'tienCoc'
  | 'phat'
  | 'khac';

export type CostStatus = 'daXacNhan' | 'choXacNhan';

export interface CostRecord {
  roomId: string;
  createdBy: string;
  type: CostType;
  category: CostCategory;
  costName: string;
  description: string;
  amount: number;
  incurredAt: string;
  attachments?: string[];
  contractId?: string;
  status: CostStatus;
  note?: string;
}
