import {configureStore, combineReducers} from '@reduxjs/toolkit';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import reducers đã tách
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
import subscriptionReducer from './slices/subscriptionSlice';

// Gộp tất cả reducer
const rootReducer = combineReducers({
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
  subscription: subscriptionReducer,
});

// Config redux-persist
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // chỉ lưu lại auth, các reducer khác sẽ reset khi reload
};

// Tạo persistedReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Khởi tạo store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false, // tắt warning khi persist
    }),
});

// Tạo persistor để dùng trong PersistGate
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
