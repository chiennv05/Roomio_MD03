import React, {useEffect} from 'react';
import {StyleSheet, Text, View, ActivityIndicator} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../../types/route';
import {StackNavigationProp} from '@react-navigation/stack';
import {
  clearUserSession,
  getUserSession,
} from '../../store/services/storageService';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../../store';
import {checkProfile} from '../../store/slices/authSlice';

export default function SplashScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const loadUserSession = async () => {
      try {
        const session = await getUserSession();

        if (session) {
          const {token, expire} = session;

          const now = new Date();
          const expireDate = new Date(expire);
          if (token && now < expireDate) {
            const result = await dispatch(checkProfile(session.token));
            console.log('result', result);
            if (!checkProfile.rejected.match(result)) {
              navigation.replace('UITab');
            } else {
              await clearUserSession();
              navigation.replace('Login');
            }
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
  }, [dispatch, navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text>Đang kiểm tra phiên đăng nhập...</Text>
      {/* <Button title="Test" onPress={loadUserSession} /> */}
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
