import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {fetchPlans, fetchSubscriptions, requestUpgradeQuote, createUpgradeRequest} from '../services/subscriptionService';
// import {SubscriptionRecord} from '../../types';
import {SubscriptionState} from '../../types/Subscription';

// SubscriptionState moved to types/Subscription.ts

const initialState: SubscriptionState = {
  loading: false,
  error: null,
  current: null,
  plans: [],
  bankInfo: null,
  quote: null,
  quotesByPlan: {},
  lastUpgradeRequest: null as any,
};

export const loadSubscriptions = createAsyncThunk(
  'subscription/loadSubscriptions',
  async (token: string, {rejectWithValue}) => {
    try {
      const res = await fetchSubscriptions(token);
      if (!res.success) {
        throw new Error('Tải gói đăng ký thất bại');
      }
      // API trả về danh sách: xác định active và pending mới nhất
      const sorted = [...(res.subscriptions || [])]
        .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
      const active = sorted.find(item => item.status === 'active') || null;
      const pending = sorted.find(item => item.status === 'pending') || null;
      return {active, pending, items: sorted} as any;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Không thể tải gói đăng ký');
    }
  },
);

export const loadPlans = createAsyncThunk(
  'subscription/loadPlans',
  async (_, {rejectWithValue}) => {
    try {
      const res = await fetchPlans();
      if (!res.success) {
        throw new Error('Tải danh sách gói thất bại');
      }
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Không thể tải danh sách gói');
    }
  },
);

export const getUpgradeQuote = createAsyncThunk(
  'subscription/getUpgradeQuote',
  async (
    {token, plan}: {token: string; plan: string},
    {rejectWithValue},
  ) => {
    try {
      const res = await requestUpgradeQuote(token, plan);
      if (!res.success) {
        throw new Error('Lấy báo giá nâng cấp thất bại');
      }
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Không thể lấy báo giá');
    }
  },
);

// Tạo yêu cầu nâng cấp, trả về subscription có qrUrl
export const createSubscriptionUpgrade = createAsyncThunk(
  'subscription/createSubscriptionUpgrade',
  async (
    {token, plan}: {token: string; plan: string},
    {rejectWithValue},
  ) => {
    try {
      const res = await createUpgradeRequest(token, plan);
      if (!res.success) {
        throw new Error(res.message || 'Tạo yêu cầu nâng cấp thất bại');
      }
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Không thể tạo yêu cầu nâng cấp');
    }
  },
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearSubscriptionError(state) {
      state.error = null;
    },
    clearSubscription(state) {
      state.current = null;
    },
    resetUpgradeQuotes(state) {
      state.quote = null;
      state.quotesByPlan = {} as any;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadSubscriptions.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        const {active, pending, items} = (action.payload || {}) as any;
        state.current = active || null;
        (state as any).pending = pending || null;
        (state as any).items = items || [];
        // Khi user/plan thay đổi, làm mới báo giá để tránh dùng cache từ tài khoản trước
        state.quote = null;
        state.quotesByPlan = {} as any;
      })
      .addCase(loadSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loadPlans.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload.plans;
        state.bankInfo = action.payload.bankInfo;
      })
      .addCase(loadPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getUpgradeQuote.pending, state => {
        // Không bật loading toàn màn khi lấy quote, tránh overlay chớp
        state.error = null;
      })
      .addCase(getUpgradeQuote.fulfilled, (state, action) => {
        const {
          expectedAmount,
          currency,
          plan,
          planName,
          qrUrl,
          transferNote,
          bankInfo,
        } = action.payload as any;
        state.quote = {expectedAmount, currency, plan, planName, qrUrl, transferNote};
        if (plan) {
          state.quotesByPlan[plan] = {expectedAmount, currency, plan, planName, qrUrl, transferNote};
        }
        state.bankInfo = bankInfo ?? state.bankInfo;
      })
      .addCase(getUpgradeQuote.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(createSubscriptionUpgrade.pending, state => {
        state.error = null;
        state.loading = true;
      })
      .addCase(createSubscriptionUpgrade.fulfilled, (state, action) => {
        state.loading = false;
        const sub = action.payload?.subscription;
        if (sub) {
          state.quote = {
            expectedAmount: sub.expectedAmount ?? null,
            currency: 'VND',
            plan: sub.plan,
            planName: sub.plan,
            qrUrl: sub.qrUrl,
            transferNote: sub.transferNote,
          };
        }
        (state as any).lastUpgradeRequest = action.payload;
      })
      .addCase(createSubscriptionUpgrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {clearSubscriptionError, clearSubscription} =
  subscriptionSlice.actions;

export default subscriptionSlice.reducer;


