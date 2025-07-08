// ====== Trạng thái hợp đồng ======
export type ContractStatus =
  | 'draft' // Bản nháp
  | 'pending_signature' // Chờ ký
  | 'pending_approval' // Chờ duyệt
  | 'active' // Đang hiệu lực
  | 'needs_resigning' // Cần ký lại
  | 'expired' // Hết hạn
  | 'terminated' // Đã chấm dứt
  | 'rejected'; // Bị từ chối

// ====== Phí dịch vụ cơ bản ======
export interface ServiceFees {
  electricity: number; // Giá điện
  water: number; // Giá nước
}

// ====== Cấu hình hiển thị phí dịch vụ ======
export interface ServiceFeeConfig {
  electricity: string; // Đơn vị hoặc mô tả phí điện
  water: string; // Đơn vị hoặc mô tả phí nước
}

// ====== Dịch vụ tùy chỉnh thêm ======
export interface CustomService {
  name: string; // Tên dịch vụ
  price: number; // Giá
  type: string; // Loại dịch vụ (theo cách phân loại của bạn)
  description?: string; // Mô tả thêm (tuỳ chọn)
}

// ====== Người ở ghép (đồng thuê) ======
export interface CoTenant {
  userId: string;
  username: string;
  fullName: string;
  phone: string;
  email: string;
  birthDate: string;
  identityNumber: string;
  address: string;
}

// ====== Thông tin chi tiết hợp đồng ======
export interface ContractInfo {
  // --- Người thuê ---
  tenantName: string;
  tenantPhone: string;
  tenantIdentityNumber: string;
  tenantEmail: string;
  tenantBirthDate: string;
  tenantAddress: string;

  // --- Chủ trọ ---
  landlordName: string;
  landlordPhone: string;
  landlordIdentityNumber: string;
  landlordBirthDate: string;
  landlordAddress: string;

  // --- Thông tin phòng ---
  propertyDocument: string; // Giấy tờ sở hữu
  roomNumber: string;
  roomAddress: string;
  roomArea: number;
  monthlyRent: number;
  deposit: number;
  maxOccupancy: number;

  // --- Tiện nghi / Nội thất ---
  furniture: string[]; // Nội thất
  amenities: string[]; // Tiện nghi

  // --- Thời hạn hợp đồng ---
  startDate: string;
  endDate: string;
  contractTerm: string;

  // --- Phí dịch vụ ---
  serviceFees: ServiceFees;
  customServices: CustomService[];

  // --- Người thuê & ở ghép ---
  tenantCount: number;
  coTenants: CoTenant[];

  // --- Cấu hình phí dịch vụ ---
  serviceFeeConfig: ServiceFeeConfig;

  // --- Quy định hợp đồng ---
  rules: string;
  additionalTerms?: string; // Điều khoản bổ sung (nếu có)
}

// ====== Lịch sử chỉnh sửa hợp đồng ======
export interface UpdateHistoryItem {
  date: string; // Ngày chỉnh sửa
  action: string; // Hành động (VD: cập nhật thông tin, ký hợp đồng,...)
  performedBy: string; // Ai thực hiện
  note?: string; // Ghi chú thêm (nếu có)
}

// ====== Lịch sử thay đổi trạng thái ======
export interface StatusHistoryItem {
  date: string; // Ngày thay đổi
  status: ContractStatus; // Trạng thái sau khi thay đổi
  note?: string; // Ghi chú (nếu có)
}

// ====== Thông tin duyệt hợp đồng ======
export interface ContractApproval {
  approved: boolean; // Đã duyệt hay chưa
  approvedBy?: string; // Ai duyệt
  approvedAt?: string; // Thời gian duyệt
  note?: string; // Ghi chú
  rejectionReason?: string; // Lý do từ chối (nếu có)
}

// ====== Interface chính của Hợp đồng ======
export interface Contract {
  _id?: string;
  roomId: string | {
    _id: string;
    roomNumber: string;
    photos: string[];
    location: {
      coordinates: {
        type: string;
        coordinates: number[];
      };
      servicePrices: {
        electricity: number;
        water: number;
      };
      servicePriceConfig: {
        electricity: string;
        water: string;
      };
      addressText: string;
      province: string;
      district: string;
      ward: string;
      street: string;
      houseNo: string;
      customServices: Array<{
        name: string;
        price: number;
        priceType: string;
        description: string;
        _id: string;
      }>;
      _id: string;
    };
  }; // ID phòng thuê hoặc object thông tin phòng
  tenantId: string | {
    _id: string;
    username: string;
    fullName: string;
    phone: string;
  }; // ID người thuê hoặc object thông tin người thuê
  landlordId: string | {
    _id: string;
    username: string;
    fullName: string;
    phone: string;
  }; // ID chủ phòng hoặc object thông tin chủ phòng
  contractInfo: ContractInfo; // Chi tiết hợp đồng
  status: ContractStatus; // Trạng thái hiện tại
  previousStatus?: ContractStatus; // Trạng thái trước đó (nếu có)
  updateHistory: UpdateHistoryItem[]; // Lịch sử cập nhật
  contractPdfUrl?: string; // Link file PDF hợp đồng
  contractPdfUrlFilename?: string; // Tên file PDF
  signedContractImages?: string[]; // Ảnh hợp đồng đã ký (nếu có)
  approval?: ContractApproval; // Thông tin duyệt
  statusHistory: StatusHistoryItem[]; // Lịch sử trạng thái
  createdAt?: string; // Ngày tạo
  updatedAt?: string; // Ngày cập nhật cuối
  sourceNotificationId?: string; // ID thông báo nguồn (nếu có)
}
