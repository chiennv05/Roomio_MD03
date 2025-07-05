export type Role = 'chuTro' | 'nguoiThue' | 'admin';
export type UserStatus = 'active' | 'locked';

export interface User {
  _id?: string;
  username: string;
  passwordHash: string;
  role: Role;
  fullName: string;
  birthDate: string;
  email: string;
  phone: string;
  status: UserStatus;
  identityNumber: string;
  address: string;
  auth_token: string | null;
  invalidTokens: string[];
  stats: {
    totalRooms?: number;
    rentedRooms?: number;
    totalRevenue?: number;
    totalContracts?: number;
    lastActivity?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  loading: boolean;
  user: User | null;
  error: string | null;
  token: string | null;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  role: string;
  fullName: string;
  phone: string;
  identityNumber: string;
  address: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresAt: string;
}
