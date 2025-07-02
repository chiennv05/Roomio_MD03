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
};
