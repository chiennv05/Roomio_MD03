import React, {useEffect, useRef} from 'react';
import {StyleSheet, Text, View, Animated, Easing, Image} from 'react-native';
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
import {Images} from '../../assets/images';

export default function SplashScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowRotate = useRef(new Animated.Value(0)).current;

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

    // Continuous subtle pulse and glow rotation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.timing(glowRotate, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [fadeAnim, scaleAnim, textAnim, pulseAnim, glowRotate]);

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
    <LinearGradient colors={[Colors.limeGreen, Colors.limeGreen]} style={styles.container}>
      {/* App Logo/Brand */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{scale: Animated.multiply(scaleAnim, pulseAnim)}],
          },
        ]}>
        <View style={styles.logo}>
          <Animated.View
            style={[
              styles.glowBox,
              {transform: [{rotate: glowRotate.interpolate({inputRange: [0, 1], outputRange: ['0deg', '360deg']})}]},
            ]}
          />
          <Image source={{uri: Images.ImageRoomio as any}} style={styles.logoImage} resizeMode="contain" />
          <Text style={styles.taglineText}>
            Gọn gàng từng phòng{"\n"}rõ ràng từng đồng
          </Text>
        </View>
      </Animated.View>

      {/* Loading Animation */}
      <Animated.View style={[styles.loadingContainer, {opacity: textAnim}]}>
        <LoadingAnimation size="medium" color={Colors.dearkOlive} />
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
    backgroundColor: Colors.limeGreen,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: responsiveSpacing(60),
  },
  logo: {
    alignItems: 'center',
  },
  glowBox: {
    position: 'absolute',
    width: 300,
    height: 300,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: 24,
    transform: [{rotate: '14deg'}],
  },
  logoImage: {
    width: 240,
    height: 70,
    marginBottom: responsiveSpacing(10),
  },
  taglineText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.dearkOlive,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: responsiveSpacing(24),
    paddingVertical: responsiveSpacing(14),
    borderRadius: 16,
  },
  loadingText: {
    marginTop: responsiveSpacing(12),
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.dearkOlive,
    textAlign: 'center',
    fontWeight: '600',
  },
});
