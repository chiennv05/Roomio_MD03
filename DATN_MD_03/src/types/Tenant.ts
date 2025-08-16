import {Contract} from './Contract';

export interface CoTenant {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  identityNumber: string;
  birthDate: string | null;
  isRegistered: boolean;
}

export interface TenantRoom {
  roomId: string;
  roomNumber: string;
  photo: string;
}

export interface Tenant {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  contractId: string;
  contractStatus: 'active' | 'pending' | 'expired' | 'needs_resigning';
  contractStartDate: string;
  contractEndDate: string;
  monthlyRent: number;
  room: TenantRoom;
  tenantCount: number;
  coTenants: CoTenant[];
}

export interface TenantDetail {
  _id: string;
  username: string;
  email: string;
  status: string;
  createdAt: string;
  birthDate: string;
  fullName: string;
  identityNumber: string;
  phone: string;
  address: string;
  avatar: string | null;
}

export interface ContractHistoryItem {
  _id: string;
  status: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  createdAt: string;
  room: TenantRoom;
  tenantCount: number;
  coTenants: CoTenant[];
}

export interface TenantDetailResponse {
  success: boolean;
  message: string;
  data: {
    tenant: TenantDetail;
    activeContract: Contract | null;
    contractHistory: ContractHistoryItem[];
    totalContracts: number;
  };
}

export interface TenantsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface TenantsApiResponse {
  success: boolean;
  message: string;
  data: {
    tenants: Tenant[];
    pagination: TenantsPagination;
  };
}

export interface TenantState {
  tenants: Tenant[];
  loading: boolean;
  error: string | null;
  pagination: TenantsPagination | null;

  // Chi tiết người thuê
  selectedTenant: TenantDetail | null;
  activeContract: Contract | null;
  contractHistory: ContractHistoryItem[];
  totalContracts: number;
  detailLoading: boolean;
  detailError: string | null;
}

export interface TenantFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}
