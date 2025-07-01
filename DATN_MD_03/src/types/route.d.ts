export type RootStackParamList = {
  HomeScreen: undefined;
  Login: undefined;
  DetailScreen: {id: number};
  DetailRoom: {roomId: string};
  SplashScreen: undefined;
  UITab: undefined;
  ForgotPassword: undefined;
  OTPVerification: {email: string};
  ResetPassWord: {email: string; resetToken: string};
  PersonalInformation: {redirectTo?: string; roomId?: string};
};
