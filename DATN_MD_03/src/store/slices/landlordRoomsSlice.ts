import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {Room} from '../../types';
import {
  createLandlordRoomsService,
  getLandlordRoomsService,
} from '../services/landlordRoomsService';

interface LandlordRoomState {
  rooms: Room[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: LandlordRoomState = {
  rooms: [],
  loading: false,
  error: null,
  success: false,
};

// ✅ GET danh sách phòng
export const getLandlordRooms = createAsyncThunk(
  'landlordRooms/getLandlordRooms',
  async (token: string, {rejectWithValue}) => {
    try {
      const res = await getLandlordRoomsService(token);
      if (!res?.success) {
        return rejectWithValue(res?.message || 'Thất bại');
      }
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi không xác định');
    }
  },
);

// ✅ POST tạo phòng
export const createLandlordRoom = createAsyncThunk(
  'landlordRooms/createLandlordRoom',
  async (room: Room, {rejectWithValue}) => {
    try {
      const res = await createLandlordRoomsService(room);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Tạo phòng thất bại');
    }
  },
);

const landlordRoomsSlice = createSlice({
  name: 'landlordRooms',
  initialState,
  reducers: {
    resetCreateRoomStatus: state => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // GET rooms
      .addCase(getLandlordRooms.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLandlordRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload.rooms || [];
      })
      .addCase(
        getLandlordRooms.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        },
      )

      // CREATE room
      .addCase(createLandlordRoom.pending, state => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(
        createLandlordRoom.fulfilled,
        (state, action: PayloadAction<Room>) => {
          state.loading = false;
          state.success = true;
          state.rooms.push(action.payload); // hoặc gọi lại API nếu muốn
        },
      )
      .addCase(
        createLandlordRoom.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
          state.success = false;
        },
      );
  },
});

export const {resetCreateRoomStatus} = landlordRoomsSlice.actions;
export default landlordRoomsSlice.reducer;
