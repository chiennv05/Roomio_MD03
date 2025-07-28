import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {AuthState, LoginPayload, RegisterPayload} from '../../types';
import {checkProfileAPI, login, register, updateProfile as updateProfileApi, logoutAPI} from '../services/authService';
import EncryptedStorage from 'react-native-encrypted-storage';
import {storeUserSession} from '../services/storageService';
import {mapApiUserToUser} from '../../utils/mapApiToUser';

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
      if (!res?.success) throw new Error(res?.message);
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Đăng ký thất bại');
    }
  },
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (data: LoginPayload, {rejectWithValue}) => {
    try {
      const res = await login(data);
      if (!res?.success) throw new Error(res?.message);

      const {token, user} = res.data;
      const mapUser = mapApiUserToUser(user, token);
      await storeUserSession(token);
      return {token, mapUser};
    } catch (err: any) {
      return rejectWithValue(err.message || 'Đăng nhập thất bại');
    }
  },
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (token: string, {rejectWithValue}) => {
    try {
      await logoutAPI(token);
      await EncryptedStorage.removeItem('user_session');
      return true;
    } catch (err: any) {
      // Vẫn logout local dù API fail
      await EncryptedStorage.removeItem('user_session');
      return rejectWithValue(err.message || 'Đăng xuất thất bại');
    }
  },
);

export const checkProfile = createAsyncThunk(
  'auth/checkProfile',
  async (token: string, {rejectWithValue}) => {
    try {
      const res = await checkProfileAPI(token);
      if (res.status === 401) {
        throw new Error(res.message);
      }
      const {user} = res.data;
      const newToken = user.auth_token.token;
      const mapUser = mapApiUserToUser(user);

      return {token: newToken, mapUser};
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi xác thựC');
    }
  },
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (
    {token, data}: {token: string; data: {
      fullName: string;
      phone: string;
      identityNumber: string;
      address?: string;
      birthDate?: string;
    }},
    {rejectWithValue}
  ) => {
    try {
      const user = await updateProfileApi(token, data);
      return user;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Update profile failed');
    }
  }
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
    setUserFromStorage: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
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
        state.user = action.payload.mapUser;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Đăng xuất
      .addCase(logoutUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
      })

      // Kiểm tra profile
      .addCase(checkProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.mapUser;
        state.token = action.payload.token;
        storeUserSession(action.payload.token);
      })
      .addCase(checkProfile.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
        EncryptedStorage.removeItem('user_session');
      })

      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {logout, clearAuthError, setUserFromStorage} = authSlice.actions;
export default authSlice.reducer;
