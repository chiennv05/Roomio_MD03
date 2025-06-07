export type RoomStatus = 'trong' | 'daThue' | 'an';
export type RoomApprovalStatus = 'choDuyet' | 'duyet' | 'tuChoi';

export interface Room {
  ownerId: string;
  approverId?: string;
  roomNumber: string;
  area: number;
  rentPrice: number;
  status: RoomStatus;
  approvalStatus: RoomApprovalStatus;
  description: string;
  photos: string[];
  location: {
    province: string;
    district: string;
    ward: string;
    street: string;
    houseNumber: string;
    coordinates?: {lat: number; lng: number};
  };
  amenities: string[];
  furniture: string[];
  stats: {
    views?: number;
    favorites?: number;
    contracts?: number;
  };
  priceHistory: {date: string; price: number}[];
  rejectionReason?: string;
}
