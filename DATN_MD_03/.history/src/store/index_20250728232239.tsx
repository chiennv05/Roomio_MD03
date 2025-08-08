import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import filterReducer from './slices/filterSlice';
import roomReducer from './slices/roomSlice';
import notificationReducer from './slices/notificationSlice';
import tenantReducer from './slices/tenantSlice';
import landlordRoomsReducer from './slices/landlordRoomsSlice';
// <<<<<<< HEAD
import billReducer from './slices/billSlice';
// =======
import contractReducer from './slices/contractSlice';
// >>>>>>> origin/chien

export const store = configureStore({
  reducer: {
    auth: authReducer,
    filter: filterReducer,
    room: roomReducer,
    notification: notificationReducer,
    tenant: tenantReducer,
    landlordRooms: landlordRoomsReducer,
    // <<<<<<< HEAD
    bill: billReducer,
    // =======
    contract: contractReducer,
    // >>>>>>> origin/chien
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
