// ========== Enums ==========
export type RoomStatus = 'trong' | 'daThue' | 'an';
export type RoomApprovalStatus = 'choDuyet' | 'duyet' | 'tuChoi';

// ========== Basic Types ==========
export interface Coordinates {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface ServicePrices {
  electricity?: number;
  water?: number;
  cleaning?: number;
  parking?: number;
  internet?: number;
  elevator?: number;
}

export interface ServicePriceConfig {
  electricity?: string;
  water?: string;
}

export interface CustomService {
  name: string;
  price: number;
  type: string;
  description?: string;
}

// ========== Location ==========
export interface Location {
  _id?: string;
  addressText?: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  houseNo?: string;
  houseNumber?: string;
  coordinates?: Coordinates;
  servicePrices?: ServicePrices;
  servicePriceConfig?: ServicePriceConfig;
  customServices?: CustomService[];
}

// ========== Owner & Stats ==========
export interface Owner {
  _id: string;
  username: string;
  fullName: string;
  phone: string;
}

export interface Stats {
  viewCount: number;
  favoriteCount: number;
  contractCount: number;
  totalRevenue: number;
  lastUpdated: string;
}

// ========== Price History ==========
export interface PriceHistory {
  date: string;
  price: number;
}

// ========== Main Room Model ==========
export interface Room {
  _id?: string;
  ownerId: string;
  approverId?: string;
  roomNumber: string;
  area: number;
  rentPrice: number;
  maxOccupancy: number;
  status?: RoomStatus;
  approvalStatus?: RoomApprovalStatus;
  description: string;
  photos: string[];
  location: Location;
  amenities: string[];
  furniture: string[];
  stats?: Stats;
  priceHistory?: PriceHistory[];
  rejectionReason?: string;
  owner?: Owner;
  distance?: number | null;
  isFavorited?: boolean;
  canContact?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ========== API Room (Used for API List Responses) ==========
export interface ApiRoom {
  _id: string;
  ownerId: string;
  roomNumber: string;
  area: number;
  rentPrice: number;
  description: string;
  photos: string[];
  location: Location;
  amenities: string[];
  furniture: string[];
  createdAt: string;
  updatedAt: string;
  owner: Owner;
  distance: number | null;
  stats: Stats;
}

// ========== Filters & Pagination ==========
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AppliedFilters {
  amenities: string[];
  furniture: string[];
}

export interface RoomFilters {
  maxDistance?: number;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  amenities?: string[];
  furniture?: string[];
  districts?: string[];
  search?: string;
  approvalStatus?: RoomApprovalStatus;
  status?: RoomStatus;
}

// ========== API Response (Generic) ==========
export interface RoomsApiData<T = Room> {
  rooms: T[];
  pagination: Pagination;
  userLocation: any;
  appliedFilters: AppliedFilters;
}

export interface RoomsApiResponse<T = Room> {
  success: boolean;
  message: string;
  data: RoomsApiData<T>;
}

// ========== Room Redux State ==========
export interface RoomState {
  loading: boolean;
  rooms: Room[];
  pagination: Pagination | null;
  appliedFilters: AppliedFilters;
  error: string | null;

  roomDetail: Room | null;
  roomDetailLoading: boolean;
  roomDetailError: string | null;

  relatedRooms: Room[];
  relatedRoomsLoading: boolean;
  relatedRoomsError: string | null;

  favoriteRooms: Room[];
  favoriteLoading: boolean;
  favoriteError: string | null;
  toggleFavoriteLoading: boolean;

  searchResults: Room[];
  searchLoading: boolean;
  searchError: string | null;
  searchPagination: Pagination | null;
}
