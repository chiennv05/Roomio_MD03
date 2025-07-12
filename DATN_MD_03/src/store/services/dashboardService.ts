import api from '../../api/api';

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      username: string;
      fullName: string;
    };
    overview: {
      totalRooms: number;
      pendingRooms: number;
      approvedRooms: number;
      rejectedRooms: number;
      rentedRooms: number;
      availableRooms: number;
      hiddenRooms: number;
      totalContracts: number;
      activeContracts: number;
      pendingContracts: number;
      expiredContracts: number;
      terminatedContracts: number;
    };
    revenue: {
      totalRevenue: number;
      averageRent: number;
      occupancyRate: string;
    };
    invoices: {
      totalInvoices: number;
      paidInvoices: number;
      issuedInvoices: number;
      overdueInvoices: number;
      draftInvoices: number;
      pendingConfirmationInvoices: number;
      recentInvoices: any[];
    };
    tenants: {
      totalTenants: number;
      activeTenants: number;
      inactiveTenants: number;
      averageStayDuration: number;
      longestStayingTenant: any;
      contractsByStatus: {
        active: number;
        expired: number;
        terminated: number;
        draft: number;
        pending_signature: number;
        pending_approval: number;
        rejected: number;
      };
      tenantCountStats: {
        averageTenantCount: number;
        maxTenantCount: number;
      };
    };
    topViewedRooms: Array<{
      stats: {
        viewCount: number;
        favoriteCount: number;
      };
      _id: string;
      roomNumber: string;
      rentPrice: number;
      photos: string[];
    }>;
    topFavoriteRooms: Array<{
      stats: {
        viewCount: number;
        favoriteCount: number;
      };
      _id: string;
      roomNumber: string;
      rentPrice: number;
      photos: string[];
    }>;
    recentContracts: Array<{
      contractInfo: {
        serviceFees: {
          electricity: number;
          water: number;
        };
        serviceFeeConfig: {
          electricity: string;
          water: string;
        };
        tenantName: string;
        tenantPhone: string;
        tenantIdentityNumber: string;
        tenantEmail: string;
        tenantBirthDate: string;
        tenantAddress: string;
        landlordName: string;
        landlordPhone: string;
        landlordIdentityNumber: string;
        landlordBirthDate: string;
        landlordAddress: string;
        roomNumber: string;
        roomAddress: string;
        roomArea: number;
        monthlyRent: number;
        deposit: number;
        maxOccupancy: number;
        furniture: string[];
        amenities: string[];
        startDate: string;
        endDate: string;
        contractTerm: number;
        customServices: Array<{
          name: string;
          price: number;
          priceType: string;
          description: string;
          _id: string;
        }>;
        tenantCount: number;
        coTenants: Array<{
          userId: string;
          username: string;
          phone: string;
          email: string;
          birthDate: string | null;
          identityNumber: string;
          address: string;
          _id: string;
        }>;
        rules: string;
        additionalTerms: string;
      };
      _id: string;
      roomId: {
        _id: string;
        roomNumber: string;
        photos: string[];
      };
      tenantId: {
        _id: string;
        username: string;
        fullName: string;
      };
      status: string;
      createdAt: string;
    }>;
    monthlyStats: {
      labels: string[];
      rooms: number[];
      contracts: number[];
      revenue: number[];
      invoices: number[];
      paidInvoices: number[];
      overdueInvoices: number[];
      occupancyRate: number[];
      activeTenants: number[];
      newTenants: number[];
    };
  };
}

export const fetchDashboardStats = async (token: string): Promise<DashboardResponse> => {
  try {
    const response = await api.get('/landlord/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};