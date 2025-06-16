import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ApiRoom, RoomFilters, Pagination, AppliedFilters } from '../../types/Room';
import { roomService } from '../services/roomService';

export interface RoomState {
  rooms: ApiRoom[];
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
  appliedFilters: AppliedFilters;
  currentFilters: RoomFilters;
}

const initialState: RoomState = {
  rooms: [],
  loading: false,
  error: null,
  pagination: null,
  appliedFilters: {
    amenities: [],
    furniture: [],
  },
  currentFilters: {
    maxDistance: 10000,
    page: 1,
    limit: 20,
  },
};

// Async thunk để fetch rooms
export const fetchRooms = createAsyncThunk(
  'rooms/fetchRooms',
  async (filters: RoomFilters = {}) => {
    const response = await roomService.getRooms(filters);
    return response;
  }
);

// Async thunk để load more rooms (pagination)
export const loadMoreRooms = createAsyncThunk(
  'rooms/loadMoreRooms',
  async (_, { getState }) => {
    const state = getState() as { rooms: RoomState };
    const currentPage = state.rooms.pagination?.page || 1;
    const nextPage = currentPage + 1;
    
    const filters = {
      ...state.rooms.currentFilters,
      page: nextPage,
    };
    
    const response = await roomService.getRooms(filters);
    return response;
  }
);

const roomSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<RoomFilters>) => {
      state.currentFilters = { ...state.currentFilters, ...action.payload };
    },
    clearFilters: (state) => {
      state.currentFilters = {
        maxDistance: 10000,
        page: 1,
        limit: 20,
      };
    },
    clearError: (state) => {
      state.error = null;
    },
    resetRooms: (state) => {
      state.rooms = [];
      state.pagination = null;
      state.currentFilters.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch rooms
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload.data.rooms;
        state.pagination = action.payload.data.pagination;
        state.appliedFilters = action.payload.data.appliedFilters;
        state.error = null;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch rooms';
      })
      // Load more rooms
      .addCase(loadMoreRooms.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadMoreRooms.fulfilled, (state, action) => {
        state.loading = false;
        // Append new rooms to existing ones
        state.rooms = [...state.rooms, ...action.payload.data.rooms];
        state.pagination = action.payload.data.pagination;
        state.appliedFilters = action.payload.data.appliedFilters;
        state.error = null;
      })
      .addCase(loadMoreRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load more rooms';
      });
  },
});

export const { setFilters, clearFilters, clearError, resetRooms } = roomSlice.actions;
export default roomSlice.reducer; 