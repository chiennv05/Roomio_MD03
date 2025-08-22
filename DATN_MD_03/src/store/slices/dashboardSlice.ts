import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchDashboardStats, DashboardResponse } from '../services/dashboardService';

interface DashboardState {
  loading: boolean;
  error: string | null;
  data: DashboardResponse['data'] | null;
}

const initialState: DashboardState = {
  loading: false,
  error: null,
  data: null,
};

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetchDashboard',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetchDashboardStats(token);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Không thể tải thông tin thống kê');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError(state) {
      state.error = null;
    },
    clearDashboardData(state) {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDashboardError, clearDashboardData } = dashboardSlice.actions;
export default dashboardSlice.reducer;
