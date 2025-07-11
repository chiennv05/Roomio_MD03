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
  LandlordRoom: undefined;
  Bill: undefined;
  BillDetails: { invoiceId: string };
  RoommateInvoiceDetails: { invoiceId: string }; // Thêm route mới cho chi tiết hóa đơn người ở cùng
  CreateInvoice: { contract?: any };
  EditInvoice: { invoiceId: string };
  InvoiceTemplates: undefined;
};
