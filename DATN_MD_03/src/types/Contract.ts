export type ContractStatus =
  | 'draft'
  | 'pending_signature'
  | 'pending_approval'
  | 'active'
  | 'expired'
  | 'terminated'
  | 'rejected';

export interface Contract {
  roomId: string;
  tenantId: string;
  landlordId: string;
  contractInfo: {
    tenant: {
      fullName: string;
      phone: string;
      identityNumber: string;
      email: string;
      birthDate: string;
    };
    landlord: {
      fullName: string;
      phone: string;
      identityNumber: string;
      birthDate: string;
    };
    room: {
      roomNumber: string;
      address: string;
      area: number;
      rentPrice: number;
      deposit: number;
    };
    amenities: string[];
    furniture: string[];
    startDate: string;
    endDate: string;
    term: string;
    serviceCosts: {
      electricity: number;
      water: number;
      internet: number;
      cleaning: number;
    };
    regulations: string;
  };
  status: ContractStatus;
  contractPdfUrl?: string;
  signedContractImages?: string[];
  approval?: any;
  statusHistory?: {date: string; status: ContractStatus}[];
  sourceNotificationId?: string;
}
