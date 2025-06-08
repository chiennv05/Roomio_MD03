export type Role = 'chuTro' | 'nguoiThue' | 'admin';
export type UserStatus = 'active' | 'locked';

export interface User {
  username: string;
  passwordHash: string;
  role: Role;
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  identityNumber: string;
  status: UserStatus;
  auth_token: string | null;
  invalidTokens: string[];
  stats: {
    totalRooms?: number;
    totalRevenue?: number;
    totalContracts?: number;
  };
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

export interface AuthState {
  loading: boolean;
  user: User | null;
  token: string | null;
  error: string | null;
}
