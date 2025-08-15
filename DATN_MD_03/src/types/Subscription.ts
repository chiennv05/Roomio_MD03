export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'vip' | string;

export type SubscriptionStatus =
  | 'pending'
  | 'active'
  | 'rejected'
  | 'expired'
  | 'cancelled'
  | string;

export interface BankSnapshot {
  bankBin?: string;
  accountNumber?: string;
  bankName?: string;
  accountHolder?: string;
}

export interface SubscriptionRecord {
  _id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  paymentMethod?: 'bank_transfer' | string;
  expectedAmount?: number;
  transferNote?: string;
  qrUrl?: string;
  bankSnapshot?: BankSnapshot;
  createdAt: string;
  updatedAt?: string;
  startAt?: string;
  endAt?: string;
}

export interface SubscriptionsResponse {
  success: boolean;
  subscriptions: SubscriptionRecord[];
}

export interface SubscriptionPlanItem {
  _id: string;
  key: string; // e.g., 'free', 'pro', 'business'
  name: string;
  price: number; // VND
  currency: string; // 'VND'
  durationDays: number | null; // null for unlimited
  maxActiveRooms: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Dùng cho UI để hiển thị hướng chuyển gói: "from → to"
export interface PlanRouteLabel {
  from: string; // ví dụ: 'Pro Plan'
  to: string; // ví dụ: 'Family'
}

export interface BankInfo {
  bankBin: string;
  accountNumber: string;
  bankName: string;
  accountHolder: string;
  transferNoteTemplate: string; // e.g., 'ROOMIO APP + {username}'
}

export interface PlansResponse {
  success: boolean;
  plans: SubscriptionPlanItem[];
  bankInfo: BankInfo;
}

// Báo giá nâng cấp
export interface UpgradeQuoteResponse {
  success: boolean;
  expectedAmount: number; // số tiền cần thanh toán khi nâng cấp
  currency: string; // 'VND'
  plan: string; // key gói mục tiêu (vd: 'family')
  planName: string; // tên gói mục tiêu
  qrUrl?: string;
  transferNote?: string;
  bankInfo: BankInfo;
}

// Dữ liệu quote lưu trong state
export interface UpgradeQuote {
  expectedAmount: number | null;
  currency?: string;
  plan?: string;
  planName?: string;
  qrUrl?: string;
  transferNote?: string;
}

export type QuotesByPlan = Record<string, UpgradeQuote>;

// Redux state shape cho subscription
export interface SubscriptionState {
  loading: boolean;
  error: string | null;
  current: SubscriptionRecord | null;
  items?: SubscriptionRecord[]; // toàn bộ lịch sử
  pending?: SubscriptionRecord | null; // yêu cầu nâng cấp đang chờ
  plans: SubscriptionPlanItem[];
  bankInfo: BankInfo | null;
  quote: UpgradeQuote | null;
  quotesByPlan: QuotesByPlan;
  // Lưu response gần nhất khi tạo yêu cầu nâng cấp để debug/hiển thị
  lastUpgradeRequest?: any;
}
