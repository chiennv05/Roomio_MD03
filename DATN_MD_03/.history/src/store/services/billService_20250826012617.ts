import {api} from '../../api/api';
import {Invoice} from '../../types/Bill';
import {Contract} from '../../types/Contract';

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
    };
  };
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
  // Dev log removed

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
          hasPrevPage: page > 1,
        },
      },
    };
  } catch (error: any) {
    // Kiểm tra nếu là lỗi do abort
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
  // Request aborted
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
          hasPrevPage: false,
        },
      },
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
  // Dev log removed

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
    const invoicesWithRoommate =
      response.data.invoices?.map(invoice => ({
        ...invoice,
        isRoommate: true, // Luôn đảm bảo thuộc tính này được đặt
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
          hasPrevPage: page > 1,
        },
      },
    };
  } catch (error: any) {
    // Kiểm tra nếu là lỗi do abort
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
  // Request aborted
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
          hasPrevPage: false,
        },
      },
    };
  }
};

// Lấy chi tiết hóa đơn
export const getInvoiceDetails = async (token: string, invoiceId: string) => {
  try {

    const response = await api.get<{
      success: boolean;
      invoice: Invoice;
      items: any[];
    }>(`/billing/invoices/${invoiceId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if ('isError' in response) {
      throw new Error(response.message);
    }

    // Process the invoice data to ensure consistent format
    const processedInvoice = {...response.data.invoice};

    // Thêm items vào invoice nếu có
    if (response.data.items && Array.isArray(response.data.items)) {
      processedInvoice.items = response.data.items;
    }

    // Nếu contractId là object nhưng không có contractInfo, thử lấy lại từ API
    if (
      processedInvoice.contractId &&
      typeof processedInvoice.contractId === 'object' &&
      !processedInvoice.contractId.contractInfo
    ) {
      // Lưu ID của hợp đồng để có thể tham chiếu sau này
      const contractId =
        typeof processedInvoice.contractId === 'object'
          ? processedInvoice.contractId._id
          : processedInvoice.contractId;

      // Lưu lại thông tin roomId và tenantId để sử dụng cho việc hiển thị
      // ngay cả khi không thể lấy được thông tin hợp đồng đầy đủ
      if (typeof processedInvoice.roomId === 'string' && contractId) {
  // roomId string fallback note
      }

      if (typeof processedInvoice.tenantId === 'string' && contractId) {
  // tenantId string fallback note
      }
    }

    return {
      success: response.data.success,
      data: {
        invoice: processedInvoice,
      },
    };
  } catch (error: any) {
    console.error('Error fetching invoice details:', error.message);
    throw error;
  }
};

// Lấy chi tiết hóa đơn người ở cùng
export const getRoommateInvoiceDetails = async (
  token: string,
  invoiceId: string,
) => {
  try {
    const response = await api.get<{
      success: boolean;
      invoice: Invoice;
      items: any[];
    }>(`/billing/roommate/invoices/${invoiceId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  /* Debug removed: roommate invoice details structure
      success: response.data.success,
      hasInvoice: !!response.data.invoice,
      hasItems: Array.isArray(response.data.items),
      invoiceStructure: response.data.invoice
        ? {
            hasRoomId: !!response.data.invoice.roomId,
            roomIdType: response.data.invoice.roomId
              ? typeof response.data.invoice.roomId
              : 'undefined',
            hasTenantId: !!response.data.invoice.tenantId,
            tenantIdType: response.data.invoice.tenantId
              ? typeof response.data.invoice.tenantId
              : 'undefined',
            hasContractId: !!response.data.invoice.contractId,
            contractIdType: response.data.invoice.contractId
              ? typeof response.data.invoice.contractId
              : 'undefined',
          }
        : 'No invoice data',
  }); */

    if ('isError' in response) {
      throw new Error(response.message);
    }

    // Process the invoice data to ensure consistent format
    const processedInvoice = {
      ...response.data.invoice,
      isRoommate: true, // Đánh dấu đây là hóa đơn của người ở cùng
    };

    // Thêm items vào invoice nếu có
    if (response.data.items && Array.isArray(response.data.items)) {
      processedInvoice.items = response.data.items;
    }

    // Nếu contractId là object nhưng không có contractInfo, thử lấy lại từ API
    if (
      processedInvoice.contractId &&
      typeof processedInvoice.contractId === 'object' &&
      !processedInvoice.contractId.contractInfo
    ) {
  // Missing contractInfo; attempt enrichment (log removed)

      // Lưu ID của hợp đồng để có thể tham chiếu sau này
      const contractId =
        typeof processedInvoice.contractId === 'object'
          ? processedInvoice.contractId._id
          : processedInvoice.contractId;

      // Lưu lại thông tin roomId và tenantId để sử dụng cho việc hiển thị
      // ngay cả khi không thể lấy được thông tin hợp đồng đầy đủ
      if (typeof processedInvoice.roomId === 'string' && contractId) {
        // roomId string fallback
      }

      if (typeof processedInvoice.tenantId === 'string' && contractId) {
        // tenantId string fallback
      }
    }

    return {
      success: response.data.success,
      data: {
        invoice: processedInvoice,
      },
    };
  } catch (error: any) {
    console.error('Error fetching roommate invoice details:', error.message);
    throw error;
  }
};

// Xác nhận thanh toán hóa đơn bằng tiền mặt (đánh dấu đã thanh toán)
export const confirmInvoicePayment = async (
  token: string,
  invoiceId: string,
) => {
  try {
  // Removed debug: confirming payment

    const response = await api.post<{
      success: boolean;
      message: string;
      invoice: Invoice;
    }>(
      `/billing/invoices/${invoiceId}/confirm-payment`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if ('isError' in response) {
      throw new Error(
        response.message || 'Có lỗi xảy ra khi xác nhận thanh toán',
      );
    }

    // Check if the invoice data is present in the response
    if (!response.data.invoice) {
      console.error('No invoice data in confirm payment response');
      throw new Error('Không nhận được dữ liệu hóa đơn từ server');
    }

    return {
      success: response.data.success,
      message: response.data.message || 'Đã xác nhận thanh toán thành công',
      invoice: response.data.invoice,
    };
  } catch (error: any) {
    console.error('Error confirming payment:', error.message);
    throw error;
  }
};

// Người thuê thanh toán hóa đơn với phương thức thanh toán
export const markInvoiceAsPaid = async (
  token: string,
  invoiceId: string,
  paymentMethod: string,
) => {
  try {
    const response = await api.post<{
      success: boolean;
      message: string;
      invoice: Invoice;
    }>(
      `/billing/tenant/invoices/${invoiceId}/mark-as-paid`,
      {paymentMethod},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    if ('isError' in response) {
      throw new Error(
        response.message || 'Có lỗi xảy ra khi thanh toán hóa đơn',
      );
    }

    return {
      success: response.data.success,
      message: response.data.message || 'Đã thanh toán hóa đơn thành công',
      invoice: response.data.invoice,
    };
  } catch (error: any) {
    console.error('Error marking invoice as paid:', error.message);
    throw error;
  }
};

// Hoàn thành hóa đơn (xác nhận thanh toán)
export const confirmInvoiceCompletion = async (
  token: string,
  invoiceId: string,
) => {
  try {
    const response = await api.post<{
      success: boolean;
      message: string;
      invoice: Invoice;
    }>(
      `/billing/invoices/${invoiceId}/finalize`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

  // Removed finalize response debug

    if ('isError' in response) {
      throw new Error(response.message);
    }

    return {
      success: response.data.success,
      message: response.data.message || 'Đã phát hành hóa đơn thành công',
      data: {
        invoice: response.data.invoice,
      },
    };
  } catch (error: any) {
    console.error('Error finalizing invoice:', error.message);
    throw error;
  }
};

// Lấy danh sách hợp đồng của tôi
export const getMyContracts = async (
  token: string,
  page: number = 1,
  limit: number = 10,
) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    const response = await api.get<ContractsResponse>(
      `/contract/my-contracts?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

  // Removed contracts response debug

    if ('isError' in response) {
      throw new Error(response.message);
    }

    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data,
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
          hasPrevPage: false,
        },
      },
    };
  }
};

// Tạo hóa đơn mới
export const createInvoice = async (
  token: string,
  data: CreateInvoiceRequest,
) => {
  try {
  // Removed create invoice debug

    const response = await api.post<{
      success: boolean;
      message: string;
      invoice: Invoice;
    }>('/billing/invoices/create', data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

  // Removed create invoice response debug

    if ('isError' in response) {
      // Kiểm tra nếu lỗi là do trùng lặp
      if (
        response.message &&
        (response.message.toLowerCase().includes('đã tồn tại') ||
          response.message.toLowerCase().includes('duplicate') ||
          response.message.toLowerCase().includes('already exists'))
      ) {
        return {
          success: false,
          message: `Hóa đơn cho tháng ${data.month}/${data.year} đã tồn tại`,
          data: {invoice: null},
        };
      }

      // Tạo lỗi với status code
      const error: any = new Error(response.message);
      error.status = response.status || 500;
      throw error;
    }

    // Đảm bảo rằng response.data.invoice có _id
    if (
      response.data.success &&
      response.data.invoice &&
      !response.data.invoice._id
    ) {
      console.warn('Invoice created but no _id returned from API');
    }

    return {
      success: response.data.success,
      message: response.data.message || 'Đã tạo hóa đơn thành công',
      data: {
        invoice: response.data.invoice,
      },
    };
  } catch (error: any) {
    console.error('Error creating invoice:', error);

    // Kiểm tra nếu lỗi từ API là do trùng lặp
    if (
      error.message &&
      (error.message.toLowerCase().includes('đã tồn tại') ||
        error.message.toLowerCase().includes('duplicate') ||
        error.message.toLowerCase().includes('already exists'))
    ) {
      return {
        success: false,
        message: `Hóa đơn cho tháng ${data.month}/${data.year} đã tồn tại`,
        data: {invoice: null},
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
export const checkDuplicateInvoice = async (
  token: string,
  contractId: string,
  month: number,
  year: number,
) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('contractId', contractId);
    queryParams.append('month', month.toString());
    queryParams.append('year', year.toString());

  // Removed duplicate invoice check debug

    // Kiểm tra xem API endpoint có tồn tại không
    try {
      const response = await api.get<{
        success: boolean;
        exists: boolean;
        message: string;
      }>(`/billing/invoices/check-duplicate?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

  // Removed duplicate API response debug

      if ('isError' in response) {
        throw new Error(response.message);
      }

      return {
        success: response.data.success,
        exists: response.data.exists || false,
        message: response.data.message || '',
      };
    } catch (apiError: any) {
      console.error('API Error checking duplicate invoice:', apiError);

      // Nếu API trả về 404 (Not Found), nghĩa là endpoint không tồn tại
      if (apiError.status === 404) {
  // Endpoint 404; fallback manual check

        // Thực hiện kiểm tra thủ công bằng cách lấy danh sách hóa đơn của hợp đồng
        // và kiểm tra xem có hóa đơn nào trùng tháng/năm không
        try {
          const invoicesResponse = await api.get<{
            success: boolean;
            invoices: Invoice[];
          }>(`/billing/invoices?contractId=${contractId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if ('isError' in invoicesResponse) {
            throw new Error(invoicesResponse.message);
          }

          const invoices = invoicesResponse.data.invoices || [];
          const duplicateInvoice = invoices.find(invoice => {
            if (typeof invoice.period === 'object' && invoice.period) {
              return (
                invoice.period.month === month && invoice.period.year === year
              );
            }
            return false;
          });

          return {
            success: true,
            exists: !!duplicateInvoice,
            message: duplicateInvoice
              ? `Đã tồn tại hóa đơn cho tháng ${month}/${year}`
              : '',
          };
        } catch (fallbackError) {
          console.error('Fallback check failed:', fallbackError);
          // Nếu kiểm tra thủ công cũng thất bại, giả định không có trùng lặp
          return {
            success: true,
            exists: false,
            message:
              'Không thể kiểm tra trùng lặp, giả định không có trùng lặp',
          };
        }
      }

      // Nếu là lỗi khác, giả định không có trùng lặp nhưng ghi log cảnh báo
      console.warn('Không thể kiểm tra trùng lặp, giả định không có trùng lặp');
      return {
        success: true,
        exists: false,
        message: 'Không thể kiểm tra trùng lặp, giả định không có trùng lặp',
      };
    }
  } catch (error: any) {
    console.error('Error checking duplicate invoice:', error.message);
    // Trong trường hợp lỗi nghiêm trọng, vẫn giả định không có trùng lặp
    return {
      success: true,
      exists: false,
      message: 'Lỗi khi kiểm tra trùng lặp: ' + error.message,
    };
  }
};

// Xóa hóa đơn
export const deleteInvoice = async (token: string, invoiceId: string) => {
  try {
  // Removed deleting invoice debug

    const response = await api.delete<{success: boolean; message: string}>(
      `/billing/invoices/${invoiceId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

  // Removed delete invoice response debug

    if ('isError' in response) {
      throw new Error(response.message || 'Có lỗi xảy ra khi xóa hóa đơn');
    }

    return {
      success: response.data.success,
      message: response.data.message || 'Đã xóa hóa đơn thành công',
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
  updateType: 'basic' | 'items' | 'all' = 'all',
) => {
  try {
  // Removed updating invoice debug

    // Trước khi cập nhật, lấy thông tin hóa đơn hiện tại để lưu thông tin quan trọng
    let currentInvoice;
    try {
      const currentInvoiceResponse = await getInvoiceDetails(token, invoiceId);
      if (currentInvoiceResponse.success) {
        currentInvoice = currentInvoiceResponse.data.invoice;
  // Retrieved current invoice
      }
    } catch (err) {
  // Could not fetch current invoice
    }

    // Endpoint depends on update type
    let endpoint = `/billing/invoices/${invoiceId}`;

    // For basic updates (dueDate, note) we use the base endpoint
    // For items updates we might need a different endpoint in the future

    const response = await api.put<{
      success: boolean;
      message: string;
      invoice: Invoice;
    }>(endpoint, updateData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

  // Removed update invoice response debug

    if ('isError' in response) {
      throw new Error(response.message || 'Có lỗi xảy ra khi cập nhật hóa đơn');
    }

    // IMPORTANT: Process the returned invoice to ensure object references are preserved
    // This helps maintain tenant and room information in proper format
    const processedInvoice = {...response.data.invoice};

    // Nếu API trả về thiếu thông tin contractId, sử dụng dữ liệu từ hóa đơn hiện tại
    if (currentInvoice) {
      // Khôi phục contractId nếu bị mất
      if (
        !processedInvoice.contractId ||
        (typeof processedInvoice.contractId === 'object' &&
          !processedInvoice.contractId.contractInfo) ||
        typeof processedInvoice.contractId === 'string'
      ) {
  // Restoring contractId from current invoice
        processedInvoice.contractId = currentInvoice.contractId;
      }

      // Khôi phục roomId nếu trả về dạng string thay vì object
      if (
        typeof processedInvoice.roomId === 'string' &&
        typeof currentInvoice.roomId === 'object'
      ) {
  // Restoring roomId object
        processedInvoice.roomId = currentInvoice.roomId;
      }

      // Khôi phục tenantId nếu trả về dạng string thay vì object
      if (
        typeof processedInvoice.tenantId === 'string' &&
        typeof currentInvoice.tenantId === 'object'
      ) {
  // Restoring tenantId object
        processedInvoice.tenantId = currentInvoice.tenantId;
      }
    }

    // Log the returned invoice structure to help debug issues
  /* Removed invoice structure debug
      roomId: processedInvoice.roomId
        ? typeof processedInvoice.roomId === 'object'
          ? 'object'
          : 'string'
        : 'undefined',
      tenantId: processedInvoice.tenantId
        ? typeof processedInvoice.tenantId === 'object'
          ? 'object'
          : 'string'
        : 'undefined',
      contractId: processedInvoice.contractId
        ? typeof processedInvoice.contractId === 'object'
          ? 'object'
          : 'string'
        : 'undefined',
      hasContractInfo:
        processedInvoice.contractId &&
        typeof processedInvoice.contractId === 'object'
          ? !!processedInvoice.contractId.contractInfo
          : false,
  }); */

    return {
      success: response.data.success,
      message: response.data.message || 'Đã cập nhật hóa đơn thành công',
      data: {
        invoice: processedInvoice,
      },
    };
  } catch (error: any) {
    console.error('Error updating invoice:', error.message);
    throw error;
  }
};

// Thêm khoản mục tùy chỉnh vào hóa đơn
export const addCustomInvoiceItem = async (
  token: string,
  invoiceId: string,
  itemData: CustomInvoiceItem,
) => {
  try {
  // Removed add custom item debug

    const response = await api.post<{
      success: boolean;
      message: string;
      item: any;
      invoice: Invoice;
    }>(`/billing/invoices/${invoiceId}/add-item`, itemData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

  // Removed add custom item response debug

    if ('isError' in response) {
      throw new Error(
        response.message || 'Có lỗi xảy ra khi thêm khoản mục tùy chỉnh',
      );
    }

    return {
      success: response.data.success,
      message:
        response.data.message || 'Đã thêm khoản mục tùy chỉnh thành công',
      data: {
        invoice: response.data.invoice,
        item: response.data.item,
      },
    };
  } catch (error: any) {
    console.error('Error adding custom invoice item:', error.message);
    throw error;
  }
};

// Cập nhật các khoản mục cụ thể trong hóa đơn (điện, nước, khoản mục tùy chỉnh)
export const updateInvoiceItems = async (
  token: string,
  invoiceId: string,
  itemsData: any[],
) => {
  try {
  // Removed updating specific items debug

    const response = await api.put<{
      success: boolean;
      message: string;
      invoice: Invoice;
    }>(
      `/billing/invoices/${invoiceId}/update-items`,
      {items: itemsData},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

  // Removed update items response debug

    if ('isError' in response) {
      throw new Error(
        response.message || 'Có lỗi xảy ra khi cập nhật khoản mục hóa đơn',
      );
    }

    return {
      success: response.data.success,
      message:
        response.data.message || 'Đã cập nhật khoản mục hóa đơn thành công',
      data: {
        invoice: response.data.invoice,
      },
    };
  } catch (error: any) {
    console.error('Error updating invoice items:', error.message);
    throw error;
  }
};

// Xóa một khoản mục trong hóa đơn
export const deleteInvoiceItem = async (
  token: string,
  invoiceId: string,
  itemId: string,
) => {
  try {
  // Removed deleting invoice item debug

    const response = await api.delete<{
      success: boolean;
      message: string;
      invoice: Invoice;
    }>(`/billing/invoices/${invoiceId}/items/${itemId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  // Removed delete invoice item response debug

    if ('isError' in response) {
      throw new Error(response.message || 'Có lỗi xảy ra khi xóa khoản mục');
    }

    return {
      success: response.data.success,
      message: response.data.message || 'Đã xóa khoản mục thành công',
      data: {
        invoice: response.data.invoice,
      },
    };
  } catch (error: any) {
    console.error('Error deleting invoice item:', error.message);
    throw error;
  }
};

// Lưu hóa đơn như một mẫu
export const saveInvoiceAsTemplate = async (
  token: string,
  invoiceId: string,
  templateName: string,
) => {
  try {
  // Removed save as template debug

    const response = await api.post<{
      success: boolean;
      message: string;
      template: any;
    }>(
      `/billing/invoices/${invoiceId}/save-as-template`,
      {templateName: templateName},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

  // Removed save as template response debug

    if ('isError' in response) {
      throw new Error(response.message || 'Có lỗi xảy ra khi lưu mẫu hóa đơn');
    }

    return {
      success: response.data.success,
      message: response.data.message || 'Đã lưu mẫu hóa đơn thành công',
      data: {
        template: response.data.template,
      },
    };
  } catch (error: any) {
    console.error('Error saving invoice as template:', error.message);
    throw error;
  }
};

// Lấy danh sách mẫu hóa đơn
export const getInvoiceTemplates = async (token: string) => {
  try {
  // Removed fetching templates debug

    const response = await api.get<{success: boolean; templates: any[]}>(
      '/billing/templates',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

  // Removed get templates response debug

    if ('isError' in response) {
      throw new Error(
        response.message || 'Có lỗi xảy ra khi lấy danh sách mẫu hóa đơn',
      );
    }

    return {
      success: response.data.success,
      data: {
        templates: response.data.templates || [],
      },
    };
  } catch (error: any) {
    // Trả về danh sách rỗng để tránh crash
    return {
      success: false,
      data: {
        templates: [],
      },
    };
  }
};

// Xóa mẫu hóa đơn
export const deleteInvoiceTemplate = async (
  token: string,
  templateId: string,
) => {
  try {
    const response = await api.delete<{success: boolean; message: string}>(
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
      message: response.data.message || 'Đã xóa mẫu hóa đơn thành công',
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
  },
) => {
  try {
    const response = await api.post<{
      success: boolean;
      message: string;
      invoice: any;
    }>(`/billing/templates/${templateId}/apply`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if ('isError' in response) {
      throw new Error(
        response.message || 'Có lỗi xảy ra khi áp dụng mẫu hóa đơn',
      );
    }

    return {
      success: response.data.success,
      message: response.data.message || 'Đã áp dụng mẫu hóa đơn thành công',
      data: {
        invoice: response.data.invoice,
      },
    };
  } catch (error: any) {
    throw error;
  }
};

// Kiểm tra xem người dùng có trong danh sách coTenants không
// ĐÃ LOẠI BỎ: Hàm kiểm tra người ở cùng (checkUserIsCoTenant) theo yêu cầu

// Lấy hóa đơn kỳ trước để tự động điền chỉ số đồng hồ
export const getPreviousInvoice = async (
  token: string,
  contractId: string,
  currentPeriod: { month: number; year: number }
) => {
  try {
    // Tính toán kỳ trước
    let previousMonth = currentPeriod.month - 1;
    let previousYear = currentPeriod.year;
    
    if (previousMonth === 0) {
      previousMonth = 12;
      previousYear = previousYear - 1;
    }

    // Tạo query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('contractId', contractId);
    queryParams.append('month', previousMonth.toString());
    queryParams.append('year', previousYear.toString());
    queryParams.append('status', 'paid'); // Chỉ lấy hóa đơn đã thanh toán
    queryParams.append('limit', '1'); // Chỉ cần 1 hóa đơn gần nhất

    if (__DEV__) {
      console.log('API Request to get previous invoice:', `/billing/invoices?${queryParams.toString()}`);
    }

    const response = await api.get<InvoicesResponse>(
      `/billing/invoices?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if ('isError' in response) {
      throw new Error(response.message);
    }

    const invoices = response.data.invoices || [];
    
    if (invoices.length === 0) {
      return {
        success: true,
        data: null,
        message: 'Không tìm thấy hóa đơn kỳ trước'
      };
    }

    // Lấy hóa đơn gần nhất
    const previousInvoice = invoices[0];

    // Trích xuất chỉ số đồng hồ từ các khoản mục utility
    const meterReadings: { [itemName: string]: { previousReading: number; currentReading: number } } = {};
    
    if (previousInvoice.items && previousInvoice.items.length > 0) {
      previousInvoice.items.forEach(item => {
        if (item.category === 'utility' && item.name) {
          meterReadings[item.name] = {
            previousReading: item.previousReading || 0,
            currentReading: item.currentReading || 0
          };
        }
      });
    }

    return {
      success: true,
      data: {
        invoice: previousInvoice,
        meterReadings,
        period: { month: previousMonth, year: previousYear }
      },
      message: `Đã tìm thấy hóa đơn kỳ ${previousMonth}/${previousYear}`
    };

  } catch (error: any) {
    console.error('Error getting previous invoice:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Có lỗi xảy ra khi lấy hóa đơn kỳ trước'
    };
  }
};
