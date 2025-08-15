import {User} from '../types';

export const mapApiUserToUser = (
  apiUser: any,
  tokenFromLogin?: string | null,
): User => ({
  _id: apiUser?._id,
  username: apiUser?.username ?? '',
  passwordHash: '',
  role: apiUser?.role ?? 'nguoiThue',
  fullName: apiUser?.fullName ?? '',
  email: apiUser?.email ?? '',
  phone: apiUser?.phone ?? '',
  birthDate: apiUser?.birthDate ?? '',
  identityNumber: apiUser?.identityNumber ?? '',
  address: apiUser?.address ?? '',
  avatar: apiUser?.avatar ?? '',
  status: apiUser?.status ?? 'active',
  // FE dùng string token, lấy từ object nếu có, fallback tokenFromLogin
  auth_token: apiUser?.auth_token?.token ?? tokenFromLogin ?? null,
  invalidTokens: apiUser?.invalidTokens ?? [],
  stats: {
    totalRooms: apiUser?.stats?.totalRooms ?? 0,
    rentedRooms: apiUser?.stats?.rentedRooms ?? 0,
    totalRevenue: apiUser?.stats?.totalRevenue ?? 0,
    totalContracts: apiUser?.stats?.totalContracts ?? 0,
    lastActive: apiUser?.stats?.lastActive ?? undefined,
    // fallback tương thích
    lastActivity: apiUser?.stats?.lastActivity ?? undefined,
  },
  createdAt: apiUser?.createdAt,
  updatedAt: apiUser?.updatedAt,
});
