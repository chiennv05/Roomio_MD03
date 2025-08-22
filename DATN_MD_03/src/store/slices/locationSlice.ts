import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Province, District} from '../../types/Address';
import {fetchCitiesOnly, fetchDistrictsByProvince} from '../services/locationService';

export interface LocationState {
  loading: boolean;
  error: string | null;
  cities: Province[];
  districtsByCity: Record<number, District[]>; // cache by province code
}

const initialState: LocationState = {
  loading: false,
  error: null,
  cities: [],
  districtsByCity: {},
};

// Fetch cities (Thành phố trực thuộc TW) only, with simple in-memory caching in slice
export const fetchCities = createAsyncThunk(
  'location/fetchCities',
  async (_, {rejectWithValue}) => {
    try {
      const cities = await fetchCitiesOnly();
      return cities;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Lỗi tải danh sách thành phố');
    }
  },
);

// Fetch districts of a city with caching (if already available in state, skip request)
export const fetchDistricts = createAsyncThunk(
  'location/fetchDistricts',
  async (
    params: {provinceCode: number; provinceName?: string},
    {getState, rejectWithValue},
  ) => {
    try {
      const state = getState() as {location: LocationState};
      const cached = state.location.districtsByCity[params.provinceCode];
      if (cached && cached.length > 0) {
        return {provinceCode: params.provinceCode, districts: cached, fromCache: true};
      }

      const districts = await fetchDistrictsByProvince(
        params.provinceCode,
        params.provinceName,
      );
      return {provinceCode: params.provinceCode, districts, fromCache: false};
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Lỗi tải quận/huyện');
    }
  },
);

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    clearLocationError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCities.pending, state => {
        // chỉ bật loading nếu chưa có cache
        state.loading = state.cities.length === 0;
        state.error = null;
      })
      .addCase(fetchCities.fulfilled, (state, action: PayloadAction<Province[]>) => {
        state.loading = false;
        // hợp nhất cache cũ để tránh mất dữ liệu
        state.cities = action.payload.length > 0 ? action.payload : state.cities;
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchDistricts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchDistricts.fulfilled,
        (
          state,
          action: PayloadAction<{
            provinceCode: number;
            districts: District[];
            fromCache?: boolean;
          }>,
        ) => {
          state.loading = false;
          state.districtsByCity[action.payload.provinceCode] = action.payload.districts;
        },
      )
      .addCase(fetchDistricts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {clearLocationError} = locationSlice.actions;
export default locationSlice.reducer;


