import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getTenants, getTenantDetails } from '../services/tenantService';
import { TenantState, TenantFilters } from '../../types/Tenant';

// Initial state
const initialState: TenantState = {
  tenants: [],
  loading: false,
  error: null,
  pagination: null,

  // Chi tiết người thuê
  selectedTenant: null,
  activeContract: null,
  contractHistory: [],
  totalContracts: 0,
  detailLoading: false,
  detailError: null,
};

// Async thunks
export const fetchTenants = createAsyncThunk(
  'tenants/fetchTenants',
  async ({ token, filters }: { token: string; filters?: TenantFilters }, { rejectWithValue }) => {
    try {
      const response = await getTenants(token, filters);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTenantDetails = createAsyncThunk(
  'tenants/fetchTenantDetails',
  async ({ token, tenantId }: { token: string; tenantId: string }, { rejectWithValue }) => {
    try {
      const response = await getTenantDetails(token, tenantId);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const tenantSlice = createSlice({
  name: 'tenants',
  initialState,
  reducers: {
    clearTenantErrors: (state) => {
      state.error = null;
      state.detailError = null;
    },
    resetTenantState: () => initialState,
    resetTenantDetail: (state) => {
      state.selectedTenant = null;
      state.activeContract = null;
      state.contractHistory = [];
      state.totalContracts = 0;
      state.detailLoading = false;
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý fetchTenants
      .addCase(fetchTenants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTenants.fulfilled, (state, action) => {
        state.loading = false;
        state.tenants = action.payload.tenants;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTenants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Xử lý fetchTenantDetails
      .addCase(fetchTenantDetails.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchTenantDetails.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedTenant = action.payload.tenant;
        state.activeContract = action.payload.activeContract;
        state.contractHistory = action.payload.contractHistory;
        state.totalContracts = action.payload.totalContracts;
      })
      .addCase(fetchTenantDetails.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload as string;
      });
  },
});

export const { clearTenantErrors, resetTenantState, resetTenantDetail } = tenantSlice.actions;
export default tenantSlice.reducer;
