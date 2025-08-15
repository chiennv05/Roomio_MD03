import {CustomService} from './Room';

export type ContractStatus =
  | 'draft'
  | 'pending_signature'
  | 'pending_approval'
  | 'active'
  | 'needs_resigning'
  | 'expired'
  | 'terminated'
  | 'rejected'
  | 'cancelled';

export interface CoTenant {
  _id: string;
  userId: string;
  username: string;
  phone: string;
  email: string;
  birthDate: string | null;
  identityNumber: string;
  address: string;
  fullName: string;
}

export interface ServiceFees {
  electricity: number;
  water: number;
}

export interface ServiceFeeConfig {
  electricity: 'perRoom' | 'perPerson' | 'perUsage';
  water: 'perRoom' | 'perPerson' | 'perUsage';
}

export interface ContractInfo {
  serviceFees: ServiceFees;
  serviceFeeConfig: ServiceFeeConfig;
  tenantName: string;
  tenantPhone: string;
  tenantIdentityNumber: string;
  tenantEmail: string;
  tenantBirthDate: string;
  tenantAddress?: string;
  landlordName: string;
  landlordPhone: string;
  landlordIdentityNumber: string;
  landlordBirthDate?: string;
  landlordAddress?: string;
  propertyDocument?: string;
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
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  rejectionReason?: string;
}

export interface StatusHistoryItem {
  _id?: string;
  status: ContractStatus;
  date: string;
  note?: string;
}

export interface UpdateHistoryItem {
  date: string;
  action:
    | 'created'
    | 'signed'
    | 'approved'
    | 'resigned'
    | 'updated'
    | 'terminated'
    | 'expired';
  userId?: string;
  note?: string;
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
  previousStatus?: ContractStatus;
  contractPdfUrl?: string;
  contractPdfUrlFilename?: string;
  signedContractImages?: string[];
  statusHistory?: StatusHistoryItem[];
  updateHistory?: UpdateHistoryItem[];
  sourceNotificationId?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export type CreateContractPayload = {
  notificationId: string;
  contractTerm: number; // số tháng
  startDate: string; // định dạng yyyy-MM-dd
  rules: string;
  additionalTerms: string;
  coTenants?: string[]; // <-- optional
};
export type CreateContractPayloadWithoutNotification = {
  roomId: string;
  tenantUsername: string;
  coTenants: string[];
  contractTerm: number; // số tháng hoặc kỳ hạn, bạn có thể đổi thành enum nếu cần
  startDate: string; // định dạng yyyy-MM-dd
  rules: string;
  additionalTerms: string;
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
