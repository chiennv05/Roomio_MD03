import {CustomService} from './Room';

export type ContractStatus =
  | 'draft'
  | 'pending_signature'
  | 'pending_approval'
  | 'active'
  | 'needs_resigning'
  | 'expired'
  | 'terminated'
  | 'rejected';

export interface CoTenant {
  _id: string;
  userId: string;
  username: string;
  phone: string;
  email: string;
  birthDate: string | null;
  identityNumber: string;
  address: string;
}

export interface ServiceFees {
  electricity: number;
  water: number;
}

export interface ServiceFeeConfig {
  electricity: string;
  water: string;
}

export interface ContractInfo {
  serviceFees: ServiceFees;
  serviceFeeConfig: ServiceFeeConfig;
  tenantName: string;
  tenantPhone: string;
  tenantIdentityNumber: string;
  tenantEmail: string;
  tenantBirthDate: string;
  tenantAddress: string;
  landlordName: string;
  landlordPhone: string;
  landlordIdentityNumber: string;
  landlordBirthDate: string;
  landlordAddress: string;
  roomNumber: string;
  roomAddress: string;
  roomArea: number;
  monthlyRent: number;
  deposit: number;
  maxOccupancy: number;
  furniture: string[];
  amenities: string[];
  startDate: string;
  endDate: string;
  contractTerm: number;
  customServices: CustomService[];
  tenantCount: number;
  coTenants: CoTenant[];
  rules: string;
  additionalTerms: string;
}

export interface ContractApproval {
  approved: boolean;
  approvedBy: string;
  approvedAt: string;
  notes: string;
  rejectionReason: string;
}

<<<<<<< HEAD
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
=======
export interface StatusHistoryItem {
  _id: string;
  status: ContractStatus;
  date: string;
  note: string;
>>>>>>> origin/chien
}

export interface RoomLocation {
  coordinates: {
    type: string;
    coordinates: [number, number];
  };
  servicePrices: ServiceFees;
  servicePriceConfig: ServiceFeeConfig;
  addressText: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  houseNo: string;
  customServices: CustomService[];
  _id: string;
}

export interface Room {
  _id: string;
  roomNumber: string;
  photos: string[];
  location: RoomLocation;
}

export interface UserInfo {
  _id: string;
  username: string;
  fullName: string;
  phone: string;
}

export interface Contract {
  _id: string;
  contractInfo: ContractInfo;
  approval: ContractApproval;
  roomId: Room;
  tenantId: UserInfo;
  landlordId: UserInfo;
  status: ContractStatus;
  contractPdfUrl: string;
  contractPdfUrlFilename: string;
  signedContractImages: string[];
  statusHistory: StatusHistoryItem[];
  sourceNotificationId: string;
  updateHistory: any[]; // Nếu có định dạng cụ thể, bạn có thể khai báo chi tiết hơn
  createdAt: string;
  updatedAt: string;
  __v: number;
  previousStatus?: ContractStatus;
}
export type CreateContractPayload = {
  notificationId: string;
  contractTerm: number; // số tháng
  startDate: string; // định dạng yyyy-MM-dd
  rules: string;
  additionalTerms: string;
  coTenants?: string[]; // <-- optional
};

export interface ContractTenantResponse {
  success: boolean;
  message: string;
  data: {
    contract: {
      _id: string;
      status: string;
      startDate: string;
      endDate: string;
    };
    room: {
      roomId: string;
      roomNumber: string;
      photo: string;
    };
    tenants: {
      mainTenant: {
        _id: string;
        username: string;
        email: string;
        status: string;
        fullName: string;
        phone: string;
      };
      coTenants: CoTenant[];
      tenantCount: number;
      maxOccupancy: number;
    };
  };
}

export type UpdateContractPayload = {
  rules: string;
  additionalTerms: string;
  customServices?: CustomService[];
};
