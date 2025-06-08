import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {
  AuthState,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
} from '../../types';
import {login, register} from '../services/authService';
import EncryptedStorage from 'react-native-encrypted-storage';

const initialState: AuthState = {
  loading: false,
  user: null,
  error: null,
  token: null,
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

export const loginUser = createAsyncThunk(
  'auth/login',
  async (data: LoginPayload, {rejectWithValue}) => {
    try {
      const res: LoginResponse = await login(data);
      const {token, user} = res;

      if (!token) throw new Error('Không có token');

      // Lưu phiên đăng nhập trong 30 ngày
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 30);

      await EncryptedStorage.setItem(
        'user_session',
        JSON.stringify({
          token,
          expire: expireDate.toISOString(),
          user,
        }),
      );

      return {token, user};
    } catch (err: any) {
      console.log('login error:', err);
      return rejectWithValue(
        err.response?.data?.message || 'Đăng nhập thất bại',
      );
    }
  },
);
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: state => {
      state.user = null;
      state.token = null;
      state.error = null;
      EncryptedStorage.removeItem('user_session');
    },
    clearAuthError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Đăng ký
      .addCase(registerUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, state => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Đăng nhập
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {clearAuthError} = authSlice.actions;
export default authSlice.reducer;
