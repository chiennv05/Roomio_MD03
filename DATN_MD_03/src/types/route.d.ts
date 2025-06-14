export type RootStackParamList = {
  HomeScreen: undefined;
  Login: undefined;
  DetailScreen: {id: number};
  SplashScreen: undefined;
  UITab: undefined;
  ForgotPassword: undefined;
  OTPVerification: {email: string};
  ResetPassWord: {email: string; resetToken: string};
};
