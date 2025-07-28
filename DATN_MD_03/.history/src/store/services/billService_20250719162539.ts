import { api } from '../../api/api';
import { Invoice } from '../../types/Bill';
import { Contract } from '../../types/Contract';

// Định nghĩa response type từ API thực tế
interface InvoicesResponse {
    success: boolean;
    invoices: Invoice[];
}

// Định nghĩa response type cho danh sách hợp đồng
interface ContractsResponse {
    success: boolean;
    message: string;
    data: {
        contracts: Contract[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        }
    }
}

// Interface cho request tạo hóa đơn
interface CreateInvoiceRequest {
    contractId: string;
    month: number;
    year: number;
    dueDate: string;
    includeServices: boolean;
}

// Interface cho item tùy chỉnh
interface CustomInvoiceItem {
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    category: string;
    isRecurring: boolean;
}

// Lấy danh sách hóa đơn
export const getInvoices = async (
    token: string,
    page: number = 1,
    limit: number = 10,
    status?: string,
    query?: string,
    signal?: AbortSignal,
) => {
    try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());

        if (status) {
            queryParams.append('status', status);
        }

        if (query) {
            queryParams.append('search', query);
        }

        // Log chỉ trong môi trường dev
        if (__DEV__) {
            console.log('API Request to:', `/billing/invoices?${queryParams.toString()}`);
        }

        const response = await api.get<InvoicesResponse>(
            `/billing/invoices?${queryParams.toString()}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                signal, // Thêm signal để hủy request
            },
        );

        if ('isError' in response) {
            throw new Error(response.message);
        }

        // Nếu không có pagination từ API, tạo mặc định
        return {
            success: response.data.success,
            data: {
                invoices: response.data.invoices || [],
                pagination: {
                    totalDocs: response.data.invoices?.length || 0,
                    totalPages: 1,
                    page: page,
                    limit: limit,
                    hasNextPage: false,
                    hasPrevPage: page > 1
                }
            }
        };
    } catch (error: any) {
        // Kiểm tra nếu là lỗi do abort
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
            console.log('Request aborted');
            throw error;
        }
        
        console.error('Error fetching invoices:', error.message);
        // Trả về dữ liệu rỗng để tránh crash
        return {
            success: false,
            data: {
                invoices: [],
                pagination: {
                    totalDocs: 0,
                    totalPages: 1,
                    page: 1,
                    limit: 10,
                    hasNextPage: false,
                    hasPrevPage: false
                }
            }
        };
    }
};

// Lấy danh sách hóa đơn của người ở cùng (roommate)
export const getRoommateInvoices = async (
    token: string,
    page: number = 1,
    limit: number = 10,
    status?: string,
    query?: string,
    signal?: AbortSignal,
) => {
    try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());

        if (status) {
            queryParams.append('status', status);
        }

        if (query) {
            queryParams.append('search', query);
        }

        // Log chỉ trong môi trường dev
        if (__DEV__) {
            console.log('API Request to:', `/billing/roommate/invoices?${queryParams.toString()}`);
        }

        const response = await api.get<InvoicesResponse>(
            `/billing/roommate/invoices?${queryParams.toString()}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                signal, // Thêm signal để hủy request
            },
        );

        if ('isError' in response) {
            throw new Error(response.message);
        }

        // Đánh dấu tất cả các hóa đơn là của người ở cùng
        const invoicesWithRoommate = response.data.invoices?.map(invoice => ({
            ...invoice,
            isRoommate: true // Luôn đảm bảo thuộc tính này được đặt
        })) || [];

        // Nếu không có pagination từ API, tạo mặc định
        return {
            success: response.data.success,
            data: {
                invoices: invoicesWithRoommate,
                pagination: {
                    totalDocs: response.data.invoices?.length || 0,
                    totalPages: 1,
                    page: page,
                    limit: limit,
                    hasNextPage: false,
                    hasPrevPage: page > 1
                }
            }
        };
    } catch (error: any) {
        // Kiểm tra nếu là lỗi do abort
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
            console.log('Request aborted');
            throw error;
        }
        
        console.error('Error fetching roommate invoices:', error.message);
        // Trả về dữ liệu rỗng để tránh crash
        return {
            success: false,
            data: {
                invoices: [],
                pagination: {
                    totalDocs: 0,
                    totalPages: 1,
                    page: 1,
                    limit: 10,
                    hasNextPage: false,
                    hasPrevPage: false
                }
            }
        };
    }
};

