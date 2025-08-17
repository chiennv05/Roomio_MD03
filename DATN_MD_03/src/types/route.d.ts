export type RootStackParamList = {
  HomeScreen: undefined;
  Login: {redirectTo?: string; roomId?: string};
  DetailScreen: {id: number};
  DetailRoom: {roomId: string};
  SplashScreen: undefined;
  UITab: undefined;
  ForgotPassword: undefined;
  OTPVerification: {email: string};
  ResetPassWord: {email: string; resetToken: string};
  PersonalInformation: {redirectTo?: string; roomId?: string};
  Notification: undefined;
  NotificationPermission: undefined;
  TenantList: undefined;
  TenantDetail: {tenantId: string};
  LandlordRoom: undefined;
  ContractManagement: undefined;
  ContractDetail: {contractId: string};
  ContractTenants: {contractId: string};
  PdfViewer: {pdfUrl: string};
  PolicyTerms: undefined;
  SupportScreen: undefined;
  AddNewSupport: undefined;
  SupportDetail: {supportId: string};
  UpdateSupport: {supportId: string};
  MapScreen: {
    latitude?: number;
    longitude?: number;
    address?: string;
    roomDetail?: Room;
    isSelectMode?: boolean;
    onSelectLocation?: (location: {
      latitude: number;
      longitude: number;
      address: string;
    }) => void;
  };
  AddRooom: {
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
  };
  DetailRoomLandlord: {id: string};
  UpdateRoomScreen: {item: Room};
  AddContract: {notificationId: string};
  UpdateContract: {contract: Contract};
  StatisticScreen: undefined;
  RoomStatisticScreen: undefined;
  RevenueStatisticScreen: undefined;
  ContractStatisticScreen: undefined;
  OTPVerification: {email: string};
  ResetPassWord: {email: string; resetToken: string};
  PersonalInformation: {redirectTo?: string; roomId?: string};
  LandlordRoom: undefined;
  Bill: undefined;
  BillDetails: {invoiceId: string};
  RoommateInvoiceDetails: {invoiceId: string}; // Thêm route mới cho chi tiết hóa đơn người ở cùng
  CreateInvoice: {contract?: any};
  EditInvoice: {invoiceId: string};
  InvoiceTemplates: undefined;
  AddContractNoNotification: undefined;
  ContractLessee: undefined;
  ContractDetailLessee: {contractId: string};
  UpdateTenant: undefined;
  CCCDResult: {
    rawData?: string;
    imageUri?: string;
    redirectTo?: string;
    roomId?: string;
  };
  CCCDScanning: {redirectTo?: string; roomId?: string};
  SubscriptionScreen: undefined;
  SubscriptionPayment: undefined;
};
