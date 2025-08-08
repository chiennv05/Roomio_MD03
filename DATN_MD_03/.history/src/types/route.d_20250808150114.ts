export type RootStackParamList = {
  HomeScreen: undefined;
  Login: { redirectTo?: string; roomId?: string };
  DetailScreen: { id: number };
  DetailRoom: { roomId: string };
  SplashScreen: undefined;
  UITab: undefined;
  ForgotPassword: undefined;
  OTPVerification: { email: string };
  ResetPassWord: { email: string; resetToken: string };
  PersonalInformation: { redirectTo?: string; roomId?: string };
  Notification: undefined;
  TenantList: undefined;
  TenantDetail: { tenantId: string };
  LandlordRoom: undefined;
  Bill: undefined;
  BillDetails: { invoiceId: string };
  RoommateInvoiceDetails: { invoiceId: string };
  CreateInvoice: { contract?: any };
  EditInvoice: { invoiceId: string };
  InvoiceTemplates: undefined;
  ContractManagement: undefined;
  ContractDetail: { contractId: string };
  ContractTenants: { contractId: string };
  PdfViewer: { pdfUrl: string };
  PolicyTerms: undefined;
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
// <<<<<<< HEAD
//   DetailRoomLandlord: { id: string };
//   UpdateRoomScreen: { item: Room };
//   AddContract: { notificationId: string };
//   UpdateContract: { contract: Contract };
// =======
  DetailRoomLandlord: {id: string};
  UpdateRoomScreen: {item: Room};
  AddContract: {notificationId: string};
  UpdateContract: {contract: Contract};
  AddContractNoNotification: undefined;
// >>>>>>> origin/ton
};