// Lấy chi tiết hóa đơn
export const getInvoiceDetails = async (token: string, invoiceId: string) => {
    try {
        console.log('Fetching invoice details for:', invoiceId);

        const response = await api.get<{ success: boolean; invoice: Invoice; items: any[] }>(
            `/billing/invoices/${invoiceId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        console.log('Invoice details API response structure:', {
            success: response.data.success,
            hasInvoice: !!response.data.invoice,
            hasItems: Array.isArray(response.data.items),
            invoiceStructure: response.data.invoice ? {
                hasRoomId: !!response.data.invoice.roomId,
                roomIdType: response.data.invoice.roomId ? typeof response.data.invoice.roomId : 'undefined',
                hasTenantId: !!response.data.invoice.tenantId,
                tenantIdType: response.data.invoice.tenantId ? typeof response.data.invoice.tenantId : 'undefined',
                hasContractId: !!response.data.invoice.contractId,
                contractIdType: response.data.invoice.contractId ? typeof response.data.invoice.contractId : 'undefined',
            } : 'No invoice data'
        });

        if ('isError' in response) {
            throw new Error(response.message);
        }

        // Process the invoice data to ensure consistent format
        const processedInvoice = { ...response.data.invoice };

        // Thêm items vào invoice nếu có
        if (response.data.items && Array.isArray(response.data.items)) {
            processedInvoice.items = response.data.items;
        }

        // Nếu contractId là object nhưng không có contractInfo, thử lấy lại từ API
        if (processedInvoice.contractId &&
            typeof processedInvoice.contractId === 'object' &&
            !processedInvoice.contractId.contractInfo) {

            console.log('Phát hiện contractId thiếu thông tin contractInfo, cố gắng lấy thêm dữ liệu');

            // Lưu ID của hợp đồng để có thể tham chiếu sau này
            const contractId = typeof processedInvoice.contractId === 'object' ?
                processedInvoice.contractId._id : processedInvoice.contractId;

            // Lưu lại thông tin roomId và tenantId để sử dụng cho việc hiển thị
            // ngay cả khi không thể lấy được thông tin hợp đồng đầy đủ
            if (typeof processedInvoice.roomId === 'string' && contractId) {
                console.log('roomId là string, cần hiển thị từ thông tin hợp đồng');
            }

            if (typeof processedInvoice.tenantId === 'string' && contractId) {
                console.log('tenantId là string, cần hiển thị từ thông tin hợp đồng');
            }
        }

        return {
            success: response.data.success,
            data: {
                invoice: processedInvoice
            }
        };
    } catch (error: any) {
        console.error('Error fetching invoice details:', error.message);
        throw error;
    }
};

// Lấy chi tiết hóa đơn người ở cùng
export const getRoommateInvoiceDetails = async (token: string, invoiceId: string) => {
    try {
        console.log('Fetching roommate invoice details for:', invoiceId);

        const response = await api.get<{ success: boolean; invoice: Invoice; items: any[] }>(
            `/billing/roommate/invoices/${invoiceId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        console.log('Roommate invoice details API response structure:', {
            success: response.data.success,
            hasInvoice: !!response.data.invoice,
            hasItems: Array.isArray(response.data.items),
            invoiceStructure: response.data.invoice ? {
                hasRoomId: !!response.data.invoice.roomId,
                roomIdType: response.data.invoice.roomId ? typeof response.data.invoice.roomId : 'undefined',
                hasTenantId: !!response.data.invoice.tenantId,
                tenantIdType: response.data.invoice.tenantId ? typeof response.data.invoice.tenantId : 'undefined',
                hasContractId: !!response.data.invoice.contractId,
                contractIdType: response.data.invoice.contractId ? typeof response.data.invoice.contractId : 'undefined',
            } : 'No invoice data'
        });

        if ('isError' in response) {
            throw new Error(response.message);
        }

        // Process the invoice data to ensure consistent format
        const processedInvoice = { 
            ...response.data.invoice,
            isRoommate: true // Đánh dấu đây là hóa đơn của người ở cùng
        };

        // Thêm items vào invoice nếu có
        if (response.data.items && Array.isArray(response.data.items)) {
            processedInvoice.items = response.data.items;
        }

        // Nếu contractId là object nhưng không có contractInfo, thử lấy lại từ API
        if (processedInvoice.contractId &&
            typeof processedInvoice.contractId === 'object' &&
            !processedInvoice.contractId.contractInfo) {

            console.log('Phát hiện contractId thiếu thông tin contractInfo, cố gắng lấy thêm dữ liệu');

            // Lưu ID của hợp đồng để có thể tham chiếu sau này
            const contractId = typeof processedInvoice.contractId === 'object' ?
                processedInvoice.contractId._id : processedInvoice.contractId;

            // Lưu lại thông tin roomId và tenantId để sử dụng cho việc hiển thị
            // ngay cả khi không thể lấy được thông tin hợp đồng đầy đủ
            if (typeof processedInvoice.roomId === 'string' && contractId) {
                console.log('roomId là string, cần hiển thị từ thông tin hợp đồng');
            }

            if (typeof processedInvoice.tenantId === 'string' && contractId) {
                console.log('tenantId là string, cần hiển thị từ thông tin hợp đồng');
            }
        }

        return {
            success: response.data.success,
            data: {
                invoice: processedInvoice
            }
        };
    } catch (error: any) {
        console.error('Error fetching roommate invoice details:', error.message);
        throw error;
    }
};

// Xác nhận thanh toán hóa đơn bằng tiền mặt (đánh dấu đã thanh toán)
export const confirmInvoicePayment = async (token: string, invoiceId: string) => {
    try {
        console.log('Confirming payment for invoice:', invoiceId);

        const response = await api.post<{ success: boolean; message: string; invoice: Invoice }>(
            `/billing/invoices/${invoiceId}/confirm-payment`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            },
        );

        console.log('Confirm payment API response:', JSON.stringify(response.data, null, 2));

        if ('isError' in response) {
            throw new Error(response.message || 'Có lỗi xảy ra khi xác nhận thanh toán');
        }

        // Check if the invoice data is present in the response
        if (!response.data.invoice) {
            console.error('No invoice data in confirm payment response');
            throw new Error('Không nhận được dữ liệu hóa đơn từ server');
        }

        return {
            success: response.data.success,
            message: response.data.message || 'Đã xác nhận thanh toán thành công',
            invoice: response.data.invoice
        };
    } catch (error: any) {
        console.error('Error confirming payment:', error.message);
        throw error;
    }
};

// Người thuê thanh toán hóa đơn với phương thức thanh toán
export const markInvoiceAsPaid = async (token: string, invoiceId: string, paymentMethod: string) => {
    try {
        console.log('Marking invoice as paid:', { invoiceId, paymentMethod });

        const response = await api.post<{ success: boolean; message: string; invoice: Invoice }>(
            `/billing/tenant/invoices/${invoiceId}/mark-as-paid`,
            { paymentMethod },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            },
        );

        console.log('Mark as paid API response:', JSON.stringify(response.data, null, 2));

        if ('isError' in response) {
            throw new Error(response.message || 'Có lỗi xảy ra khi thanh toán hóa đơn');
        }

        return {
            success: response.data.success,
            message: response.data.message || 'Đã thanh toán hóa đơn thành công',
            invoice: response.data.invoice
        };
    } catch (error: any) {
        console.error('Error marking invoice as paid:', error.message);
        throw error;
    }
};

