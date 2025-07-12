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

export interface StatusHistoryItem {
  _id: string;
  status: ContractStatus;
  date: string;
  note: string;
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
