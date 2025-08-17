import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import CustomTabar from './CustomTabar';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
// import SearchScreen from '../screens/SearchScreen/SearchScreen';
import FavoriteScreen from '../screens/Favorite/FavoriteScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

// import NotificationScreen from '../screens/Notification/NotificationScreen';
import FindMayScreen from '../screens/FindMapScreen/FindMayScreen';

const Tab = createBottomTabNavigator();
export default function UITab() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Trang chủ',
        }}
      />


      <Tab.Screen
        name="Map"
        component={FindMayScreen}

        options={{
          tabBarLabel: 'Map',
        }}
      />
      <Tab.Screen
        name="Favorite"
        component={FavoriteScreen}
        options={{
          tabBarLabel: 'Yêu thích',
        }}
      />


      <Tab.Screen
        name="Profile"

        component={ProfileScreen}
        options={{
          tabBarLabel: 'Cá nhân',
        }}
      />
    </Tab.Navigator>
  );
}
