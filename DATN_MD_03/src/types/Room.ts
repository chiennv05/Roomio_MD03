export type RoomStatus = 'trong' | 'daThue' | 'an';
export type RoomApprovalStatus = 'choDuyet' | 'duyet' | 'tuChoi';

export interface Room {
  _id?: string;
  ownerId: string;
  approverId?: string;
  roomNumber: string;
  area: number;
  rentPrice: number;
  status?: RoomStatus;
  approvalStatus?: RoomApprovalStatus;
  description: string;
  photos: string[];
  location: {
    _id?: string;
    addressText?: string;
    province: string;
    district: string;
    ward: string;
    street: string;
    houseNo?: string;
    houseNumber?: string;
    coordinates?: {
      type?: string;
      coordinates?: number[];
      lat?: number; 
      lng?: number;
    };
    servicePrices?: {
      electricity?: number;
      water?: number;
      cleaning?: number;
      parking?: number;
      internet?: number;
      elevator?: number;
    };
  };
  amenities: string[];
  furniture: string[];
  stats?: {
    viewCount?: number;
    favoriteCount?: number;
    contractCount?: number;
    totalRevenue?: number;
    lastUpdated?: string;
    views?: number;
    favorites?: number;
    contracts?: number;
  };
  priceHistory?: {date: string; price: number}[];
  rejectionReason?: string;
  owner?: {
    _id: string;
    username: string;
    fullName: string;
    phone: string;
  };
  distance?: number | null;
  isFavorited?: boolean;
  canContact?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoomResponse {
  success: boolean;
  message: string;
  data: {
    rooms: Room[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    userLocation: any;
    appliedFilters: {
      amenities: string[];
      furniture: string[];
    };
  };
}

export interface RoomState {
  loading: boolean;
  rooms: Room[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;
  appliedFilters: {
    amenities: string[];
    furniture: string[];
  };
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
}

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

export interface Coordinates {
  type: string;
  coordinates: [number, number];
}

export interface ServicePrices {
  electricity: number;
  water: number;
  cleaning: number;
  parking: number;
  internet: number;
  elevator: number;
}

export interface Location {
  coordinates: Coordinates;
  servicePrices: ServicePrices;
  addressText: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  houseNo: string;
  _id: string;
}

export interface ApiRoom {
  _id: string;
  ownerId: Owner;
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

export interface RoomsApiResponse {
  success: boolean;
  message: string;
  data: {
    rooms: ApiRoom[];
    pagination: Pagination;
    userLocation: any;
    appliedFilters: AppliedFilters;
  };
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
}
