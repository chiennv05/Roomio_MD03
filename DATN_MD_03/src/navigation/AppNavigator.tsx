import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginAndRegister from '../screens/LoginAndRegister/LoginAndRegister';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import ContractDetailScreen from '../screens/ChuTro/Contract/ContractDetailScreen';
import PdfViewerScreen from '../screens/ChuTro/Contract/PdfViewerScreen';
import RoomDetail from '../screens/ChuTro/RoomDetail/RoomDetail';
import ContractTenantsScreen from '../screens/ChuTro/ContractManagement/ContractTenantsScreen';
import {RootStackParamList} from '../types/route';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Login" component={LoginAndRegister} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="ContractDetail" component={ContractDetailScreen} />
        <Stack.Screen name="PdfViewer" component={PdfViewerScreen} />
        <Stack.Screen name="DetailRoomLandlord" component={RoomDetail} />
        <Stack.Screen
          name="ContractTenants"
          component={ContractTenantsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
