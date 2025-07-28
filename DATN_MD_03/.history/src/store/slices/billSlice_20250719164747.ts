import { createSlice, createAsyncThunk, PayloadAction, createAction } from '@reduxjs/toolkit';
import { Invoice } from '../../types/Bill';
import {
    getInvoices,
    getRoommateInvoices,
    getInvoiceDetails,
    getRoommateInvoiceDetails,
    confirmInvoicePayment,
    confirmInvoiceCompletion,
    updateInvoice as updateInvoiceService,
    addCustomInvoiceItem as addCustomInvoiceItemService,
    updateInvoiceItems as updateInvoiceItemsService,
    deleteInvoiceItem as deleteInvoiceItemService,
    saveInvoiceAsTemplate as saveInvoiceAsTemplateService,
    getInvoiceTemplates as getInvoiceTemplatesService,
    deleteInvoiceTemplate as deleteInvoiceTemplateService,
    markInvoiceAsPaid as markInvoiceAsPaidService,
    checkUserIsCoTenant
} from '../services/billService';

// Tạo action để cập nhật hóa đơn trong store mà không cần gọi API
export const updateInvoiceInStore = createAction<Invoice>('bill/updateInvoiceInStore');

// Thêm async thunk để kiểm tra nếu người dùng là người ở cùng
export const checkUserCoTenant = createAsyncThunk(
    'bill/checkUserCoTenant',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: { token: string } };
            const token = state.auth.token;
            
            if (!token) {
                return rejectWithValue('Không có token đăng nhập');
            }
            
            const response = await checkUserIsCoTenant(token);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể kiểm tra trạng thái người ở cùng');
        }
    }
);

interface BillState {
    loading: boolean;
    invoices: Invoice[];
    selectedInvoice: Invoice | null;
    roommateInvoice: Invoice | null; // Thêm state cho hóa đơn người ở cùng
    error: string | null;
    pagination: {
        page: number;
        limit: number;
        totalDocs: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    confirmPaymentLoading: boolean;
    confirmPaymentSuccess: boolean;
    confirmPaymentError: string | null;
    markAsPaidLoading: boolean;
    markAsPaidSuccess: boolean;
    markAsPaidError: string | null;
    completeInvoiceLoading: boolean;
    completeInvoiceSuccess: boolean;
    completeInvoiceError: string | null;
    updateInvoiceLoading: boolean;
    updateInvoiceSuccess: boolean;
    updateInvoiceError: string | null;
    addItemLoading: boolean;
    addItemSuccess: boolean;
    addItemError: string | null;
    updateItemsLoading: boolean;
    updateItemsSuccess: boolean;
    updateItemsError: string | null;
    deleteItemLoading: boolean;
    deleteItemSuccess: boolean;
    deleteItemError: string | null;
    saveTemplateLoading: boolean;
    saveTemplateSuccess: boolean;
    saveTemplateError: string | null;
    templatesLoading: boolean;
    templates: any[];
    templatesError: string | null;
    deleteTemplateLoading: boolean;
    deleteTemplateSuccess: boolean;
    deleteTemplateError: string | null;
    isCoTenant: boolean;
    coTenantContracts: any[];
    coTenantLoading: boolean;
    coTenantError: string | null;
}

const initialState: BillState = {
    loading: false,
    invoices: [],
    selectedInvoice: null,
    roommateInvoice: null, // Khởi tạo giá trị mặc định
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        totalDocs: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
    },
    confirmPaymentLoading: false,
    confirmPaymentSuccess: false,
    confirmPaymentError: null,
    markAsPaidLoading: false,
    markAsPaidSuccess: false,
    markAsPaidError: null,
    completeInvoiceLoading: false,
    completeInvoiceSuccess: false,
    completeInvoiceError: null,
    updateInvoiceLoading: false,
    updateInvoiceSuccess: false,
    updateInvoiceError: null,
    addItemLoading: false,
    addItemSuccess: false,
    addItemError: null,
    updateItemsLoading: false,
    updateItemsSuccess: false,
    updateItemsError: null,
    deleteItemLoading: false,
    deleteItemSuccess: false,
    deleteItemError: null,
    saveTemplateLoading: false,
    saveTemplateSuccess: false,
    saveTemplateError: null,
    templatesLoading: false,
    templates: [],
    templatesError: null,
    deleteTemplateLoading: false,
    deleteTemplateSuccess: false,
    deleteTemplateError: null,
    isCoTenant: false,
    coTenantContracts: [],
    coTenantLoading: false,
    coTenantError: null,
};

