import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {Room} from '../../types';
import {getLandlordRoomsService} from '../services/landlordRoomsService';

interface LandlordRoomState {
  rooms: Room[];
  loading: boolean;
  error: string | null;
}

const initialState: LandlordRoomState = {
  rooms: [],
  loading: false,
  error: null,
};

// redux gọi api load danh sách phòng trọ của chủ trọ
export const getLandlordRooms = createAsyncThunk(
  'landlordRooms/getLandlordRooms',
  async (token: string, {rejectWithValue}) => {
    try {
      const res = await getLandlordRoomsService(token);
      if (!res?.success) {
        throw new Error(res?.message);
      }
      return res.data; // chứa { rooms, summary, pagination }
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lấy danh sách phòng thất bại');
    }
  },
);

// Slice
const landlordRoomsSlice = createSlice({
  name: 'landlordRooms',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getLandlordRooms.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getLandlordRooms.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.rooms = action.payload.rooms; // đảm bảo payload trả về chứa `rooms`
        },
      )
      .addCase(
        getLandlordRooms.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        },
      );
  },
});

export default landlordRoomsSlice.reducer;
