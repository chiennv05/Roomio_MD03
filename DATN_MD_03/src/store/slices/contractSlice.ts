import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {getMyContracts, getContractDetail, generateContractPDF as genContractPDF, getContractTenants} from '../services/contractApi';
import {ContractTenantResponse} from '../../types/Contract';

interface Contract {
  _id: string;
  contractInfo: {
    serviceFees: {
      electricity: number;
      water: number;
    };
    serviceFeeConfig: {
      electricity: string;
      water: string;
    };
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
    customServices: {
      name: string;
      price: number;
      priceType: string;
      description: string;
      _id: string;
    }[];
    tenantCount: number;
    coTenants: {
      userId: string;
      username: string;
      phone: string;
      email: string;
      birthDate: string | null;
      identityNumber: string;
      address: string;
      _id: string;
    }[];
    rules: string;
    additionalTerms: string;
  };
  approval: {
    approved: boolean;
    approvedBy: string;
    approvedAt: string;
    notes: string;
    rejectionReason: string;
  };
  roomId: {
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
      customServices: {
        name: string;
        price: number;
        priceType: string;
        description: string;
        _id: string;
      }[];
      _id: string;
    };
  };
  tenantId: {
    _id: string;
    username: string;
    fullName: string;
    phone: string;
  };
  landlordId: {
    _id: string;
    username: string;
    fullName: string;
    phone: string;
  };
  status: string;
  contractPdfUrl: string;
  contractPdfUrlFilename: string;
  signedContractImages: string[];
  statusHistory: {
    status: string;
    date: string;
    note: string;
    _id: string;
  }[];
  sourceNotificationId: string;
  updateHistory: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  previousStatus: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ContractState {
  contracts: Contract[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  selectedContract: Contract | null;
  selectedContractLoading: boolean;
  selectedContractError: string | null;
  contractTenants: ContractTenantResponse['data'] | null;
  contractTenantsLoading: boolean;
  contractTenantsError: string | null;
}

const initialState: ContractState = {
  contracts: [],
  pagination: null,
  loading: false,
  error: null,
  selectedContract: null,
  selectedContractLoading: false,
  selectedContractError: null,
  contractTenants: null,
  contractTenantsLoading: false,
  contractTenantsError: null,
};

// Async thunk để lấy danh sách hợp đồng
export const fetchMyContracts = createAsyncThunk(
  'contract/fetchMyContracts',
  async (
    params: {page?: number; limit?: number; status?: string} = {},
    {rejectWithValue},
  ) => {
    try {
      const response = await getMyContracts(params);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Không thể tải danh sách hợp đồng');
    }
  },
);

// Async thunk để lấy chi tiết hợp đồng
export const fetchContractDetail = createAsyncThunk(
  'contract/fetchContractDetail',
  async (contractId: string, {rejectWithValue}) => {
    try {
      const response = await getContractDetail(contractId);
      // Kiểm tra cấu trúc response đúng
      if (response.success && response.data) {
        return response;
      }
      return rejectWithValue('Cấu trúc dữ liệu trả về không hợp lệ');
    } catch (err: any) {
      return rejectWithValue(err.message || 'Không thể tải chi tiết hợp đồng');
    }
  },
);

// Async thunk để tạo file PDF hợp đồng
export const generateContractPDF = createAsyncThunk(
  'contract/generateContractPDF',
  async (contractId: string, {rejectWithValue}) => {
    try {
      const response = await genContractPDF(contractId);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Không thể tạo file PDF hợp đồng');
    }
  },
);

// Async thunks
export const fetchContractTenants = createAsyncThunk(
  'contract/fetchContractTenants',
  async (contractId: string, {rejectWithValue}) => {
    try {
      const response = await getContractTenants(contractId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const contractSlice = createSlice({
  name: 'contract',
  initialState,
  reducers: {
    clearContractErrors: state => {
      state.error = null;
      state.selectedContractError = null;
      state.contractTenantsError = null;
    },
    clearSelectedContract: (state) => {
      state.selectedContract = null;
    },
    resetContractState: () => initialState,
  },
  extraReducers: builder => {
    builder
      // Xử lý fetchMyContracts
      .addCase(fetchMyContracts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyContracts.fulfilled, (state, action) => {
        state.loading = false;
        state.contracts = action.payload.contracts;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyContracts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Xử lý fetchContractDetail
      .addCase(fetchContractDetail.pending, (state) => {
        state.selectedContractLoading = true;
        state.selectedContractError = null;
      })
      .addCase(fetchContractDetail.fulfilled, (state, action) => {
        state.selectedContractLoading = false;
        // Sửa lại phần này để phù hợp với cấu trúc response API
        state.selectedContract = action.payload.data;
      })
      .addCase(fetchContractDetail.rejected, (state, action) => {
        state.selectedContractLoading = false;
        state.selectedContractError = action.payload as string;
      })

      // Xử lý fetchContractTenants
      .addCase(fetchContractTenants.pending, state => {
        state.contractTenantsLoading = true;
        state.contractTenantsError = null;
      })
      .addCase(fetchContractTenants.fulfilled, (state, action) => {
        state.contractTenantsLoading = false;
        state.contractTenants = action.payload;
      })
      .addCase(fetchContractTenants.rejected, (state, action) => {
        state.contractTenantsLoading = false;
        state.contractTenantsError = action.payload as string;
      });
  },
});

export const {clearContractErrors, clearSelectedContract, resetContractState} = contractSlice.actions;
export default contractSlice.reducer; 