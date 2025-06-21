import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {RootStackParamList} from '../types/route';

import SplashScreen from '../screens/Splash/SplashScreen';
import LoginAndRegister from '../screens/LoginAndRegister/LoginAndRegister';
import {NavigationContainer} from '@react-navigation/native';
import UITab from './UITab';
import OTPVerificationScreen from '../screens/LoginAndRegister/OTPVerificationScreen';
import ForgotPasswordScreen from '../screens/LoginAndRegister/ForgotPasswordScreen';
import ResetPassWord from '../screens/LoginAndRegister/ResetPassWord';
<<<<<<< HEAD
import DetailRoomScreen from '../screens/DetailRoomScreen/DetailRoomScreen';

// Import gesture handler để hỗ trợ stack navigation
import 'react-native-gesture-handler';
=======
import PersonalInformation from '../screens/Profile/PersonalInformation';
>>>>>>> origin/dev

const Stack = createStackNavigator<RootStackParamList>();

export default function TabScreen() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}> 
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginAndRegister} />
        <Stack.Screen name="UITab" component={UITab} />
        <Stack.Screen name="DetailRoom" component={DetailRoomScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen
          name="OTPVerification"
          component={OTPVerificationScreen}
        />
        <Stack.Screen name="ResetPassWord" component={ResetPassWord} />
        <Stack.Screen name="PersonalInformation" component={PersonalInformation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
