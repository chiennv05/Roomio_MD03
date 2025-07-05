import {configureStore} from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import filterReducer from './slices/filterSlice';
import roomReducer from './slices/roomSlice';
import notificationReducer from './slices/notificationSlice';
import tenantReducer from './slices/tenantSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    filter: filterReducer,
    room: roomReducer,
    notification: notificationReducer,
    tenant: tenantReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
