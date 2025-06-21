import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {RoomState, RoomFilters} from '../../types';
import {getRooms, getRoomDetail, getRelatedRooms, getRelatedRoomsFallback} from '../services/roomService';

const initialState: RoomState = {
  loading: false,
  rooms: [],
  pagination: null,
  appliedFilters: {
    amenities: [],
    furniture: [],
  },
  error: null,
  roomDetail: null,
  roomDetailLoading: false,
  roomDetailError: null,
  relatedRooms: [],
  relatedRoomsLoading: false,
  relatedRoomsError: null,
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

export const fetchRoomDetail = createAsyncThunk(
  'room/fetchRoomDetail',
  async (roomId: string, {rejectWithValue}) => {
    try {
      const res = await getRoomDetail(roomId);
      if (!res?.success) throw new Error(res?.message);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lấy chi tiết phòng thất bại');
    }
  },
);

export const fetchRelatedRooms = createAsyncThunk(
  'room/fetchRelatedRooms',
  async (
    {roomId, district, province, limit = 6}: {
      roomId: string; 
      district?: string; 
      province?: string;
      limit?: number;
    }, 
    {rejectWithValue}
  ) => {
    try {
      console.log('🔗 Starting related rooms search...');
      
      // Sử dụng fallback API trực tiếp vì API chuyên dụng chưa có
      // Thay vì thử API chuyên dụng trước, ta đi thẳng vào fallback
      const fallbackRes = await getRelatedRoomsFallback(roomId, district, province, limit);
      if (fallbackRes?.success) {
        console.log('✅ Related rooms loaded successfully:', fallbackRes.data.rooms.length, 'rooms');
        return fallbackRes.data.rooms;
      }
      
      // Nếu fallback cũng thất bại, thử API chuyên dụng (for future)
      try {
        console.log('🔄 Fallback failed, trying primary API...');
        const res = await getRelatedRooms(roomId, district, province, limit);
        if (res?.success && res?.data?.rooms) {
          return res.data.rooms;
        }
      } catch (apiError) {
        console.log('❌ Primary API also failed');
      }
      
      throw new Error('Không thể lấy danh sách phòng liên quan từ API');
    } catch (err: any) {
      console.error('❌ fetchRelatedRooms failed:', err.message);
      return rejectWithValue(err.message || 'Lấy danh sách phòng liên quan thất bại');
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
    clearRoomDetail: state => {
      state.roomDetail = null;
      state.roomDetailError = null;
    },
    clearRelatedRooms: state => {
      state.relatedRooms = [];
      state.relatedRoomsError = null;
    },
  },
  extraReducers: builder => {
    builder
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
      })

      .addCase(fetchRoomDetail.pending, state => {
        state.roomDetailLoading = true;
        state.roomDetailError = null;
      })
      .addCase(fetchRoomDetail.fulfilled, (state, action) => {
        state.roomDetailLoading = false;
        state.roomDetail = action.payload;
      })
      .addCase(fetchRoomDetail.rejected, (state, action) => {
        state.roomDetailLoading = false;
        state.roomDetailError = action.payload as string;
      })

      .addCase(fetchRelatedRooms.pending, state => {
        state.relatedRoomsLoading = true;
        state.relatedRoomsError = null;
      })
      .addCase(fetchRelatedRooms.fulfilled, (state, action) => {
        state.relatedRoomsLoading = false;
        state.relatedRooms = action.payload;
      })
      .addCase(fetchRelatedRooms.rejected, (state, action) => {
        state.relatedRoomsLoading = false;
        state.relatedRoomsError = action.payload as string;
      });
  },
});

export const {clearRoomError, resetRooms, clearRoomDetail, clearRelatedRooms} = roomSlice.actions;
export default roomSlice.reducer; 