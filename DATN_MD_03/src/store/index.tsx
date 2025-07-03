import {configureStore} from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import filterReducer from './slices/filterSlice';
import roomReducer from './slices/roomSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    filter: filterReducer,
    room: roomReducer,
    notification: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
