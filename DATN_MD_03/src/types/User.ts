export type Role = 'chuTro' | 'nguoiThue' | 'admin';
export type UserStatus = 'active' | 'locked';

// Lưu ý: FE sẽ giữ auth_token là string để tương thích code hiện tại
export interface User {
  _id?: string;
  username: string;
  passwordHash: string;
  role: Role;
  fullName: string;
  birthDate?: string | null;
  email: string;
  phone?: string;
  status: UserStatus;
  identityNumber?: string;
  address?: string;
  avatar?: string;
  auth_token?: string | null;
  invalidTokens?: string[];
  stats?: {
    totalRooms?: number;
    rentedRooms?: number;
    totalRevenue?: number;
    totalContracts?: number;
    lastActive?: string; // theo backend
    lastActivity?: string; // giữ tương thích cũ
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
