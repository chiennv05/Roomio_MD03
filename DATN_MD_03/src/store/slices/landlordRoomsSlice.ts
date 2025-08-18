import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {Pagination, Room} from '../../types';
import {
  createLandlordRoomsService,
  getLandlordRoomsService,
  getLandlordRoomDetailService,
  updateLandlordRoomService,
  deleteLandlordRoomService,
} from '../services/landlordRoomsService';

interface LandlordRoomState {
  rooms: Room[];
  selectedRoom?: Room;
  loading: boolean;
  error: string | null;
  success: boolean;
  pagination: Pagination | null;
}

const initialState: LandlordRoomState = {
  rooms: [],
  selectedRoom: undefined,
  loading: false,
  error: null,
  success: false,
  pagination: null,
};

// ✅ GET danh sách phòng
export const getLandlordRooms = createAsyncThunk(
  'landlordRooms/getLandlordRooms',
  async (
    {
      status = '',
      approvalStatus = '',
      page = 1,
      limit = 10,
      roomName = '',
    }: {
      status?: string;
      approvalStatus?: string;
      page?: number;
      limit?: number;
      roomName?: string;
    },
    {rejectWithValue},
  ) => {
    try {
      const res = await getLandlordRoomsService({
        status,
        approvalStatus,
        page,
        limit,
        roomName,
      });
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
      return res.data.room;
    } catch (err: any) {
      return rejectWithValue({message: err.message});
    }
  },
);

// ✅ GET chi tiết phòng
export const getLandlordRoomDetail = createAsyncThunk(
  'landlordRooms/getRoomDetail',
  async (roomId: string, {rejectWithValue}) => {
    try {
      const res = await getLandlordRoomDetailService(roomId);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi lấy chi tiết phòng');
    }
  },
);

// ✅ PUT cập nhật phòng
export const updateLandlordRoom = createAsyncThunk(
  'landlordRooms/updateRoom',
  async ({roomId, room}: {roomId: string; room: Room}, {rejectWithValue}) => {
    try {
      const res = await updateLandlordRoomService(roomId, room);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi cập nhật phòng');
    }
  },
);

// ✅ DELETE phòng
export const deleteLandlordRoom = createAsyncThunk(
  'landlordRooms/deleteRoom',
  async (roomId: string, {rejectWithValue}) => {
    try {
      const res = await deleteLandlordRoomService(roomId);
      return {roomId, data: res.data};
    } catch (err: any) {
      return rejectWithValue(err.message || 'Xóa phòng thất bại');
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
    // THÊM action mới
    resetUpdateRoomStatus: state => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // GET danh sách
      .addCase(getLandlordRooms.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLandlordRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload.rooms || [];
        state.pagination = action.payload.pagination;
      })
      .addCase(
        getLandlordRooms.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        },
      )

      // CREATE
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
          state.rooms.push(action.payload);
        },
      )
      .addCase(
        createLandlordRoom.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
          state.success = false;
        },
      )

      // GET DETAIL
      .addCase(getLandlordRoomDetail.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getLandlordRoomDetail.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.selectedRoom = action.payload.room;
        },
      )
      .addCase(
        getLandlordRoomDetail.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        },
      )

      // UPDATE - SỬA CHÍNH TẠI ĐÂY
      .addCase(updateLandlordRoom.pending, state => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        updateLandlordRoom.fulfilled,
        (state, action: PayloadAction<Room>) => {
          state.loading = false;
          state.success = true;
          // Lấy room data từ response structure
          const updatedRoom = action.payload; // action.payload là room data
          console.log('Updated room in reducer:', updatedRoom);

          const index = state.rooms.findIndex(r => r._id === updatedRoom._id);
          if (index !== -1) {
            state.rooms[index] = updatedRoom;
          }
          // Cập nhật selectedRoom nếu đang được select
          if (
            state.selectedRoom &&
            state.selectedRoom._id === updatedRoom._id
          ) {
            state.selectedRoom = updatedRoom;
          }
        },
      )
      .addCase(
        updateLandlordRoom.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.success = false;
          state.error = action.payload; // SỬA: Lưu error message thay vì rooms
        },
      )

      // DELETE
      .addCase(deleteLandlordRoom.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteLandlordRoom.fulfilled,
        (state, action: PayloadAction<{roomId: string}>) => {
          state.loading = false;
          state.rooms = state.rooms.filter(
            r => r._id !== action.payload.roomId,
          );
        },
      )
      .addCase(
        deleteLandlordRoom.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        },
      );
  },
});

export const {resetCreateRoomStatus, resetUpdateRoomStatus} =
  landlordRoomsSlice.actions;
export default landlordRoomsSlice.reducer;
