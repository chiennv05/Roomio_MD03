import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {RoomState, RoomFilters} from '../../types';
import {getRooms} from '../services/roomService';

const initialState: RoomState = {
  loading: false,
  rooms: [],
  pagination: null,
  appliedFilters: {
    amenities: [],
    furniture: [],
  },
  error: null,
};

export const fetchRooms = createAsyncThunk(
  'room/fetchRooms',
  async (filters: RoomFilters = {}, {rejectWithValue}) => {
    try {
      const res = await getRooms(filters);
      if (!res?.success) throw new Error(res?.message);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lấy danh sách phòng trọ thất bại');
    }
  },
);

export const loadMoreRooms = createAsyncThunk(
  'room/loadMoreRooms',
  async (filters: RoomFilters = {}, {rejectWithValue, getState}) => {
    try {
      const state = getState() as {room: RoomState};
      const currentPage = state.room.pagination?.page || 1;
      const nextPage = currentPage + 1;
      
      const res = await getRooms({...filters, page: nextPage});
      if (!res?.success) throw new Error(res?.message);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Tải thêm phòng trọ thất bại');
    }
  },
);

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    clearRoomError: state => {
      state.error = null;
    },
    resetRooms: state => {
      state.rooms = [];
      state.pagination = null;
      state.appliedFilters = {
        amenities: [],
        furniture: [],
      };
    },
  },
  extraReducers: builder => {
    builder
      // Fetch rooms
      .addCase(fetchRooms.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload.rooms;
        state.pagination = action.payload.pagination;
        state.appliedFilters = action.payload.appliedFilters;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Load more rooms
      .addCase(loadMoreRooms.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMoreRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = [...state.rooms, ...action.payload.rooms];
        state.pagination = action.payload.pagination;
        state.appliedFilters = action.payload.appliedFilters;
      })
      .addCase(loadMoreRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {clearRoomError, resetRooms} = roomSlice.actions;
export default roomSlice.reducer; 