// Hoàn thành hóa đơn (xác nhận thanh toán)
export const confirmInvoiceCompletion = async (token: string, invoiceId: string) => {
    try {
        const response = await api.post<{ success: boolean; message: string; invoice: Invoice }>(
            `/billing/invoices/${invoiceId}/finalize`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        console.log('Finalize invoice API response:', JSON.stringify(response.data, null, 2));

        if ('isError' in response) {
            throw new Error(response.message);
        }

        return {
            success: response.data.success,
            message: response.data.message || 'Đã phát hành hóa đơn thành công',
            data: {
                invoice: response.data.invoice
            }
        };
    } catch (error: any) {
        console.error('Error finalizing invoice:', error.message);
        throw error;
    }
};

// Lấy danh sách hợp đồng của tôi
export const getMyContracts = async (token: string, page: number = 1, limit: number = 10) => {
    try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());

        console.log('API Request to:', `/contract/my-contracts?${queryParams.toString()}`);

        const response = await api.get<ContractsResponse>(
            `/contract/my-contracts?${queryParams.toString()}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        console.log('Contracts API response:', JSON.stringify(response.data, null, 2));

        if ('isError' in response) {
            throw new Error(response.message);
        }

        return {
            success: response.data.success,
            message: response.data.message,
            data: response.data.data
        };
    } catch (error: any) {
        console.error('Error fetching contracts:', error.message);
        // Trả về dữ liệu rỗng để tránh crash
        return {
            success: false,
            message: error.message || 'Có lỗi xảy ra khi lấy danh sách hợp đồng',
            data: {
                contracts: [],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPrevPage: false
                }
            }
        };
    }
};

// Tạo hóa đơn mới
export const createInvoice = async (token: string, data: CreateInvoiceRequest) => {
    try {
        console.log('Creating invoice with data:', data);

        const response = await api.post<{ success: boolean; message: string; invoice: Invoice }>(
            '/billing/invoices/create',
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            },
        );

        console.log('Create invoice API response:', JSON.stringify(response.data, null, 2));

        if ('isError' in response) {
            // Kiểm tra nếu lỗi là do trùng lặp
            if (response.message &&
                (response.message.toLowerCase().includes('đã tồn tại') ||
                    response.message.toLowerCase().includes('duplicate') ||
                    response.message.toLowerCase().includes('already exists'))) {
                return {
                    success: false,
                    message: `Hóa đơn cho tháng ${data.month}/${data.year} đã tồn tại`,
                    data: { invoice: null }
                };
            }

            // Tạo lỗi với status code
            const error: any = new Error(response.message);
            error.status = response.status || 500;
            throw error;
        }

        // Đảm bảo rằng response.data.invoice có _id
        if (response.data.success && response.data.invoice && !response.data.invoice._id) {
            console.warn('Invoice created but no _id returned from API');
        }

        return {
            success: response.data.success,
            message: response.data.message || 'Đã tạo hóa đơn thành công',
            data: {
                invoice: response.data.invoice
            }
        };
    } catch (error: any) {
        console.error('Error creating invoice:', error);

        // Kiểm tra nếu lỗi từ API là do trùng lặp
        if (error.message &&
            (error.message.toLowerCase().includes('đã tồn tại') ||
                error.message.toLowerCase().includes('duplicate') ||
                error.message.toLowerCase().includes('already exists'))) {
            return {
                success: false,
                message: `Hóa đơn cho tháng ${data.month}/${data.year} đã tồn tại`,
                data: { invoice: null }
            };
        }

        // Kiểm tra nếu lỗi có status code
        if (error.response && error.response.status) {
            const newError: any = new Error(error.message || 'Lỗi khi tạo hóa đơn');
            newError.status = error.response.status;
            throw newError;
        }

        throw error;
    }
};

// Kiểm tra hóa đơn trùng lặp
export const checkDuplicateInvoice = async (token: string, contractId: string, month: number, year: number) => {
    try {
        const queryParams = new URLSearchParams();
        queryParams.append('contractId', contractId);
        queryParams.append('month', month.toString());
        queryParams.append('year', year.toString());

        console.log('Checking for duplicate invoice:', { contractId, month, year });

        // Kiểm tra xem API endpoint có tồn tại không
        try {
            const response = await api.get<{ success: boolean; exists: boolean; message: string }>(
                `/billing/invoices/check-duplicate?${queryParams.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            console.log('Check duplicate API response:', JSON.stringify(response.data, null, 2));

            if ('isError' in response) {
                throw new Error(response.message);
            }

            return {
                success: response.data.success,
                exists: response.data.exists || false,
                message: response.data.message || ''
            };
        } catch (apiError: any) {
            console.error('API Error checking duplicate invoice:', apiError);

            // Nếu API trả về 404 (Not Found), nghĩa là endpoint không tồn tại
            if (apiError.status === 404) {
                console.log('API endpoint không tồn tại, thực hiện kiểm tra thủ công');

                // Thực hiện kiểm tra thủ công bằng cách lấy danh sách hóa đơn của hợp đồng
                // và kiểm tra xem có hóa đơn nào trùng tháng/năm không
                try {
                    const invoicesResponse = await api.get<{ success: boolean; invoices: Invoice[] }>(
                        `/billing/invoices?contractId=${contractId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        },
                    );

                    if ('isError' in invoicesResponse) {
                        throw new Error(invoicesResponse.message);
                    }

                    const invoices = invoicesResponse.data.invoices || [];
                    const duplicateInvoice = invoices.find(invoice => {
                        if (typeof invoice.period === 'object' && invoice.period) {
                            return invoice.period.month === month && invoice.period.year === year;
                        }
                        return false;
                    });

                    return {
                        success: true,
                        exists: !!duplicateInvoice,
                        message: duplicateInvoice ? `Đã tồn tại hóa đơn cho tháng ${month}/${year}` : ''
                    };
                } catch (fallbackError) {
                    console.error('Fallback check failed:', fallbackError);
                    // Nếu kiểm tra thủ công cũng thất bại, giả định không có trùng lặp
                    return {
                        success: true,
                        exists: false,
                        message: 'Không thể kiểm tra trùng lặp, giả định không có trùng lặp'
                    };
                }
            }

            // Nếu là lỗi khác, giả định không có trùng lặp nhưng ghi log cảnh báo
            console.warn('Không thể kiểm tra trùng lặp, giả định không có trùng lặp');
            return {
                success: true,
                exists: false,
                message: 'Không thể kiểm tra trùng lặp, giả định không có trùng lặp'
            };
        }
    } catch (error: any) {
        console.error('Error checking duplicate invoice:', error.message);
        // Trong trường hợp lỗi nghiêm trọng, vẫn giả định không có trùng lặp
        return {
            success: true,
            exists: false,
            message: 'Lỗi khi kiểm tra trùng lặp: ' + error.message
        };
    }
};

// Xóa hóa đơn
export const deleteInvoice = async (token: string, invoiceId: string) => {
    try {
        console.log('Deleting invoice:', invoiceId);

        const response = await api.delete<{ success: boolean; message: string }>(
            `/billing/invoices/${invoiceId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        console.log('Delete invoice API response:', JSON.stringify(response, null, 2));

        if ('isError' in response) {
            throw new Error(response.message || 'Có lỗi xảy ra khi xóa hóa đơn');
        }

        return {
            success: response.data.success,
            message: response.data.message || 'Đã xóa hóa đơn thành công'
        };
    } catch (error: any) {
        console.error('Error deleting invoice:', error.message);
        throw error;
    }
};

// Cập nhật thông tin hóa đơn (dueDate, note, items)
export const updateInvoice = async (
    token: string,
    invoiceId: string,
    updateData: any,
    updateType: 'basic' | 'items' | 'all' = 'all'
) => {
    try {
        console.log(`Updating invoice ${invoiceId} with type ${updateType}:`, updateData);

        // Trước khi cập nhật, lấy thông tin hóa đơn hiện tại để lưu thông tin quan trọng
        let currentInvoice;
        try {
            const currentInvoiceResponse = await getInvoiceDetails(token, invoiceId);
            if (currentInvoiceResponse.success) {
                currentInvoice = currentInvoiceResponse.data.invoice;
                console.log('Đã lấy thông tin hóa đơn hiện tại trước khi cập nhật');
            }
        } catch (err) {
            console.log('Không thể lấy thông tin hóa đơn hiện tại:', err);
        }

        // Endpoint depends on update type
        let endpoint = `/billing/invoices/${invoiceId}`;

        // For basic updates (dueDate, note) we use the base endpoint
        // For items updates we might need a different endpoint in the future

        const response = await api.put<{ success: boolean; message: string; invoice: Invoice }>(
            endpoint,
            updateData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            },
        );

        console.log('Update invoice API response:', JSON.stringify(response.data, null, 2));

        if ('isError' in response) {
            throw new Error(response.message || 'Có lỗi xảy ra khi cập nhật hóa đơn');
        }

        // IMPORTANT: Process the returned invoice to ensure object references are preserved
        // This helps maintain tenant and room information in proper format
        const processedInvoice = { ...response.data.invoice };

        // Nếu API trả về thiếu thông tin contractId, sử dụng dữ liệu từ hóa đơn hiện tại
        if (currentInvoice) {
            // Khôi phục contractId nếu bị mất
            if (!processedInvoice.contractId ||
                (typeof processedInvoice.contractId === 'object' && !processedInvoice.contractId.contractInfo) ||
                typeof processedInvoice.contractId === 'string') {

                console.log('Phát hiện mất dữ liệu contractId, khôi phục từ dữ liệu hiện tại');
                processedInvoice.contractId = currentInvoice.contractId;
            }

            // Khôi phục roomId nếu trả về dạng string thay vì object
            if (typeof processedInvoice.roomId === 'string' &&
                typeof currentInvoice.roomId === 'object') {
                console.log('Phát hiện roomId chuyển từ object sang string, khôi phục từ dữ liệu hiện tại');
                processedInvoice.roomId = currentInvoice.roomId;
            }

            // Khôi phục tenantId nếu trả về dạng string thay vì object
            if (typeof processedInvoice.tenantId === 'string' &&
                typeof currentInvoice.tenantId === 'object') {
                console.log('Phát hiện tenantId chuyển từ object sang string, khôi phục từ dữ liệu hiện tại');
                processedInvoice.tenantId = currentInvoice.tenantId;
            }
        }

        // Log the returned invoice structure to help debug issues
        console.log('Invoice structure after update:', {
            roomId: processedInvoice.roomId ? (typeof processedInvoice.roomId === 'object' ? 'object' : 'string') : 'undefined',
            tenantId: processedInvoice.tenantId ? (typeof processedInvoice.tenantId === 'object' ? 'object' : 'string') : 'undefined',
            contractId: processedInvoice.contractId ? (typeof processedInvoice.contractId === 'object' ? 'object' : 'string') : 'undefined',
            hasContractInfo: processedInvoice.contractId && typeof processedInvoice.contractId === 'object' ? !!processedInvoice.contractId.contractInfo : false
        });

        return {
            success: response.data.success,
            message: response.data.message || 'Đã cập nhật hóa đơn thành công',
            data: {
                invoice: processedInvoice
            }
        };
    } catch (error: any) {
        console.error('Error updating invoice:', error.message);
        throw error;
    }
};

// Thêm khoản mục tùy chỉnh vào hóa đơn
export const addCustomInvoiceItem = async (token: string, invoiceId: string, itemData: CustomInvoiceItem) => {
    try {
        console.log('Adding custom item to invoice:', invoiceId, itemData);

        const response = await api.post<{ success: boolean; message: string; item: any; invoice: Invoice }>(
            `/billing/invoices/${invoiceId}/add-item`,
            itemData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            },
        );

        console.log('Add custom item API response:', JSON.stringify(response.data, null, 2));

        if ('isError' in response) {
            throw new Error(response.message || 'Có lỗi xảy ra khi thêm khoản mục tùy chỉnh');
        }

        return {
            success: response.data.success,
            message: response.data.message || 'Đã thêm khoản mục tùy chỉnh thành công',
            data: {
                invoice: response.data.invoice,
                item: response.data.item
            }
        };
    } catch (error: any) {
        console.error('Error adding custom invoice item:', error.message);
        throw error;
    }
};

// Cập nhật các khoản mục cụ thể trong hóa đơn (điện, nước, khoản mục tùy chỉnh)
export const updateInvoiceItems = async (token: string, invoiceId: string, itemsData: any[]) => {
    try {
        console.log('Updating specific invoice items:', invoiceId, itemsData);

        const response = await api.put<{ success: boolean; message: string; invoice: Invoice }>(
            `/billing/invoices/${invoiceId}/update-items`,
            { items: itemsData },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            },
        );

        console.log('Update invoice items API response:', JSON.stringify(response.data, null, 2));

        if ('isError' in response) {
            throw new Error(response.message || 'Có lỗi xảy ra khi cập nhật khoản mục hóa đơn');
        }

        return {
            success: response.data.success,
            message: response.data.message || 'Đã cập nhật khoản mục hóa đơn thành công',
            data: {
                invoice: response.data.invoice
            }
        };
    } catch (error: any) {
        console.error('Error updating invoice items:', error.message);
        throw error;
    }
};

// Xóa một khoản mục trong hóa đơn
export const deleteInvoiceItem = async (token: string, invoiceId: string, itemId: string) => {
    try {
        console.log('Deleting invoice item:', { invoiceId, itemId });

        const response = await api.delete<{ success: boolean; message: string; invoice: Invoice }>(
            `/billing/invoices/${invoiceId}/items/${itemId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        console.log('Delete invoice item API response:', JSON.stringify(response.data, null, 2));

        if ('isError' in response) {
            throw new Error(response.message || 'Có lỗi xảy ra khi xóa khoản mục');
        }

        return {
            success: response.data.success,
            message: response.data.message || 'Đã xóa khoản mục thành công',
            data: {
                invoice: response.data.invoice
            }
        };
    } catch (error: any) {
        console.error('Error deleting invoice item:', error.message);
        throw error;
    }
};

// Lưu hóa đơn như một mẫu
export const saveInvoiceAsTemplate = async (token: string, invoiceId: string, templateName: string) => {
    try {
        console.log('Saving invoice as template:', { invoiceId, templateName });

        const response = await api.post<{ success: boolean; message: string; template: any }>(
            `/billing/invoices/${invoiceId}/save-as-template`,
            { templateName: templateName },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            },
        );

        console.log('Save as template API response:', JSON.stringify(response.data, null, 2));

        if ('isError' in response) {
            throw new Error(response.message || 'Có lỗi xảy ra khi lưu mẫu hóa đơn');
        }

        return {
            success: response.data.success,
            message: response.data.message || 'Đã lưu mẫu hóa đơn thành công',
            data: {
                template: response.data.template
            }
        };
    } catch (error: any) {
        console.error('Error saving invoice as template:', error.message);
        throw error;
    }
};

// Lấy danh sách mẫu hóa đơn
export const getInvoiceTemplates = async (token: string) => {
    try {
        console.log('Fetching invoice templates');

        const response = await api.get<{ success: boolean; templates: any[] }>(
            `/billing/templates`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        console.log('Get templates API response:', JSON.stringify(response.data, null, 2));

        if ('isError' in response) {
            throw new Error(response.message || 'Có lỗi xảy ra khi lấy danh sách mẫu hóa đơn');
        }

        return {
            success: response.data.success,
            data: {
                templates: response.data.templates || []
            }
        };
    } catch (error: any) {
        // Trả về danh sách rỗng để tránh crash
        return {
            success: false,
            data: {
                templates: []
            }
        };
    }
};

// Xóa mẫu hóa đơn
export const deleteInvoiceTemplate = async (token: string, templateId: string) => {
    try {
        const response = await api.delete<{ success: boolean; message: string }>(
            `/billing/templates/${templateId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        if ('isError' in response) {
            throw new Error(response.message || 'Có lỗi xảy ra khi xóa mẫu hóa đơn');
        }

        return {
            success: response.data.success,
            message: response.data.message || 'Đã xóa mẫu hóa đơn thành công'
        };
    } catch (error: any) {
        throw error;
    }
};

// Áp dụng mẫu hóa đơn
export const applyInvoiceTemplate = async (
    token: string,
    templateId: string,
    data: {
        contractId: string;
        month: number;
        year: number;
        dueDate: string;
        keepReadings: boolean;
    }
) => {
    try {
        const response = await api.post<{ success: boolean; message: string; invoice: any }>(
            `/billing/templates/${templateId}/apply`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            },
        );

        if ('isError' in response) {
            throw new Error(response.message || 'Có lỗi xảy ra khi áp dụng mẫu hóa đơn');
        }

        return {
            success: response.data.success,
            message: response.data.message || 'Đã áp dụng mẫu hóa đơn thành công',
            data: {
                invoice: response.data.invoice
            }
        };
    } catch (error: any) {
        throw error;
    }
}; 

// Kiểm tra xem người dùng có trong danh sách coTenants không
export const checkUserIsCoTenant = async (token: string) => {
    try {
        // Gọi API mới để lấy danh sách hóa đơn người ở cùng
        const response = await api.get('/billing/roommate/invoices', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if ('isError' in response) {
            throw new Error(response.message || 'Có lỗi xảy ra khi kiểm tra trạng thái người ở cùng');
        }

        // Lấy dữ liệu người dùng hiện tại từ profile endpoint
        const userResponse = await api.get('/user/profile', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if ('isError' in userResponse) {
            throw new Error(userResponse.message || 'Không thể lấy thông tin người dùng');
        }

        // Debug: Log the API response structure
        console.log('User profile API response structure:', {
            hasData: !!userResponse.data,
            dataStructure: userResponse.data ? Object.keys(userResponse.data) : [],
            hasUserData: !!userResponse.data?.data?.user,
            userData: userResponse.data?.data?.user ? {
                id: userResponse.data.data.user._id,
                username: userResponse.data.data.user.username,
            } : 'No user data'
        });

        // Dữ liệu người dùng nằm trong data.user theo cấu trúc mới
        const currentUserId = userResponse.data.data?.user?._id;
        
        // If can't get ID, try alternative paths
        let finalUserId = currentUserId;
        
        if (!finalUserId) {
            console.log('Cannot find user ID in the expected path, trying alternatives');
            
            // Try other possible paths for user ID
            finalUserId = userResponse.data?.user?._id || 
                         userResponse.data?.data?._id || 
                         userResponse.data?._id;
            
            if (finalUserId) {
                console.log('Found user ID in alternative path:', finalUserId);
            } else {
                throw new Error('Không thể xác định ID người dùng hiện tại');
            }
        }
        
        console.log(`Final user ID found: ${finalUserId}`);

        // Kiểm tra nếu người dùng có trong danh sách coTenants của bất kỳ hợp đồng nào
        const invoices = response.data.invoices || [];
        let isCoTenant = false;
        let coTenantContracts = [];

        console.log(`Checking ${invoices.length} invoices for coTenant status`);

        for (const invoice of invoices) {
            // Kiểm tra nếu invoice có contractId và contractId.contractInfo.coTenants
            if (invoice.contractId && 
                invoice.contractId.contractInfo && 
                invoice.contractId.contractInfo.coTenants && 
                Array.isArray(invoice.contractId.contractInfo.coTenants)) {
                
                // Log coTenants list to debug
                const coTenants = invoice.contractId.contractInfo.coTenants;
                console.log(`Found invoice with ${coTenants.length} coTenants:`, 
                    coTenants.map((ct: any) => ({ userId: ct.userId, name: ct.fullName || ct.username })));
                
                // Kiểm tra xem userId hiện tại có trong danh sách coTenants không
                const isUserCoTenant = invoice.contractId.contractInfo.coTenants.some(
                    (coTenant: { userId: string }) => coTenant.userId === finalUserId
                );
                
                if (isUserCoTenant) {
                    isCoTenant = true;
                    console.log(`User found as coTenant in contract: ${invoice.contractId._id}`);
                    // Thêm thông tin hợp đồng vào danh sách hợp đồng người dùng là người ở cùng
                    if (coTenantContracts.findIndex(c => c._id === invoice.contractId._id) === -1) {
                        coTenantContracts.push(invoice.contractId);
                    }
                }
            }
        }
        
        console.log(`User ${finalUserId} isCoTenant: ${isCoTenant}, found in ${coTenantContracts.length} contracts`);
        
        return {
            success: true,
            isCoTenant,
            contracts: coTenantContracts
        };
    } catch (error: any) {
        console.error('Error checking coTenant status:', error.message);
        
        // Nếu API endpoint chưa tồn tại, trả về một kết quả giả lập dựa trên dữ liệu hiện có
        // Đây là một giải pháp tạm thời cho đến khi API được triển khai
        try {
            // Thử gọi API lấy danh sách hợp đồng
            const contractsResponse = await api.get('/contract/my-contracts', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            if ('isError' in contractsResponse) {
                throw new Error(contractsResponse.message);
            }
            
            // Kiểm tra xem người dùng có trong danh sách coTenants của bất kỳ hợp đồng nào không
            const contracts = contractsResponse.data.data?.contracts || [];
            let isCoTenant = false;
            
            for (const contract of contracts) {
                if (contract.contractInfo && contract.contractInfo.coTenants && 
                    Array.isArray(contract.contractInfo.coTenants) && 
                    contract.contractInfo.coTenants.length > 0) {
                    isCoTenant = true;
                    break;
                }
            }
            
            return {
                success: true,
                isCoTenant,
                contracts
            };
        } catch (fallbackError: any) {
            console.error('Error in fallback coTenant check:', fallbackError.message);
            return {
                success: false,
                isCoTenant: false,
                contracts: []
            };
        }
    }
}; 