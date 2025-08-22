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
  extendContract,
  terminateContract,
  updateTenantsApi,
  deleteContractApi,
  resignContract,
  getCoTenantsContract, // <-- import API deleteContract
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
    params: {
      page?: number;
      limit?: number;
      status?: string;
      roomName?: string;
    } = {},
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
          selectedContract.status !== 'pending_approval' &&
          selectedContract.status !== 'needs_resigning')
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
  {success: boolean; message: string; status: any},
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
  {success: boolean; message: string; fileName: string; status: any},
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
export const extendContractThunk = createAsyncThunk<
  any,
  {contractId: string; months: number},
  {rejectValue: string}
>(
  'contract/extendContract',
  async ({contractId, months}, {rejectWithValue}) => {
    try {
      const response = await extendContract(contractId, months); // Gọi API đã viết
      return response.contract; // Trả về object hợp đồng đã cập nhật
    } catch (err: any) {
      return rejectWithValue(err.message || 'Không thể gia hạn hợp đồng');
    }
  },
);

export const terminateContractThunk = createAsyncThunk<
  any,
  {contractId: string; reason: string},
  {rejectValue: string}
>(
  'contract/terminateContract',
  async ({contractId, reason}, {rejectWithValue}) => {
    try {
      const response = await terminateContract(contractId, reason); // <-- API đã có
      return response.contract;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Không thể chấm dứt hợp đồng');
    }
  },
);

