import React, {useEffect} from 'react';
import {StyleSheet, Text, View, ActivityIndicator} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../../types/route';
import {StackNavigationProp} from '@react-navigation/stack';
import {
  clearUserSession,
  getUserSession,
} from '../../store/services/storageService';

export default function SplashScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const loadUserSession = async () => {
      try {
        const session = await getUserSession();

        if (session) {
          const {token, expire} = session;
          const now = new Date();
          const expireDate = new Date(expire);
          if (token && now < expireDate) {
            navigation.replace('UITab');
          } else {
            await clearUserSession();
            navigation.replace('Login');
          }
        } else {
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('Error loading session:', error);
        navigation.replace('Login');
      }
    };

    loadUserSession();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text>Đang kiểm tra phiên đăng nhập...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
