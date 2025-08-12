import {configureStore} from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import filterReducer from './slices/filterSlice';
import roomReducer from './slices/roomSlice';
import notificationReducer from './slices/notificationSlice';
import tenantReducer from './slices/tenantSlice';
import landlordRoomsReducer from './slices/landlordRoomsSlice';
import contractReducer from './slices/contractSlice';
import dashboardReducer from './slices/dashboardSlice';
import supportReducer from './slices/supportSlice';
import billReducer from './slices/billSlice';
import locationReducer from './slices/locationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    filter: filterReducer,
    room: roomReducer,
    notification: notificationReducer,
    tenant: tenantReducer,
    landlordRooms: landlordRoomsReducer,
    contract: contractReducer,
    dashboard: dashboardReducer,
    support: supportReducer,
    bill: billReducer,
    location: locationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
