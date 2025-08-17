import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {AuthState, LoginPayload, RegisterPayload} from '../../types';
import {
  checkProfileAPI,
  login,
  register,
  updateProfile as updateProfileApi,
  logoutAPI,
} from '../services/authService';
import EncryptedStorage from 'react-native-encrypted-storage';
import {storeUserSession} from '../services/storageService';
import {mapApiUserToUser} from '../../utils/mapApiToUser';
import api from '../../api/api';

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
      return rejectWithValue(err.message || 'Đăng ký thất bại');
    }
  },
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (data: LoginPayload, {rejectWithValue}) => {
    try {
      const res = await login(data);
      console.log('response', res);
      if (!res?.success) {
        throw new Error(res?.message);
      }
      const {token, user} = res.data;
      const mapUser = mapApiUserToUser(user, token);
      await storeUserSession(token);
      return {token, mapUser};
    } catch (err: any) {
      console.log(err);
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
      const newToken =
        user?.auth_token?.token ??
        (typeof user?.auth_token === 'string' ? user.auth_token : token);
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
    {
      token,
      data,
    }: {
      token: string;
      data: {
        fullName?: string;
        phone?: string;
        identityNumber?: string;
        address?: string;
        birthDate?: string;
        email?: string;
      };
    },
    {rejectWithValue},
  ) => {
    try {
      const response = await updateProfileApi(token, data);
      const mapUser = mapApiUserToUser(response);
      return mapUser;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Update profile failed');
    }
  },
);

// Thêm action mới để cập nhật avatar
export const updateAvatar = createAsyncThunk(
  'auth/updateAvatar',
  async (
    {
      token,
      imageUri,
    }: {
      token: string;
      imageUri: string;
    },
    {rejectWithValue},
  ) => {
    try {
      console.log('Starting avatar upload with URI:', imageUri);

      const formData = new FormData();
      formData.append('avatar', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `avatar_${Date.now()}.jpg`,
      } as any);

            const response = await api.post('/user/profile/avatar-file', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Avatar upload response:', response.data);

      // Kiểm tra response structure và xử lý các trường hợp
      if (!response?.data) {
        throw new Error('Invalid response from server');
      }

      // Nếu response là string (lỗi từ server)
      if (typeof response.data === 'string') {
        throw new Error(response.data);
      }

      // Kiểm tra success flag
      if (!response.data.success) {
        throw new Error(response.data.message || 'Upload failed');
      }

      // Kiểm tra user data
      const user = response.data.data?.user;
      if (!user) {
        console.error('Could not find user in response:', response.data);
        throw new Error('Could not update avatar - invalid response format');
      }

      // Extract new token if available
      const newToken = user.auth_token?.token || token;

      // Map user data và return với avatar mới
      const mapUser = mapApiUserToUser(user, newToken);

      // Store new token if it was updated
      if (newToken !== token) {
        await storeUserSession(newToken);
      }

      return { user: mapUser, token: newToken };
        } catch (err: any) {
      console.error('Avatar upload error:', err);
      console.error('Error response:', err.response?.data);

      // Xử lý error response một cách an toàn
      let errorMessage = 'Không thể cập nhật ảnh đại diện';

      if (err.message) {
        // Nếu là lỗi từ việc kiểm tra response
        errorMessage = err.message;
      } else if (err.response) {
        // Nếu có response từ server
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }

        // Xử lý HTTP status codes
        switch (err.response.status) {
          case 413:
            errorMessage = 'Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn';
            break;
          case 401:
            errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại';
            break;
          case 400:
            errorMessage = err.response.data?.message || 'Yêu cầu không hợp lệ';
            break;
          case 500:
            errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau';
            break;
        }
      }

      return rejectWithValue(errorMessage);
    }
  },
);

// Thêm action mới để cập nhật chỉ phone hoặc email
export const updatePhoneEmail = createAsyncThunk(
  'auth/updatePhoneEmail',
  async (
    {
      token,
      data,
    }: {
      token: string;
      data: {
        phone?: string;
        email?: string;
      };
    },
    {rejectWithValue},
  ) => {
    try {
      const response = await api.put('/user/profile', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // API trả về response.data.data.user
      const user = response.data.data.user;
      const mapUser = mapApiUserToUser(user);
      return mapUser;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Update failed');
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
      })

      // Cập nhật avatar
      .addCase(updateAvatar.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAvatar.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        // Update token if it was refreshed
        if (action.payload.token) {
          state.token = action.payload.token;
        }
      })
      .addCase(updateAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Cập nhật phone/email
      .addCase(updatePhoneEmail.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePhoneEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updatePhoneEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {logout, clearAuthError, setUserFromStorage} = authSlice.actions;
export default authSlice.reducer;
