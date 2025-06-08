import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {AuthState, RegisterPayload} from '../../types';
import {register} from '../services/authService';

const initialState: AuthState = {
  loading: false,
  user: null,
  error: null,
};

// Async thunk
export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: RegisterPayload, {rejectWithValue}) => {
    try {
      const res = await register(data);
      return res;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Đăng ký thất bại');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(registerUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {clearAuthError} = authSlice.actions;
export default authSlice.reducer;