// Thunk để lấy danh sách hóa đơn
export const fetchInvoices = createAsyncThunk(
    'bill/fetchInvoices',
    async ({
        token,
        page = 1,
        limit = 10,
        status,
        query,
        signal,
    }: {
        token: string;
        page?: number;
        limit?: number;
        status?: string;
        query?: string;
        signal?: AbortSignal;
    }, { rejectWithValue }) => {
        try {
            const response = await getInvoices(token, page, limit, status, query, signal);

            if (!response.success) {
                throw new Error('Không thể tải danh sách hóa đơn');
            }

            return {
                invoices: response.data.invoices,
                pagination: response.data.pagination,
            };
        } catch (err: any) {
            if (err.name === 'AbortError') {
                return rejectWithValue('Request was cancelled');
            }
            return rejectWithValue(err.message || 'Không thể tải danh sách hóa đơn');
        }
    },
);

// Thunk để lấy danh sách hóa đơn của người ở cùng
export const fetchRoommateInvoices = createAsyncThunk(
    'bill/fetchRoommateInvoices',
    async ({
        token,
        page = 1,
        limit = 10,
        status,
        query,
        userId, // Thêm userId vào tham số
        signal,
    }: {
        token: string;
        page?: number;
        limit?: number;
        status?: string;
        query?: string;
        userId: string; // ID của người dùng hiện tại
        signal?: AbortSignal;
    }, { rejectWithValue }) => {
        try {
            const response = await getRoommateInvoices(token, page, limit, status, query, signal);

            if (!response.success) {
                throw new Error('Không thể tải danh sách hóa đơn người ở cùng');
            }

            // Lọc hóa đơn người ở cùng dựa trên userId và coTenants
            const filteredInvoices = response.data.invoices.filter(invoice => {
                // Kiểm tra nếu invoice có contractId và contractInfo
                if (invoice.contractId && 
                    typeof invoice.contractId === 'object' && 
                    invoice.contractId.contractInfo && 
                    invoice.contractId.contractInfo.coTenants) {
                    
                    // Kiểm tra xem userId có trong danh sách coTenants không
                    return invoice.contractId.contractInfo.coTenants.some(
                        (coTenant: any) => coTenant.userId === userId
                    );
                }
                return false; // Nếu không có thông tin hợp đồng hoặc coTenants, không hiển thị
            });

            return {
                invoices: filteredInvoices,
                pagination: response.data.pagination,
            };
        } catch (err: any) {
            if (err.name === 'AbortError') {
                return rejectWithValue('Request was cancelled');
            }
            return rejectWithValue(err.message || 'Không thể tải danh sách hóa đơn người ở cùng');
        }
    },
);

// Thunk để lấy chi tiết hóa đơn
export const fetchInvoiceDetails = createAsyncThunk(
    'bill/fetchInvoiceDetails',
    async ({ token, invoiceId }: { token: string; invoiceId: string }, { rejectWithValue }) => {
        try {
            const response = await getInvoiceDetails(token, invoiceId);

            if (!response.success) {
                throw new Error('Không thể tải chi tiết hóa đơn');
            }

            return response.data.invoice;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Không thể tải chi tiết hóa đơn');
        }
    },
);

// Thunk để lấy chi tiết hóa đơn của người ở cùng
export const fetchRoommateInvoiceDetails = createAsyncThunk(
    'bill/fetchRoommateInvoiceDetails',
    async ({ token, invoiceId }: { token: string; invoiceId: string }, { rejectWithValue }) => {
        try {
            const response = await getRoommateInvoiceDetails(token, invoiceId);

            if (!response.success) {
                throw new Error('Không thể tải chi tiết hóa đơn của người ở cùng');
            }

            return response.data.invoice;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Không thể tải chi tiết hóa đơn của người ở cùng');
        }
    },
);

