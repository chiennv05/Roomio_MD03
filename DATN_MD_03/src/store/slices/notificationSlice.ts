import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { NotificationState, Notification } from '../../types/Notification';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification
} from '../services/notificationService';

const initialState: NotificationState = {
  loading: false,
  notifications: [],
  pagination: null,
  unreadCount: 0,
  error: null,
  refreshing: false,
  loadingMore: false,
};

// Async thunk để lấy danh sách thông báo
export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (
    { token, page = 1, limit = 20 }: { token: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await getNotifications(token, page, limit);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Lỗi khi lấy danh sách thông báo');
    }
  }
);

// Async thunk để load more notifications
export const loadMoreNotifications = createAsyncThunk(
  'notification/loadMoreNotifications',
  async (
    { token, page, limit = 20 }: { token: string; page: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await getNotifications(token, page, limit);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Lỗi khi tải thêm thông báo');
    }
  }
);

// Async thunk để refresh notifications
export const refreshNotifications = createAsyncThunk(
  'notification/refreshNotifications',
  async (
    { token, limit = 20 }: { token: string; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await getNotifications(token, 1, limit);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Lỗi khi làm mới thông báo');
    }
  }
);

// Async thunk để đánh dấu thông báo đã đọc
export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (
    { notificationId, token }: { notificationId: string; token: string },
    { rejectWithValue }
  ) => {
    try {
      await markNotificationAsRead(notificationId, token);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Lỗi khi đánh dấu đã đọc');
    }
  }
);

// Async thunk để đánh dấu tất cả thông báo đã đọc
export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (token: string, { rejectWithValue }) => {
    try {
      await markAllNotificationsAsRead(token);
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Lỗi khi đánh dấu tất cả đã đọc');
    }
  }
);

// Async thunk để xóa thông báo
export const deleteNotificationById = createAsyncThunk(
  'notification/deleteNotification',
  async (
    { notificationId, token }: { notificationId: string; token: string },
    { rejectWithValue }
  ) => {
    try {
      await deleteNotification(notificationId, token);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Lỗi khi xóa thông báo');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    clearNotificationError: (state) => {
      state.error = null;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.pagination = null;
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data.notifications;
        state.pagination = action.payload.data.pagination;
        state.unreadCount = action.payload.data.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Load more notifications
      .addCase(loadMoreNotifications.pending, (state) => {
        state.loadingMore = true;
      })
      .addCase(loadMoreNotifications.fulfilled, (state, action) => {
        state.loadingMore = false;
        state.notifications = [...state.notifications, ...action.payload.data.notifications];
        state.pagination = action.payload.data.pagination;
        state.unreadCount = action.payload.data.unreadCount;
      })
      .addCase(loadMoreNotifications.rejected, (state, action) => {
        state.loadingMore = false;
        state.error = action.payload as string;
      })

      // Refresh notifications
      .addCase(refreshNotifications.pending, (state) => {
        state.refreshing = true;
        state.error = null;
      })
      .addCase(refreshNotifications.fulfilled, (state, action) => {
        state.refreshing = false;
        state.notifications = action.payload.data.notifications;
        state.pagination = action.payload.data.pagination;
        state.unreadCount = action.payload.data.unreadCount;
      })
      .addCase(refreshNotifications.rejected, (state, action) => {
        state.refreshing = false;
        state.error = action.payload as string;
      })

      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n._id === notificationId);
        if (notification && notification.status === 'unread') {
          notification.status = 'read';
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.status = 'read';
        });
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Delete notification
      .addCase(deleteNotificationById.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const index = state.notifications.findIndex(n => n._id === notificationId);
        if (index !== -1) {
          // Kiểm tra nếu thông báo chưa đọc thì giảm unreadCount
          if (state.notifications[index].status === 'unread') {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          // Xóa thông báo khỏi mảng
          state.notifications.splice(index, 1);
        }
      })
      .addCase(deleteNotificationById.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearNotificationError, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer; 