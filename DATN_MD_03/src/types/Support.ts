export type SupportStatus = 'mo' | 'dangXuLy' | 'hoanTat';
export type SupportPriority = 'thap' | 'trungBinh' | 'cao' | 'khanan';
export type SupportCategory = 'kyThuat' | 'thanhToan' | 'hopDong' | 'khac';

export interface Support {
  userId: string;
  title: string;
  content: string;
  status: SupportStatus;
  adminResponse?: string;
  adminId?: string;
  priority: SupportPriority;
  category: SupportCategory;
  processedAt?: string;
}
