import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {
  getMyContracts,
  getContractDetail,
  generateContractPDF as genContractPDF,
  uploadSignedContractImage,
  createContractFromNotification,
  updateContract,
  createNewContract,
  deleteSignedImages,
  deleteSignedImage,
} from '../services/contractApi';
import {
  Contract,
  CreateContractPayload,
  CreateContractPayloadWithoutNotification,
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
// Tạo hợp đồng mới không qua thông báo
export const createNewContractThunk = createAsyncThunk(
  'contract/createNewContract',
  async (data: CreateContractPayloadWithoutNotification, {rejectWithValue}) => {
    try {
      const response = await createNewContract(data);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Không thể tạo hợp đồng mới');
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
      console.log(response);
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
    {
      contractId,
      images,
      append,
    }: {contractId: string; images: ImageFile[]; append: boolean},
    {rejectWithValue, getState},
  ) => {
    console.log('Upload thunk called with:', {contractId, images});

    try {
      const state = getState() as any;
      const selectedContract = state.contract.selectedContract;

      if (
        !selectedContract ||
        (selectedContract.status !== 'pending_signature' &&
          selectedContract.status !== 'pending_approval')
      ) {
        return rejectWithValue(
          'Chỉ có thể upload ảnh khi hợp đồng đang chờ ký hoặc chờ phê duyệt',
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
      const response = await uploadSignedContractImage(
        contractId,
        formData,
        append,
      );
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
// Thêm vào đầu file, bên dưới các import hiện tại
export const deleteAllSignedImages = createAsyncThunk<
  {success: boolean; message: string},
  string,
  {rejectValue: string; state: any}
>(
  'contract/deleteAllSignedImages',
  async (contractId, {rejectWithValue, getState}) => {
    const state = getState() as any;
    // kiểm tra trạng thái nếu cần
    try {
      const response = await deleteSignedImages(contractId);
      return response; // { success, message }
    } catch (err: any) {
      return rejectWithValue(err.message || 'Xóa ảnh thất bại');
    }
  },
);

export const deleteSignedImageThunk = createAsyncThunk<
  {success: boolean; message: string; fileName: string},
  {contractId: string; fileName: string},
  {rejectValue: string; state: any}
>(
  'contract/deleteSignedImage',
  async ({contractId, fileName}, {rejectWithValue, getState}) => {
    const state = getState() as any;
    // kiểm tra trạng thái nếu cần
    try {
      const response = await deleteSignedImage(contractId, fileName);
      return {...response, fileName};
    } catch (err: any) {
      return rejectWithValue(err.message || 'Xóa ảnh thất bại');
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
      .addCase(generateContractPDF.fulfilled, (state, action) => {
        state.selectedContractLoading = false;
        if (state.selectedContract) {
          // Cập nhật contractPdfUrl và status từ response
          state.selectedContract.contractPdfUrl =
            action.payload.data.viewPdfUrl;
          state.selectedContract.status = action.payload.data.status;
        }

        // Cập nhật trong danh sách contracts nếu cần
        const contractIndex = state.contracts.findIndex(
          contract => contract._id === state.selectedContract?._id,
        );
        if (contractIndex !== -1 && state.selectedContract) {
          state.contracts[contractIndex] = {
            ...state.contracts[contractIndex],
            contractPdfUrl: action.payload.data.viewPdfUrl,
            status: action.payload.data.status,
          };
        }
      })

      // Upload ảnh hợp đồng
      .addCase(uploadContractImages.pending, state => {
        state.uploadingImages = true;
        state.error = null;
      })
      .addCase(uploadContractImages.fulfilled, (state, action) => {
        state.uploadingImages = false;

        const payload = action.payload;
        const updatedContract = payload.data?.contract;
        const contractId = payload.data?.contractId;

        if (updatedContract) {
          // Cập nhật selectedContract
          state.selectedContract = updatedContract;

          // Cập nhật trong danh sách contracts
          const idx = state.contracts.findIndex(c => c._id === contractId);
          if (idx !== -1) {
            state.contracts[idx] = updatedContract;
          }
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
      })
      // Tạo hợp đồng mới không qua thông báo
      .addCase(createNewContractThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewContractThunk.fulfilled, (state, action) => {
        state.loading = false;

        // Thêm hợp đồng mới vào danh sách
        if (action.payload.contract) {
          state.contracts.unshift(action.payload.contract);
        }
      })
      .addCase(createNewContractThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteAllSignedImages.pending, state => {
        state.uploadingImages = true;
        state.error = null;
      })
      .addCase(deleteAllSignedImages.fulfilled, (state, action) => {
        state.uploadingImages = false;
        // 1. Xóa hết mảng ảnh trong selectedContract
        if (state.selectedContract) {
          state.selectedContract.signedContractImages = [];
        }
        // 2. Cập nhật trong list contracts nếu cần
        const idxAll = state.contracts.findIndex(
          c => c._id === action.meta.arg,
        );
        if (idxAll !== -1) {
          state.contracts[idxAll].signedContractImages = [];
        }
      })
      .addCase(deleteAllSignedImages.rejected, (state, action) => {
        state.uploadingImages = false;
        state.error = action.payload as string;
      })

      // Xóa 1 ảnh theo fileName
      .addCase(deleteSignedImageThunk.pending, state => {
        state.uploadingImages = true;
        state.error = null;
      })
      .addCase(deleteSignedImageThunk.fulfilled, (state, action) => {
        state.uploadingImages = false;
        const {contractId, fileName} = action.meta.arg;

        const matchFileName = (url: string) => {
          return url.split('/').pop() === fileName;
        };

        // 1. Loại ảnh khỏi selectedContract
        if (
          state.selectedContract &&
          state.selectedContract._id === contractId &&
          Array.isArray(state.selectedContract.signedContractImages)
        ) {
          state.selectedContract.signedContractImages =
            state.selectedContract.signedContractImages.filter(
              imgUrl => !matchFileName(imgUrl),
            );
        }

        // 2. Loại ảnh khỏi danh sách contracts
        const idx = state.contracts.findIndex(c => c._id === contractId);
        if (
          idx !== -1 &&
          Array.isArray(state.contracts[idx].signedContractImages)
        ) {
          state.contracts[idx].signedContractImages = state.contracts[
            idx
          ].signedContractImages.filter(imgUrl => !matchFileName(imgUrl));
        }
      })
      .addCase(deleteSignedImageThunk.rejected, (state, action) => {
        state.uploadingImages = false;
        state.error = action.payload as string;
      });
  },
});

export const {clearContractErrors, clearSelectedContract} =
  contractSlice.actions;
export default contractSlice.reducer;
