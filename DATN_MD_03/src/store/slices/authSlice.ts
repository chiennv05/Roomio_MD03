import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {AuthState, LoginPayload, RegisterPayload} from '../../types';
import {login, register} from '../services/authService';
import EncryptedStorage from 'react-native-encrypted-storage';
import {storeUserSession} from '../services/storageService';

const initialState: AuthState = {
  loading: false,
  user: null,
  error: null,
  token: null,
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: RegisterPayload, {rejectWithValue}) => {
    try {
      const res = await register(data);
      if (!res?.success) {
        throw new Error(res?.message);
      }

      return res;
    } catch (err: any) {
      const backendMessage =
        err?.data?.message || err?.message || 'Đăng ký thất bại';
      return rejectWithValue(backendMessage);
    }
  },
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (data: LoginPayload, {rejectWithValue}) => {
    try {
      const res = await login(data);
      if (!res?.success) {
        throw new Error(res?.message);
      }

      const {token, user} = res;

      // Lưu phiên đăng nhập trong 30 ngày
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 30);

      await storeUserSession(token, user, {
        username: data.username,
        password: data.password,
      });

      return {token, user};
    } catch (err: any) {
      const backendMessage =
        err?.data?.message || err?.message || 'Đăng ký thất bại';
      return rejectWithValue(backendMessage);
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
