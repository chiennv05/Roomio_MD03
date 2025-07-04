export type ServiceTypeType = 'fixed' | 'variable' | 'one_off';

export interface ServiceType {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  type: ServiceTypeType;
  isActive: boolean;
  landlordId: string;
  createdAt?: string;
  updatedAt?: string;
} 