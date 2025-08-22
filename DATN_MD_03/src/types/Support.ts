export type SupportStatus = 'mo' | 'dangXuLy' | 'hoanTat';
export type SupportPriority = 'thap' | 'trungBinh' | 'cao' | 'khanan';
export type SupportCategory =
  | 'kyThuat'
  | 'thanhToan'
  | 'hopDong'
  | 'goiDangKy'
  | 'khac';

export interface SupportMessage {
  _id?: string;
  sender: 'admin' | 'user';
  message: string;
  createdAt?: string;
}

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
      };
  priority: SupportPriority;
  category: SupportCategory;
  messages?: SupportMessage[];
  processedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
