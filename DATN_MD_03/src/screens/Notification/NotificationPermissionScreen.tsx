import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import {Images} from '../../assets/images';
import {Colors} from '../../theme/color';
import {
  responsiveFont,
  responsiveSpacing,
  SCREEN,
} from '../../utils/responsive';
import {Fonts} from '../../theme/fonts';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../types/route';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {requestNotificationPermission} from './services/NativeNotifier';
import LinearGradient from 'react-native-linear-gradient';

export default function NotificationPermissionScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const titleSlideAnim = useRef(new Animated.Value(30)).current;
  const subtitleFadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonSlideAnim = useRef(new Animated.Value(40)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start entrance animations
    Animated.sequence([
      // Initial fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      // Staggered animations
      Animated.parallel([
        // Header slide up
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        // Image scale
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
        // Title slide in
        Animated.timing(titleSlideAnim, {
          toValue: 0,
          duration: 700,
          delay: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        // Subtitle fade in
        Animated.timing(subtitleFadeAnim, {
          toValue: 1,
          duration: 600,
          delay: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        // Button animations
        Animated.parallel([
          Animated.timing(buttonScaleAnim, {
            toValue: 1,
            duration: 600,
            delay: 600,
            easing: Easing.out(Easing.back(1.1)),
            useNativeDriver: true,
          }),
          Animated.timing(buttonSlideAnim, {
            toValue: 0,
            duration: 600,
            delay: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();

    // Continuous pulse animation for image
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulseAnimation.start();

    // Floating animation for subtitles
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -3,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 3,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    floatAnimation.start();

    return () => {
      pulseAnimation.stop();
      floatAnimation.stop();
    };
  }, [
    fadeAnim,
    slideAnim,
    scaleAnim,
    titleSlideAnim,
    subtitleFadeAnim,
    buttonScaleAnim,
    buttonSlideAnim,
    pulseAnim,
    floatAnim,
  ]);

  const animateButtonPress = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(callback);
  };

  const handleEnable = async () => {
    animateButtonPress(async () => {
      try {
        await requestNotificationPermission();
        await AsyncStorage.multiSet([
          ['notif:asked', '1'],
          ['notif:enabled', '1'],
        ]);
        navigation.replace('UITab');
      } catch (error) {
        console.error('Error enabling notifications:', error);
        navigation.replace('UITab');
      }
    });
  };

  const handleDisable = async () => {
    animateButtonPress(async () => {
      try {
        await AsyncStorage.multiSet([
          ['notif:asked', '1'],
          ['notif:enabled', '0'],
        ]);
        navigation.replace('UITab');
      } catch (error) {
        console.error('Error disabling notifications:', error);
        navigation.replace('UITab');
      }
    });
  };

  return (
    <LinearGradient
      colors={['#f8f9fa', '#e9ecef', '#f8f9fa']}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            },
          ]}>
          <Animated.View
            style={[
              styles.topActions,
              {
                transform: [{translateY: slideAnim}],
              },
            ]}>
            <Text style={styles.topHeading}>Cho phép thông báo</Text>
            <TouchableOpacity onPress={handleDisable} style={styles.skipButton}>
              <Text style={styles.topActionText}>Bỏ qua</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={[
              styles.imageContainer,
              {
                transform: [{scale: Animated.multiply(scaleAnim, pulseAnim)}],
              },
            ]}>
            <Image
              source={{uri: Images.ImageNotification}}
              style={styles.image}
            />
          </Animated.View>

          <Animated.Text
            style={[
              styles.title,
              {
                transform: [{translateY: titleSlideAnim}],
              },
            ]}>
            Cho phép Roomio có thể gửi thông báo cho bạn
          </Animated.Text>

          <Animated.View
            style={[
              styles.subtitleContainer,
              {
                opacity: subtitleFadeAnim,
                transform: [{translateY: floatAnim}],
              },
            ]}>
            <Text style={styles.subtitle}>
              Gửi hóa đơn tiền nhà mỗi tháng qua app
            </Text>
            <Text style={styles.subtitle}>
              Gợi ý cho bạn những phòng trọ tại khu vực gần bạn
            </Text>
          </Animated.View>

          <View style={styles.spacer} />

          <Animated.View
            style={[
              styles.actionArea,
              {
                transform: [
                  {scale: buttonScaleAnim},
                  {translateY: buttonSlideAnim},
                ],
              },
            ]}>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={handleEnable}>
              <Text style={[styles.textButton, styles.btnPrimaryText]}>
                Cho phép
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    padding: responsiveSpacing(20),
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: responsiveSpacing(12),
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  image: {
    width: SCREEN.width * 0.8,
    height: SCREEN.width * 0.8,
    resizeMode: 'contain',
  },
  title: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginTop: responsiveSpacing(8),
    textAlign: 'center',
    lineHeight: responsiveFont(26),
    paddingHorizontal: responsiveSpacing(16),
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  topActions: {
    width: '100%',
    alignItems: 'center',
    marginBottom: responsiveSpacing(12),
  },
  topActionText: {
    color: Colors.gray60,
    fontSize: responsiveFont(14),
  },
  spacer: {flex: 1},
  actionArea: {
    width: '100%',
    marginTop: responsiveSpacing(12),
  },
  btn: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: responsiveFont(50),
    paddingVertical: responsiveSpacing(12),
    shadowColor: Colors.black,
  },
  textButton: {
    color: Colors.black,
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
  },
  btnPrimary: {
    backgroundColor: Colors.limeGreen,
  },
  btnPrimaryText: {
    color: Colors.black,
  },
  skipButton: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  topHeading: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    textAlign: 'center',
  },
  subtitleContainer: {
    marginTop: responsiveSpacing(16),
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(20),
  },
  subtitle: {
    fontSize: responsiveFont(15),
    color: Colors.gray60,
    marginTop: responsiveSpacing(8),
    textAlign: 'center',
    lineHeight: responsiveFont(22),
    fontFamily: Fonts.Roboto_Medium,
    opacity: 0.8,
  },
});
