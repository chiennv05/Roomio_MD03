import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {
  getMyContracts,
  getContractDetail,
  generateContractPDF as genContractPDF,
  uploadSignedContractImage,
  createContractFromNotification,
  updateContract,
} from '../services/contractApi';
import {
  Contract,
  CreateContractPayload,
  Pagination,
  UpdateContractPayload,
} from '../../types';
import {ImageFile} from '../services/uploadService';

interface ContractState {
  contracts: Contract[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  selectedContract: Contract | null;
  selectedContractLoading: boolean;
  selectedContractError: string | null;
  uploadingImages: boolean;
}

const initialState: ContractState = {
  contracts: [],
  pagination: null,
  loading: false,
  error: null,
  selectedContract: null,
  selectedContractLoading: false,
  selectedContractError: null,
  uploadingImages: false,
};

// Lấy danh sách hợp đồng
export const fetchMyContracts = createAsyncThunk(
  'contract/fetchMyContracts',
  async (
    params: {page?: number; limit?: number; status?: string} = {},
    {rejectWithValue},
  ) => {
    try {
      const response = await getMyContracts(params);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Không thể tải danh sách hợp đồng');
    }
  },
);

// Tạo hợp đồng từ thông báo
export const createContractFromNotificationThunk = createAsyncThunk(
  'contract/createContractFromNotification',
  async (data: CreateContractPayload, {rejectWithValue}) => {
    try {
      const response = await createContractFromNotification(data);
      return response;
    } catch (err: any) {
      return rejectWithValue(
        err.message || 'Không thể tạo hợp đồng từ thông báo',
      );
    }
  },
);

// Lấy chi tiết hợp đồng
export const fetchContractDetail = createAsyncThunk(
  'contract/fetchContractDetail',
  async (contractId: string, {rejectWithValue}) => {
    try {
      const response = await getContractDetail(contractId);
      if (response.success && response.data) {
        return response;
      }
      return rejectWithValue('Cấu trúc dữ liệu trả về không hợp lệ');
    } catch (err: any) {
      return rejectWithValue(err.message || 'Không thể tải chi tiết hợp đồng');
    }
  },
);

// Tạo file PDF hợp đồng
export const generateContractPDF = createAsyncThunk(
  'contract/generateContractPDF',
  async (contractId: string, {rejectWithValue}) => {
    try {
      const response = await genContractPDF(contractId);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Không thể tạo file PDF hợp đồng');
    }
  },
);

// Upload ảnh hợp đồng đã ký
// store/thunks/contractThunk.ts

export const uploadContractImages = createAsyncThunk(
  'contract/uploadContractImages',
  async (
    {contractId, images}: {contractId: string; images: ImageFile[]},
    {rejectWithValue, getState},
  ) => {
    console.log('Upload thunk called with:', {contractId, images});

    try {
      const state = getState() as any;
      const selectedContract = state.contract.selectedContract;

      if (
        !selectedContract ||
        selectedContract.status !== 'pending_signature'
      ) {
        return rejectWithValue(
          'Chỉ có thể upload ảnh khi hợp đồng đang chờ ký',
        );
      }

      const formData = new FormData();

      // Sử dụng field name 'signedPhotos' như trong Postman
      images.forEach((img, index) => {
        console.log(`Appending image ${index}:`, img);
        formData.append('signedPhotos', {
          uri: img.path,
          type: img.mime,
          name: img.filename || `image_${index}.jpg`,
        } as any);
      });

      console.log('FormData prepared, calling API...');
      const response = await uploadSignedContractImage(contractId, formData);
      console.log('API response:', response);

      return response;
    } catch (err: any) {
      console.error('Upload error in thunk:', err);
      return rejectWithValue(err.message || 'Không thể upload ảnh hợp đồng');
    }
  },
);

//cập nhật hợp đồng
export const updateContractFrom = createAsyncThunk(
  'contract/updateContract',
  async (
    {contractId, data}: {contractId: string; data: UpdateContractPayload},
    {rejectWithValue},
  ) => {
    console.log('Updating contract with ID:', contractId, data);
    try {
      const response = await updateContract(contractId, data);
      // API trả về { success, message, contract }
      console.log('Response data:', response);
      return response.contract; // Trả về contract object từ response
    } catch (err: any) {
      return rejectWithValue(err.message || 'Không thể cập nhật hợp đồng');
    }
  },
);

const contractSlice = createSlice({
  name: 'contract',
  initialState,
  reducers: {
    clearContractErrors: state => {
      state.error = null;
      state.selectedContractError = null;
    },
    clearSelectedContract: state => {
      state.selectedContract = null;
    },
  },
  extraReducers: builder => {
    builder
      // Lấy danh sách hợp đồng
      .addCase(fetchMyContracts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyContracts.fulfilled, (state, action) => {
        state.loading = false;
        state.contracts = action.payload.contracts;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyContracts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Lấy chi tiết hợp đồng
      .addCase(fetchContractDetail.pending, state => {
        state.selectedContractLoading = true;
        state.selectedContractError = null;
      })
      .addCase(fetchContractDetail.fulfilled, (state, action) => {
        state.selectedContractLoading = false;
        state.selectedContract = action.payload.data;
      })
      .addCase(fetchContractDetail.rejected, (state, action) => {
        state.selectedContractLoading = false;
        state.selectedContractError = action.payload as string;
      })

      // Tạo hợp đồng từ thông báo → cập nhật list
      .addCase(createContractFromNotificationThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createContractFromNotificationThunk.fulfilled,
        (state, action) => {
          state.loading = false;
          if (action.payload.contract) {
            state.contracts.unshift(action.payload.contract);
          }
        },
      )
      .addCase(
        createContractFromNotificationThunk.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        },
      )

      // Tạo file PDF hợp đồng
      .addCase(generateContractPDF.pending, state => {
        state.selectedContractLoading = true;
        state.selectedContractError = null;
      })
      .addCase(generateContractPDF.fulfilled, (state, action) => {
        state.selectedContractLoading = false;
        if (state.selectedContract) {
          state.selectedContract.contractPdfUrl = action.payload.pdfUrl;
        }
      })
      .addCase(generateContractPDF.rejected, (state, action) => {
        state.selectedContractLoading = false;
        state.selectedContractError = action.payload as string;
      })

      // Upload ảnh hợp đồng
      .addCase(uploadContractImages.pending, state => {
        state.uploadingImages = true;
        state.error = null;
      })
      .addCase(uploadContractImages.fulfilled, (state, action) => {
        console.log(`Upload successful:`, action.payload);
        state.uploadingImages = false;
        // Cập nhật selectedContract với dữ liệu từ response
        if (state.selectedContract && action.payload.contract) {
          // Cập nhật toàn bộ contract với dữ liệu mới từ server
          state.selectedContract = action.payload.contract;
        }
        // Cập nhật trong danh sách contracts nếu có
        const contractIndex = state.contracts.findIndex(
          contract => contract._id === action.payload.contractId,
        );
        if (contractIndex !== -1 && action.payload.contract) {
          state.contracts[contractIndex] = action.payload.contract;
        }
      })
      .addCase(uploadContractImages.rejected, (state, action) => {
        state.uploadingImages = false;
        state.error = action.payload as string;
      }) // cập nhật hợp đồng
      .addCase(updateContractFrom.fulfilled, (state, action) => {
        const updatedContract = action.payload;
        console.log('Updated contract in reducer:', updatedContract);

        // Cập nhật selectedContract nếu nó chính là contract đang sửa
        if (
          state.selectedContract &&
          state.selectedContract._id === updatedContract._id
        ) {
          state.selectedContract = updatedContract;
        }

        // Cập nhật trong danh sách contracts (nếu tồn tại)
        const index = state.contracts.findIndex(
          c => c._id === updatedContract._id,
        );
        if (index !== -1) {
          state.contracts[index] = updatedContract;
        }
      })
      .addCase(updateContractFrom.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    //
  },
});

export const {clearContractErrors, clearSelectedContract} =
  contractSlice.actions;
export default contractSlice.reducer;