// cập nhật danh sách người thuê
export const updateTenants = createAsyncThunk(
  'contract/updateTenants',
  async (
    {
      contractId,
      usernames,
      apply,
    }: {
      contractId: string;
      usernames: string[];
      apply: boolean;
    },
    {rejectWithValue},
  ) => {
    try {
      const response = await updateTenantsApi(contractId, usernames, apply);
      console.log(' response  redux tenants:', response);
      if (!response.success) {
        return rejectWithValue(
          response.message || 'Không thể cập nhật người thuê',
        );
      }

      // Trả về toàn bộ response để có thể sử dụng coTenants, tenantCount, etc.
      return {
        contractId,
        ...response,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Không thể cập nhật người thuê');
    }
  },
);

// Thêm vào phần async thunks
export const deleteContract = createAsyncThunk(
  'contract/deleteContract',
  async (contractId: string, {rejectWithValue}) => {
    try {
      const response = await deleteContractApi(contractId);
      if (!response.success) {
        return rejectWithValue(response.message || 'Không thể xóa hợp đồng');
      }
      return {
        contractId,
        ...response,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Không thể xóa hợp đồng');
    }
  },
);

export const resignContractThunk = createAsyncThunk(
  'contracts/resignContract',
  async (contractId: string, {rejectWithValue}) => {
    try {
      const data = await resignContract(contractId);
      console.log('data redux', data);
      return data;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  },
);

// store/slices/contractSlice.ts
export const fetchCoTenants = createAsyncThunk(
  'contract/fetchCoTenants',
  async (contractId: string, {rejectWithValue}) => {
    try {
      const res = await getCoTenantsContract(contractId);
      return res.data; // hoặc res.coTenants tùy backend trả về
    } catch (err: any) {
      return rejectWithValue(
        err.message || 'Không thể lấy danh sách người ở cùng',
      );
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

        if (action.payload.pagination.page === 1) {
          // Nếu là trang đầu tiên thì reset
          state.contracts = action.payload.contracts;
        } else {
          // Nếu load tiếp thì nối vào
          state.contracts = [...state.contracts, ...action.payload.contracts];
        }

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
        const updatedContract = {
          ...action.payload,
          roomId:
            state.selectedContract?.roomId ||
            state.contracts.find(c => c._id === action.payload._id)?.roomId ||
            action.payload.roomId,
        };

        // Cập nhật selectedContract nếu nó trùng với contract được sửa
        if (
          state.selectedContract &&
          state.selectedContract._id === updatedContract._id
        ) {
          state.selectedContract = {
            ...updatedContract,
            roomId: state.selectedContract.roomId, // Giữ nguyên roomId hiện tại
          };
        }

        // Cập nhật trong danh sách contracts (nếu tồn tại)
        const index = state.contracts.findIndex(
          c => c._id === updatedContract._id,
        );
        if (index !== -1) {
          state.contracts[index] = {
            ...updatedContract,
            roomId: state.contracts[index].roomId, // Giữ nguyên roomId hiện tại
          };
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
          state.selectedContract.status = action.payload.status; // Cập nhật status nếu cần
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
        const {status} = action.payload; // Lấy status mới từ API

        const matchFileName = (url: string) => {
          return url.split('/').pop() === fileName;
        };

        // 1. Loại ảnh & cập nhật status trong selectedContract
        if (
          state.selectedContract &&
          state.selectedContract._id === contractId &&
          Array.isArray(state.selectedContract.signedContractImages)
        ) {
          state.selectedContract.signedContractImages =
            state.selectedContract.signedContractImages.filter(
              imgUrl => !matchFileName(imgUrl),
            );
          state.selectedContract.status = status; // ✅ cập nhật status mới
        }

        // 2. Loại ảnh & cập nhật status trong danh sách contracts
        const idx = state.contracts.findIndex(c => c._id === contractId);
        if (
          idx !== -1 &&
          Array.isArray(state.contracts[idx].signedContractImages)
        ) {
          state.contracts[idx].signedContractImages = state.contracts[
            idx
          ].signedContractImages.filter(imgUrl => !matchFileName(imgUrl));
          state.contracts[idx].status = status; // ✅ cập nhật status mới
        }
      })

      .addCase(deleteSignedImageThunk.rejected, (state, action) => {
        state.uploadingImages = false;
        state.error = action.payload as string;
      })
      .addCase(extendContractThunk.fulfilled, (state, action) => {
        const extendedContract = action.payload;

        // Cập nhật selectedContract nếu khớp ID
        if (
          state.selectedContract &&
          state.selectedContract._id === extendedContract._id
        ) {
          state.selectedContract = extendedContract;
        }

        // Cập nhật trong danh sách contracts nếu khớp
        const index = state.contracts.findIndex(
          c => c._id === extendedContract._id,
        );
        if (index !== -1) {
          state.contracts[index] = extendedContract;
        }
      })
      .addCase(extendContractThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(terminateContractThunk.fulfilled, (state, action) => {
        const terminatedContract = action.payload;

        if (
          state.selectedContract &&
          state.selectedContract._id === terminatedContract._id
        ) {
          state.selectedContract = terminatedContract;
        }

        const index = state.contracts.findIndex(
          c => c._id === terminatedContract._id,
        );
        if (index !== -1) {
          state.contracts[index] = terminatedContract;
        }
      })
      .addCase(terminateContractThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateTenants.pending, state => {
        state.selectedContractLoading = true;
        state.selectedContractError = null;
      })
      .addCase(updateTenants.fulfilled, (state, action) => {
        state.selectedContractLoading = false;
        const {contractId, data} = action.payload;
        const {coTenants, tenantCount, status} = data;

        console.log('Cập nhật thông tin người thuê 1:', coTenants);

        // Cập nhật trong danh sách contracts
        const contractIndex = state.contracts.findIndex(
          contract => contract._id === contractId,
        );
        if (contractIndex !== -1) {
          if (state.contracts[contractIndex].contractInfo) {
            state.contracts[contractIndex].contractInfo.coTenants = coTenants;
            state.contracts[contractIndex].contractInfo.tenantCount =
              tenantCount;
          }
          state.contracts[contractIndex].status = status;
          state.contracts[contractIndex].signedContractImages = []; // Xóa ảnh cũ
          state.contracts[contractIndex].contractPdfUrl = data.contractPdfUrl; // Cập nhật URL PDF
        }

        // Cập nhật selectedContract
        if (
          state.selectedContract &&
          state.selectedContract._id === contractId
        ) {
          if (state.selectedContract.contractInfo) {
            state.selectedContract.contractInfo.coTenants = coTenants;
            state.selectedContract.contractInfo.tenantCount = tenantCount;
          }
          state.selectedContract.status = status;
          state.selectedContract.signedContractImages = []; // Xóa ảnh cũ
          state.selectedContract.contractPdfUrl = data.contractPdfUrl; // Xóa ảnh cũ
        }
      })

      .addCase(updateTenants.rejected, (state, action) => {
        state.selectedContractLoading = false;
      })
      // Xóa hợp đồng
      .addCase(deleteContract.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteContract.fulfilled, (state, action) => {
        state.loading = false;
        const deletedContractId = action.payload.contractId;

        // Xóa hợp đồng khỏi danh sách contracts
        state.contracts = state.contracts.filter(
          contract => contract._id !== deletedContractId,
        );

        // Nếu hợp đồng đang được chọn là hợp đồng bị xóa, clear selectedContract
        if (
          state.selectedContract &&
          state.selectedContract._id === deletedContractId
        ) {
          state.selectedContract = null;
        }
      })
      .addCase(deleteContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(resignContractThunk.pending, state => {
        state.selectedContractLoading = true;
        state.selectedContractError = null;
      })
      .addCase(resignContractThunk.fulfilled, (state, action) => {
        state.selectedContractLoading = false;
        const {contract} = action.payload;

        // Cập nhật danh sách contracts
        const contractIndex = state.contracts.findIndex(
          c => c._id === contract._id,
        );
        if (contractIndex !== -1) {
          state.contracts[contractIndex].status = contract.status;
          state.contracts[contractIndex].signedContractImages = []; // Xóa ảnh cũ
        }

        // Cập nhật selectedContract
        if (
          state.selectedContract &&
          state.selectedContract._id === contract._id
        ) {
          state.selectedContract.status = contract.status;
          state.selectedContract.signedContractImages = []; // Xóa ảnh cũ
        }
      })
      .addCase(resignContractThunk.rejected, (state, action) => {
        state.selectedContractLoading = false;
        state.selectedContractError = action.payload as string;
      });
  },
});

export const {clearContractErrors, clearSelectedContract} =
  contractSlice.actions;
export default contractSlice.reducer;
