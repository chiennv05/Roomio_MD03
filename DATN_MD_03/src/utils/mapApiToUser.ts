import {User} from '../types';

export const mapApiUserToUser = (
  apiUser: any,
  tokenFromLogin?: string | null,
): User => ({
  username: apiUser?.username ?? '',
  passwordHash: '',
  role: apiUser?.role ?? 'nguoiThue',
  fullName: apiUser?.fullName ?? '',
  email: apiUser?.email ?? '',
  phone: apiUser?.phone ?? '',
  birthDate: apiUser?.birthDate ?? '',
  identityNumber: apiUser?.identityNumber ?? '',
  status: apiUser?.status ?? 'active',
  auth_token: apiUser?.auth_token?.token ?? tokenFromLogin ?? null,
  invalidTokens: apiUser?.invalidTokens ?? [],
  stats: {
    totalRooms: apiUser?.stats?.totalRooms ?? 0,
    totalRevenue: apiUser?.stats?.totalRevenue ?? 0,
    totalContracts: apiUser?.stats?.totalContracts ?? 0,
  },
});