// Thunk để xác nhận thanh toán hóa đơn (đánh dấu đã thanh toán)
export const confirmPayment = createAsyncThunk(
    'bill/confirmPayment',
    async ({ token, invoiceId }: { token: string; invoiceId: string }, { rejectWithValue }) => {
        try {
            const response = await confirmInvoicePayment(token, invoiceId);

            if (!response.success) {
                throw new Error(response.message || 'Không thể xác nhận thanh toán hóa đơn');
            }

            return response.invoice;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Không thể xác nhận thanh toán hóa đơn');
        }
    },
);

// Mark as paid (tenant)
export const markAsPaid = createAsyncThunk(
    'bill/markAsPaid',
    async ({ token, invoiceId, paymentMethod }: { token: string; invoiceId: string; paymentMethod: string }, { rejectWithValue }) => {
        try {
            const response = await markInvoiceAsPaidService(token, invoiceId, paymentMethod);

            if (!response.success) {
                throw new Error(response.message || 'Không thể thanh toán hóa đơn');
            }

            return response.invoice;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể thanh toán hóa đơn');
        }
    }
);

// Thunk để hoàn thành hóa đơn
export const completeInvoice = createAsyncThunk(
    'bill/completeInvoice',
    async ({ token, invoiceId }: { token: string; invoiceId: string }, { rejectWithValue }) => {
        try {
            const response = await confirmInvoiceCompletion(token, invoiceId);

            if (!response.success) {
                throw new Error(response.message || 'Không thể hoàn thành hóa đơn');
            }

            return response.data.invoice;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Không thể hoàn thành hóa đơn');
        }
    },
);

// Update invoice action
export const updateInvoice = createAsyncThunk(
    'bill/updateInvoice',
    async ({
        token,
        invoiceId,
        updateData,
        updateType = 'all' // 'basic' for dueDate/note, 'items' for items, 'all' for everything
    }: {
        token: string;
        invoiceId: string;
        updateData: any;
        updateType?: 'basic' | 'items' | 'all';
    }, { rejectWithValue }) => {
        try {
            const response = await updateInvoiceService(token, invoiceId, updateData, updateType);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update invoice');
        }
    }
);

// Add custom invoice item
export const addCustomInvoiceItem = createAsyncThunk(
    'bill/addCustomInvoiceItem',
    async ({
        token,
        invoiceId,
        itemData
    }: {
        token: string;
        invoiceId: string;
        itemData: {
            name: string;
            description: string;
            quantity: number;
            unitPrice: number;
            category: string;
            isRecurring: boolean;
        }
    }, { rejectWithValue }) => {
        try {
            const response = await addCustomInvoiceItemService(token, invoiceId, itemData);

            if (!response.success) {
                throw new Error(response.message || 'Không thể thêm khoản mục tùy chỉnh');
            }

            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể thêm khoản mục tùy chỉnh');
        }
    }
);

// Update specific invoice items (utilities and custom items)
export const updateInvoiceItems = createAsyncThunk(
    'bill/updateInvoiceItems',
    async ({
        token,
        invoiceId,
        items
    }: {
        token: string;
        invoiceId: string;
        items: Array<{
            itemId: string;
            name?: string;
            description?: string;
            quantity?: number;
            unitPrice?: number;
            previousReading?: number;
            currentReading?: number;
        }>
    }, { rejectWithValue }) => {
        try {
            const response = await updateInvoiceItemsService(token, invoiceId, items);

            if (!response.success) {
                throw new Error(response.message || 'Không thể cập nhật khoản mục hóa đơn');
            }

            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể cập nhật khoản mục hóa đơn');
        }
    }
);

// Delete invoice item
export const deleteInvoiceItem = createAsyncThunk(
    'bill/deleteInvoiceItem',
    async ({
        token,
        invoiceId,
        itemId
    }: {
        token: string;
        invoiceId: string;
        itemId: string;
    }, { rejectWithValue }) => {
        try {
            const response = await deleteInvoiceItemService(token, invoiceId, itemId);

            if (!response.success) {
                throw new Error(response.message || 'Không thể xóa khoản mục');
            }

            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể xóa khoản mục');
        }
    }
);

// Save invoice as template
export const saveInvoiceAsTemplate = createAsyncThunk(
    'bill/saveInvoiceAsTemplate',
    async ({
        token,
        invoiceId,
        templateName
    }: {
        token: string;
        invoiceId: string;
        templateName: string;
    }, { rejectWithValue }) => {
        try {
            const response = await saveInvoiceAsTemplateService(token, invoiceId, templateName);

            if (!response.success) {
                throw new Error(response.message || 'Không thể lưu mẫu hóa đơn');
            }

            return response.data.template;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể lưu mẫu hóa đơn');
        }
    }
);

