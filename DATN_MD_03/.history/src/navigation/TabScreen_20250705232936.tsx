import React from 'react';

import { StatusBar } from 'react-native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { RootStackParamList } from '../types/route';
import { Colors } from '../theme/color';


import SplashScreen from '../screens/Splash/SplashScreen';
import LoginAndRegister from '../screens/LoginAndRegister/LoginAndRegister';
import { NavigationContainer } from '@react-navigation/native';
import UITab from './UITab';
import OTPVerificationScreen from '../screens/LoginAndRegister/OTPVerificationScreen';
import ForgotPasswordScreen from '../screens/LoginAndRegister/ForgotPasswordScreen';
import ResetPassWord from '../screens/LoginAndRegister/ResetPassWord';

import DetailRoomScreen from '../screens/DetailRoomScreen/DetailRoomScreen';

// Import gesture handler để hỗ trợ stack navigation
import 'react-native-gesture-handler';

import PersonalInformation from '../screens/Profile/PersonalInformation';
import MyRoomScreen from '../screens/ChuTro/MyRoom/MyRoomScreen';

const Stack = createStackNavigator<RootStackParamList>();

// Deep linking configuration (temporarily disabled for debugging)
// const linking = {
//   prefixes: ['roomio://', 'https://roomio.app'],
//   config: {
//     screens: {
//       SplashScreen: 'splash',
//       Login: 'login',
//       UITab: {
//         path: '/home',
//         screens: {
//           HomeScreen: 'home',
//           SearchScreen: 'search',
//           FavoriteScreen: 'favorites',
//           NotificationScreen: 'notifications',
//           ProfileScreen: 'profile',
//         },
//       },
//       DetailRoom: {
//         path: '/room/:roomId',
//         parse: {
//           roomId: (roomId: string) => roomId,
//         },
//       },
//       PersonalInformation: 'profile/personal',
//       ForgotPassword: 'forgot-password',
//       OTPVerification: 'otp-verification',
//       ResetPassWord: 'reset-password',
//     },
//   },
// };

export default function TabScreen() {
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.backgroud}
        translucent={false}
      />
      <NavigationContainer>

        <Stack.Navigator initialRouteName="SplashScreen" screenOptions={{ headerShown: false }} >

          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginAndRegister} />
          <Stack.Screen name="UITab" component={UITab} />
          <Stack.Screen
            name="DetailRoom"
            component={DetailRoomScreen}
            options={{
              ...TransitionPresets.SlideFromRightIOS,
            }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen
            name="OTPVerification"
            component={OTPVerificationScreen}
          />
          <Stack.Screen name="ResetPassWord" component={ResetPassWord} />
          <Stack.Screen
            name="PersonalInformation"
            component={PersonalInformation}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </>



  );
}