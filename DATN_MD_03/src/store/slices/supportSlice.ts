import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {Support} from '../../types/Support';
import supportService from '../services/supportService';

interface SupportState {
  supportRequests: Support[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  summary: {
    totalRequests: number;
    openRequests: number;
    processingRequests: number;
    completedRequests: number;
  };
}

const initialState: SupportState = {
  supportRequests: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  summary: {
    totalRequests: 0,
    openRequests: 0,
    processingRequests: 0,
    completedRequests: 0,
  },
};

// Async thunks
export const fetchSupportRequests = createAsyncThunk(
  'support/fetchSupportRequests',
  async (
    params: {status?: string; category?: string; page?: number; limit?: number},
    {rejectWithValue},
  ) => {
    try {
      const response = await supportService.getSupportRequests(params);
      if ('isError' in response) {
        return rejectWithValue(response.message);
      }
      return response.data.data;
    } catch (error) {
      return rejectWithValue('Không thể lấy danh sách yêu cầu hỗ trợ');
    }
  },
);

export const deleteSupportRequest = createAsyncThunk(
  'support/deleteSupportRequest',
  async (id: string, {rejectWithValue}) => {
    try {
      const response = await supportService.deleteSupportRequest(id);
      if ('isError' in response) {
        return rejectWithValue(response.message);
      }
      return id; // Return the ID of the deleted support request
    } catch (error) {
      return rejectWithValue('Không thể xóa yêu cầu hỗ trợ');
    }
  },
);

const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {
    clearSupportState: _state => {
      return initialState;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchSupportRequests.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupportRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.supportRequests = action.payload.supportRequests;
        state.pagination = action.payload.pagination;
        state.summary = action.payload.summary;
      })
      .addCase(fetchSupportRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteSupportRequest.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSupportRequest.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the deleted support request from the state
        state.supportRequests = state.supportRequests.filter(
          request => request._id !== action.payload,
        );
        // Update summary counts
        if (state.summary) {
          state.summary.totalRequests = Math.max(
            0,
            state.summary.totalRequests - 1,
          );
        }
      })
      .addCase(deleteSupportRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {clearSupportState} = supportSlice.actions;
export default supportSlice.reducer;
