import React, {useEffect, useRef} from 'react';
import {StyleSheet, Text, View, Animated, Easing} from 'react-native';
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
import {Colors} from '../../theme/color';
import {Fonts} from '../../theme/fonts';
import {responsiveFont, responsiveSpacing} from '../../utils/responsive';
import {LoadingAnimation} from '../../components';
import LinearGradient from 'react-native-linear-gradient';

export default function SplashScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.sequence([
      // Logo scale and fade in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 50,
          useNativeDriver: true,
        }),
      ]),
      // Text fade in after a delay
      Animated.timing(textAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, textAnim]);

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
            console.log('session', result);
            if (!checkProfile.rejected.match(result)) {
              console.log(
                'User logged in:',
                result.payload?.mapUser?.username,
                'Role:',
                result.payload?.mapUser?.role,
              );
              navigation.replace('UITab');
            } else {
              await clearUserSession();
              navigation.replace('UITab');
            }
          } else {
            await clearUserSession();
            navigation.replace('UITab');
          }
        } else {
          navigation.replace('UITab');
        }
      } catch (error) {
        console.error('Error loading session:', error);
        navigation.replace('UITab');
      }
    };

    // Add delay to see splash screen
    setTimeout(() => {
      loadUserSession();
    }, 2000);
  }, [dispatch, navigation]);

  return (
    <LinearGradient
      colors={['#ffffff', '#f8fff5', '#ffffff']}
      style={styles.container}>
      {/* App Logo/Brand */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{scale: scaleAnim}],
          },
        ]}>
        <View style={styles.logo}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoText}>🏠</Text>
          </View>
          <Text style={styles.brandText}>Roomio</Text>
          <Text style={styles.taglineText}>Find Your Perfect Room</Text>
        </View>
      </Animated.View>

      {/* Loading Animation */}
      <Animated.View style={[styles.loadingContainer, {opacity: textAnim}]}>
        <LoadingAnimation size="medium" color={Colors.limeGreen} />
        <Text style={styles.loadingText}>Đang kiểm tra phiên đăng nhập...</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: responsiveSpacing(60),
  },
  logo: {
    alignItems: 'center',
  },
  logoIcon: {
    width: responsiveFont(80),
    height: responsiveFont(80),
    backgroundColor: Colors.limeGreenLight,
    borderRadius: responsiveFont(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveSpacing(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: responsiveFont(40),
  },
  brandText: {
    fontSize: responsiveFont(32),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.limeGreen,
    letterSpacing: 2,
    marginBottom: responsiveSpacing(8),
  },
  taglineText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: responsiveSpacing(20),
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    textAlign: 'center',
  },
});