// Fetch invoice templates
export const fetchInvoiceTemplates = createAsyncThunk(
    'bill/fetchInvoiceTemplates',
    async ({ token }: { token: string }, { rejectWithValue }) => {
        try {
            const response = await getInvoiceTemplatesService(token);

            if (!response.success) {
                throw new Error('Không thể tải danh sách mẫu hóa đơn');
            }

            return response.data.templates;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể tải danh sách mẫu hóa đơn');
        }
    }
);

// Delete invoice template
export const deleteInvoiceTemplate = createAsyncThunk(
    'bill/deleteInvoiceTemplate',
    async ({ token, templateId }: { token: string; templateId: string }, { rejectWithValue }) => {
        try {
            const response = await deleteInvoiceTemplateService(token, templateId);

            if (!response.success) {
                throw new Error(response.message || 'Không thể xóa mẫu hóa đơn');
            }

            return { templateId, message: response.message };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể xóa mẫu hóa đơn');
        }
    }
);

const billSlice = createSlice({
    name: 'bill',
    initialState,
    reducers: {
        clearBillErrors: state => {
            state.error = null;
        },
        resetBillState: () => initialState,
        resetConfirmPaymentState: (state) => {
            state.confirmPaymentLoading = false;
            state.confirmPaymentSuccess = false;
            state.confirmPaymentError = null;
        },
        resetMarkAsPaidState: (state) => {
            state.markAsPaidLoading = false;
            state.markAsPaidSuccess = false;
            state.markAsPaidError = null;
        },
        resetCompleteInvoiceState: (state) => {
            state.completeInvoiceLoading = false;
            state.completeInvoiceSuccess = false;
            state.completeInvoiceError = null;
        },
        resetUpdateInvoiceState: (state) => {
            state.updateInvoiceLoading = false;
            state.updateInvoiceSuccess = false;
            state.updateInvoiceError = null;
        },
        resetAddItemState: (state) => {
            state.addItemLoading = false;
            state.addItemSuccess = false;
            state.addItemError = null;
        },
        resetUpdateItemsState: (state) => {
            state.updateItemsLoading = false;
            state.updateItemsSuccess = false;
            state.updateItemsError = null;
        },
        resetDeleteItemState: (state) => {
            state.deleteItemLoading = false;
            state.deleteItemSuccess = false;
            state.deleteItemError = null;
        },
        resetSaveTemplateState: (state) => {
            state.saveTemplateLoading = false;
            state.saveTemplateSuccess = false;
            state.saveTemplateError = null;
        },
        resetTemplatesState: (state) => {
            state.templatesLoading = false;
            state.templates = [];
            state.templatesError = null;
        },
        resetDeleteTemplateState: (state) => {
            state.deleteTemplateLoading = false;
            state.deleteTemplateSuccess = false;
            state.deleteTemplateError = null;
        }
    },
    extraReducers: builder => {
        builder
            // Xử lý fetchInvoices
            .addCase(fetchInvoices.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInvoices.fulfilled, (state, action) => {
                state.loading = false;
                // Kiểm tra khi nối thêm dữ liệu mới (trang > 1)
                if (action.meta.arg.page && action.meta.arg.page > 1) {
                    // Nối thêm dữ liệu mới vào danh sách hiện tại
                    state.invoices = [...state.invoices, ...action.payload.invoices];
                } else {
                    // Thay thế toàn bộ danh sách (trang đầu tiên)
                    state.invoices = action.payload.invoices;
                }

                state.pagination = {
                    page: action.payload.pagination.page,
                    limit: action.payload.pagination.limit,
                    totalDocs: action.payload.pagination.totalDocs,
                    totalPages: action.payload.pagination.totalPages,
                    hasNextPage: action.payload.pagination.hasNextPage,
                    hasPrevPage: action.payload.pagination.hasPrevPage,
                };
            })
            .addCase(fetchInvoices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Xử lý fetchRoommateInvoices
            .addCase(fetchRoommateInvoices.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRoommateInvoices.fulfilled, (state, action) => {
                state.loading = false;
                
                // Kiểm tra và đảm bảo mỗi hóa đơn người ở cùng đều có isRoommate = true
                // Thêm hậu tố "-roommate" vào _id và id để đảm bảo tính duy nhất
                const roommateInvoices = action.payload.invoices.map(invoice => ({
                    ...invoice,
                    _id: invoice._id ? `${invoice._id}-roommate` : undefined,
                    id: invoice.id ? `${invoice.id}-roommate` : undefined,
                    isRoommate: true // Luôn đảm bảo thuộc tính này được đặt
                }));
                
                // Kiểm tra khi nối thêm dữ liệu mới (trang > 1)
                if (action.meta.arg.page && action.meta.arg.page > 1) {
                    // Nối thêm dữ liệu mới vào danh sách hiện tại
                    // Lọc ra các hóa đơn người ở cùng hiện tại để tránh trùng lặp
                    const currentInvoices = state.invoices.filter(invoice => !invoice.isRoommate);
                    state.invoices = [...currentInvoices, ...roommateInvoices];
                } else {
                    // Trang đầu tiên: giữ lại các hóa đơn thông thường và thêm hóa đơn người ở cùng
                    const regularInvoices = state.invoices.filter(invoice => !invoice.isRoommate);
                    state.invoices = [...regularInvoices, ...roommateInvoices];
                }

                state.pagination = {
                    page: action.payload.pagination.page,
                    limit: action.payload.pagination.limit,
                    totalDocs: action.payload.pagination.totalDocs,
                    totalPages: action.payload.pagination.totalPages,
                    hasNextPage: action.payload.pagination.hasNextPage,
                    hasPrevPage: action.payload.pagination.hasPrevPage,
                };
            })
            .addCase(fetchRoommateInvoices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Xử lý fetchInvoiceDetails
            .addCase(fetchInvoiceDetails.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInvoiceDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedInvoice = action.payload;
            })
            .addCase(fetchInvoiceDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Xử lý fetchRoommateInvoiceDetails
            .addCase(fetchRoommateInvoiceDetails.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRoommateInvoiceDetails.fulfilled, (state, action) => {
                state.loading = false;
                // Đảm bảo hóa đơn của người ở cùng được đánh dấu đúng
                state.roommateInvoice = {
                    ...action.payload,
                    isRoommate: true
                };
                console.log("Roommate invoice details loaded:", state.roommateInvoice._id);
            })
            .addCase(fetchRoommateInvoiceDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.roommateInvoice = null; // Đặt lại state khi có lỗi
            })

            // Xử lý confirmPayment
            .addCase(confirmPayment.pending, state => {
                state.confirmPaymentLoading = true;
                state.confirmPaymentSuccess = false;
                state.confirmPaymentError = null;
            })
            .addCase(confirmPayment.fulfilled, (state, action) => {
                state.confirmPaymentLoading = false;
                state.confirmPaymentSuccess = true;

                // Log the received invoice data
                console.log('confirmPayment.fulfilled - received invoice data:', action.payload);

                // Cập nhật hóa đơn được chọn
                if (action.payload && action.payload._id) {
                    state.selectedInvoice = action.payload;
                    console.log('Updated selectedInvoice with new data');
                } else {
                    console.warn('confirmPayment.fulfilled - Invalid invoice data received:', action.payload);
                }

                // Cập nhật trong danh sách invoices nếu có
                if (action.payload && action.payload._id) {
                    const index = state.invoices.findIndex(inv => inv._id === action.payload._id);
                    if (index !== -1) {
                        state.invoices[index] = action.payload;
                        console.log('Updated invoice in invoices list at index:', index);
                    }
                }
            })
            .addCase(confirmPayment.rejected, (state, action) => {
                state.confirmPaymentLoading = false;
                state.confirmPaymentError = action.payload as string;
            })

            // Xử lý markAsPaid
            .addCase(markAsPaid.pending, (state) => {
                state.markAsPaidLoading = true;
                state.markAsPaidSuccess = false;
                state.markAsPaidError = null;
            })
            .addCase(markAsPaid.fulfilled, (state, action) => {
                state.markAsPaidLoading = false;
                state.markAsPaidSuccess = true;

                // Log the received invoice data
                console.log('markAsPaid.fulfilled - received invoice data:', action.payload);

                // Cập nhật hóa đơn được chọn
                if (action.payload && action.payload._id) {
                    state.selectedInvoice = action.payload;

                    // Cập nhật trong danh sách invoices nếu có
                    const index = state.invoices.findIndex(inv => inv._id === action.payload._id);
                    if (index !== -1) {
                        state.invoices[index] = action.payload;
                    }
                }
            })
            .addCase(markAsPaid.rejected, (state, action) => {
                state.markAsPaidLoading = false;
                state.markAsPaidError = action.payload as string;
            })

            // Xử lý completeInvoice
            .addCase(completeInvoice.pending, state => {
                state.completeInvoiceLoading = true;
                state.completeInvoiceSuccess = false;
                state.completeInvoiceError = null;
            })
            .addCase(completeInvoice.fulfilled, (state, action) => {
                state.completeInvoiceLoading = false;
                state.completeInvoiceSuccess = true;
                state.selectedInvoice = action.payload;

                // Cập nhật hóa đơn trong danh sách nếu có
                const index = state.invoices.findIndex(invoice =>
                    invoice._id === action.payload._id || invoice.id === action.payload.id
                );
                if (index !== -1) {
                    state.invoices[index] = action.payload;
                }
            })
            .addCase(completeInvoice.rejected, (state, action) => {
                state.completeInvoiceLoading = false;
                state.completeInvoiceError = action.payload as string;
            })

            // Update invoice reducers
            .addCase(updateInvoice.pending, (state) => {
                state.updateInvoiceLoading = true;
                state.updateInvoiceSuccess = false;
                state.updateInvoiceError = null;
            })
            .addCase(updateInvoice.fulfilled, (state, action) => {
                state.updateInvoiceLoading = false;
                state.updateInvoiceSuccess = true;

                // Update the invoice in the list if it exists
                if (action.payload.data?.invoice) {
                    const updatedInvoice = action.payload.data.invoice;
                    const index = state.invoices.findIndex(inv => inv._id === updatedInvoice._id);

                    if (index !== -1) {
                        state.invoices[index] = updatedInvoice;
                    }

                    // Update selectedInvoice if it's the same invoice
                    if (state.selectedInvoice && state.selectedInvoice._id === updatedInvoice._id) {
                        state.selectedInvoice = updatedInvoice;
                    }
                }
            })
            .addCase(updateInvoice.rejected, (state, action) => {
                state.updateInvoiceLoading = false;
                state.updateInvoiceError = action.payload as string;
            })

            // Add custom invoice item reducers
            .addCase(addCustomInvoiceItem.pending, (state) => {
                state.addItemLoading = true;
                state.addItemSuccess = false;
                state.addItemError = null;
            })
            .addCase(addCustomInvoiceItem.fulfilled, (state, action) => {
                state.addItemLoading = false;
                state.addItemSuccess = true;

                // Update selected invoice and invoice in list if available
                if (action.payload.data?.invoice) {
                    const updatedInvoice = action.payload.data.invoice;

                    // Update in invoices list
                    const index = state.invoices.findIndex(inv => inv._id === updatedInvoice._id);
                    if (index !== -1) {
                        state.invoices[index] = updatedInvoice;
                    }

                    // Update selectedInvoice
                    if (state.selectedInvoice && state.selectedInvoice._id === updatedInvoice._id) {
                        state.selectedInvoice = updatedInvoice;
                    }
                }
            })
            .addCase(addCustomInvoiceItem.rejected, (state, action) => {
                state.addItemLoading = false;
                state.addItemError = action.payload as string;
            })

            // Update invoice items reducers
            .addCase(updateInvoiceItems.pending, (state) => {
                state.updateItemsLoading = true;
                state.updateItemsSuccess = false;
                state.updateItemsError = null;
            })
            .addCase(updateInvoiceItems.fulfilled, (state, action) => {
                state.updateItemsLoading = false;
                state.updateItemsSuccess = true;

                // Update selected invoice and invoice in list if available
                if (action.payload.data?.invoice) {
                    const updatedInvoice = action.payload.data.invoice;

                    // Update in invoices list
                    const index = state.invoices.findIndex(inv => inv._id === updatedInvoice._id);
                    if (index !== -1) {
                        state.invoices[index] = updatedInvoice;
                    }

                    // Update selectedInvoice
                    if (state.selectedInvoice && state.selectedInvoice._id === updatedInvoice._id) {
                        state.selectedInvoice = updatedInvoice;
                    }
                }
            })
            .addCase(updateInvoiceItems.rejected, (state, action) => {
                state.updateItemsLoading = false;
                state.updateItemsError = action.payload as string;
            })

            // Delete invoice item reducers
            .addCase(deleteInvoiceItem.pending, (state) => {
                state.deleteItemLoading = true;
                state.deleteItemSuccess = false;
                state.deleteItemError = null;
            })
            .addCase(deleteInvoiceItem.fulfilled, (state, action) => {
                state.deleteItemLoading = false;
                state.deleteItemSuccess = true;

                // Update selected invoice and invoice in list if available
                if (action.payload.data?.invoice) {
                    const updatedInvoice = action.payload.data.invoice;

                    // Update in invoices list
                    const index = state.invoices.findIndex(inv => inv._id === updatedInvoice._id);
                    if (index !== -1) {
                        state.invoices[index] = updatedInvoice;
                    }

                    // Update selectedInvoice
                    if (state.selectedInvoice && state.selectedInvoice._id === updatedInvoice._id) {
                        state.selectedInvoice = updatedInvoice;
                    }
                }
            })
            .addCase(deleteInvoiceItem.rejected, (state, action) => {
                state.deleteItemLoading = false;
                state.deleteItemError = action.payload as string;
            })

            // Save template reducers
            .addCase(saveInvoiceAsTemplate.pending, (state) => {
                state.saveTemplateLoading = true;
                state.saveTemplateSuccess = false;
                state.saveTemplateError = null;
            })
            .addCase(saveInvoiceAsTemplate.fulfilled, (state, action) => {
                state.saveTemplateLoading = false;
                state.saveTemplateSuccess = true;
                // No specific action to update state.templates directly here,
                // as templates are fetched separately.
            })
            .addCase(saveInvoiceAsTemplate.rejected, (state, action) => {
                state.saveTemplateLoading = false;
                state.saveTemplateError = action.payload as string;
            })

            // Fetch templates reducers
            .addCase(fetchInvoiceTemplates.pending, (state) => {
                state.templatesLoading = true;
                state.templatesError = null;
            })
            .addCase(fetchInvoiceTemplates.fulfilled, (state, action) => {
                state.templatesLoading = false;
                state.templates = action.payload;
            })
            .addCase(fetchInvoiceTemplates.rejected, (state, action) => {
                state.templatesLoading = false;
                state.templatesError = action.payload as string;
            })

            // Delete template reducers
            .addCase(deleteInvoiceTemplate.pending, (state) => {
                state.deleteTemplateLoading = true;
                state.deleteTemplateSuccess = false;
                state.deleteTemplateError = null;
            })
            .addCase(deleteInvoiceTemplate.fulfilled, (state, action) => {
                state.deleteTemplateLoading = false;
                state.deleteTemplateSuccess = true;
                // Xóa template khỏi danh sách
                state.templates = state.templates.filter(template => template._id !== action.payload.templateId);
            })
            .addCase(deleteInvoiceTemplate.rejected, (state, action) => {
                state.deleteTemplateLoading = false;
                state.deleteTemplateError = action.payload as string;
            })

            // Xử lý action updateInvoiceInStore
            .addCase(updateInvoiceInStore, (state, action) => {
                const updatedInvoice = action.payload;

                // Cập nhật selectedInvoice nếu đang được chọn
                if (state.selectedInvoice && state.selectedInvoice._id === updatedInvoice._id) {
                    state.selectedInvoice = updatedInvoice;
                }

                // Cập nhật trong danh sách invoices nếu có
                const index = state.invoices.findIndex(inv =>
                    inv._id === updatedInvoice._id || inv.id === updatedInvoice.id
                );

                if (index !== -1) {
                    state.invoices[index] = updatedInvoice;
                }
            });
    },
});

// Export actions
export const {
    clearBillErrors,
    resetBillState,
    resetConfirmPaymentState,
    resetMarkAsPaidState,
    resetCompleteInvoiceState,
    resetUpdateInvoiceState,
    resetAddItemState,
    resetUpdateItemsState,
    resetDeleteItemState,
    resetSaveTemplateState,
    resetTemplatesState,
    resetDeleteTemplateState
} = billSlice.actions;

export default billSlice.reducer; 