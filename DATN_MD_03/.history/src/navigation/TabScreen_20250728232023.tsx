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
import NotificationScreen from '../screens/Notification/NotificationScreen';
import TenantList from '../screens/ChuTro/TenantList/TenantList';
import TenantDetailScreen from '../screens/ChuTro/TenantList/TenantDetailScreen';
import ContractTenantsScreen from '../screens/ChuTro/ContractManagement/ContractTenantsScreen';

// Import gesture handler để hỗ trợ stack navigation
import 'react-native-gesture-handler';

import PersonalInformation from '../screens/Profile/PersonalInformation';
import MyRoomScreen from '../screens/ChuTro/MyRoom/MyRoomScreen';
import BillScreen from '../screens/Bill/BillScreen';
import BillDetailScreen from '../screens/Bill/BillDetailScreen';
import RoommateInvoiceDetailScreen from '../screens/Bill/RoommateInvoiceDetailScreen';
import CreateInvoiceScreen from '../screens/Bill/CreateInvoiceScreen';
import EditInvoiceScreen from '../screens/Bill/EditInvoiceScreen';
import InvoiceTemplatesScreen from '../screens/Bill/InvoiceTemplatesScreen';
import AddRoomScreen from '../screens/ChuTro/AddRoom/AddRoomScreen';

import ContractManagement from '../screens/ChuTro/Contract/ContractManagement';
import ContractDetailScreen from '../screens/ChuTro/Contract/ContractDetailScreen';
import AddContract from '../screens/ChuTro/Contract/AddContract';
import PdfViewerScreen from '../screens/ChuTro/Contract/PdfViewerScreen';
import MapScreen from '../screens/ChuTro/AddRoom/MapScreen';
import RoomDetail from '../screens/ChuTro/RoomDetail/RoomDetail';
import UpdateRoom from '../screens/ChuTro/UpdateRoom/UpdateRoom';
import UpdateContract from '../screens/ChuTro/Contract/UpdateContract';
import PolicyTerms from '../screens/PolicyTerms/PolicyTerms';
// >>>>>>> origin/chien

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
          <Stack.Screen name="Notification" component={NotificationScreen} />
          <Stack.Screen
            name="PersonalInformation"
            component={PersonalInformation}
          />
          <Stack.Screen
            name="Bill"
            component={BillScreen}
            options={{
              ...TransitionPresets.SlideFromRightIOS,
            }} />
          <Stack.Screen
            // <<<<<<< HEAD

            // =======
            name="TenantList"
            component={TenantList}

            options={{
              ...TransitionPresets.SlideFromRightIOS,
            }}
          />
          <Stack.Screen
            // <<<<<<< HEAD
            name="BillDetails"
            component={BillDetailScreen}
            // =======
            name="TenantDetail"
            component={TenantDetailScreen}
            // {/* >>>>>>> origin/chien */}
            options={{
              ...TransitionPresets.SlideFromRightIOS,
            }}
          />
          <Stack.Screen
            // <<<<<<< HEAD
            name="RoommateInvoiceDetails"
            component={RoommateInvoiceDetailScreen}
            options={{
              ...TransitionPresets.SlideFromRightIOS,
            }}
          />
          <Stack.Screen
            name="CreateInvoice"
            component={CreateInvoiceScreen}
            options={{
              ...TransitionPresets.SlideFromRightIOS,
            }}
          />
          <Stack.Screen
            name="EditInvoice"
            component={EditInvoiceScreen}
            options={{
              ...TransitionPresets.SlideFromRightIOS,
            }}
          />
          <Stack.Screen
            name="InvoiceTemplates"
            component={InvoiceTemplatesScreen}
            // =======
            name="ContractTenants"
            component={ContractTenantsScreen}
            // {/* >>>>>>> origin/chien */}
            options={{
              ...TransitionPresets.SlideFromRightIOS,
            }}
          />


          <Stack.Screen name="LandlordRoom" component={MyRoomScreen} />
          <Stack.Screen name="AddRooom" component={AddRoomScreen} />

          <Stack.Screen
            name="ContractManagement"
            component={ContractManagement}
            options={{
              ...TransitionPresets.SlideFromRightIOS,
            }}
          />
          <Stack.Screen
            name="ContractDetail"
            component={ContractDetailScreen}
            options={{
              ...TransitionPresets.SlideFromRightIOS,
            }}
          />
          <Stack.Screen name="PdfViewer" component={PdfViewerScreen} />
          <Stack.Screen
            name="MapScreen"
            component={MapScreen}
            options={{
              ...TransitionPresets.SlideFromRightIOS,
            }}
          />
          <Stack.Screen name="DetailRoomLandlord" component={RoomDetail} />
          <Stack.Screen name="UpdateRoomScreen" component={UpdateRoom} />
          <Stack.Screen name="AddContract" component={AddContract} />
          <Stack.Screen
            name="UpdateContract"
            component={UpdateContract}
            options={{
              ...TransitionPresets.SlideFromRightIOS,
            }}
          />
          <Stack.Screen
            name="PolicyTerms"
            component={PolicyTerms}
            options={{
              ...TransitionPresets.SlideFromRightIOS,
            }}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </>



  );
}