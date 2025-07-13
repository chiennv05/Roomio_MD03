import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {FilterState} from '../../types';
import {getFilterOptions} from '../services/filterService';

const initialState: FilterState = {
  loading: false,
  furniture: [],
  amenities: [],
  furnitureCategories: {},
  amenitiesCategories: {},
  error: null,
};

export const fetchFilterOptions = createAsyncThunk(
  'filter/fetchOptions',
  async (_, {rejectWithValue}) => {
    try {
      const res = await getFilterOptions();
      if (!res?.success) throw new Error(res?.message);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lấy dữ liệu filter thất bại');
    }
  },
);

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    clearFilterError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchFilterOptions.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFilterOptions.fulfilled, (state, action) => {
        state.loading = false;
        state.furniture = action.payload.furniture.options;
        state.amenities = action.payload.amenities.options;
        state.furnitureCategories = action.payload.furniture.categories;
        state.amenitiesCategories = action.payload.amenities.categories;
      })
      .addCase(fetchFilterOptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {clearFilterError} = filterSlice.actions;
export default filterSlice.reducer; 