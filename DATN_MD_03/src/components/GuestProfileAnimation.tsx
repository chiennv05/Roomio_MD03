import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Colors } from '../theme/color';
import { Fonts } from '../theme/fonts';
import { Icons } from '../assets/icons';
import { responsiveIcon, responsiveFont, responsiveSpacing } from '../utils/responsive';

interface GuestProfileAnimationProps {
  onLoginPress: () => void;
}

const GuestProfileAnimation: React.FC<GuestProfileAnimationProps> = ({
  onLoginPress,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation for main circle
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
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

    // Float animation
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    // Rotate animation for decorative elements
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    // Button pulse animation
    const buttonPulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(buttonScaleAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(buttonScaleAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    pulseAnimation.start();
    floatAnimation.start();
    rotateAnimation.start();
    buttonPulseAnimation.start();

    return () => {
      pulseAnimation.stop();
      floatAnimation.stop();
      rotateAnimation.stop();
      buttonPulseAnimation.stop();
    };
  }, [pulseAnim, floatAnim, rotateAnim, buttonScaleAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Background decorative circles */}
      <Animated.View
        style={[
          styles.decorativeCircle1,
          {
            transform: [{ rotate }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.decorativeCircle2,
          {
            transform: [{ rotate: rotate }, { scale: pulseAnim }],
          },
        ]}
      />

      {/* Main content with float animation */}
      <Animated.View
        style={[
          styles.mainContent,
          {
            transform: [{ translateY: floatAnim }],
          },
        ]}
      >
        {/* User icon with pulse */}
        <Animated.View
          style={[
            styles.userIconContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <UserIcon />
        </Animated.View>

        {/* Welcome text */}
        <Text style={styles.welcomeText}>Chào mừng bạn!</Text>
        <Text style={styles.descriptionText}>
          Đăng nhập để trải nghiệm đầy đủ các tính năng của Roomio
        </Text>

        {/* Login button with animation */}
        <Animated.View
          style={[
            styles.buttonWrapper,
            {
              transform: [{ scale: buttonScaleAnim }],
            },
          ]}
        >
          <TouchableOpacity style={styles.loginButton} onPress={onLoginPress}>
            <Text style={styles.loginButtonText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Feature highlights */}
        <View style={styles.featuresContainer}>
          <FeatureItem iconUri={Icons.IconHome} text="Tìm phòng yêu thích" />
          <FeatureItem iconUri={Icons.IconHeartFavourite} text="Lưu danh sách ưa thích" />
          <FeatureItem iconUri={Icons.IconFluentPersonRegular} text="Quản lý thông tin cá nhân" />
        </View>
      </Animated.View>

      {/* Floating particles */}
      <FloatingParticles />
    </View>
  );
};

// User icon component
const UserIcon: React.FC = () => {
  return (
    <View style={styles.userIcon}>
      {/* Head */}
      <View style={styles.userHead} />
      {/* Body */}
      <View style={styles.userBody} />
    </View>
  );
};

// Feature item component
const FeatureItem: React.FC<{ iconUri?: string; text: string }> = ({ iconUri, text }) => {
  return (
    <View style={styles.featureItem}>
      {iconUri ? (
        <Image source={{ uri: iconUri }} style={styles.featureIcon} />
      ) : (
        <View style={styles.featureIcon} />
      )}
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
};

// Floating particles component
const FloatingParticles: React.FC = () => {
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createParticleAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 5000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );
    };

    const anim1 = createParticleAnimation(particle1, 0);
    const anim2 = createParticleAnimation(particle2, 1500);
    const anim3 = createParticleAnimation(particle3, 3000);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [particle1, particle2, particle3]);

  const createParticleStyle = (animValue: Animated.Value, position: { left: number; top: number }) => {
    const translateY = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -150],
    });

    const opacity = animValue.interpolate({
      inputRange: [0, 0.1, 0.9, 1],
      outputRange: [0, 1, 1, 0],
    });

    const scale = animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 1, 0.3],
    });

    return {
      ...styles.particle,
      left: position.left,
      top: position.top,
      transform: [{ translateY }, { scale }],
      opacity,
    };
  };

  return (
    <>
      <Animated.View style={createParticleStyle(particle1, { left: 30, top: 100 })} />
      <Animated.View style={createParticleStyle(particle2, { left: 300, top: 80 })} />
      <Animated.View style={createParticleStyle(particle3, { left: 200, top: 120 })} />
    </>
  );
};

export default GuestProfileAnimation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(20),
    position: 'relative',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: responsiveIcon(200),
    height: responsiveIcon(200),
    borderRadius: responsiveIcon(100),
    borderWidth: 2,
    borderColor: Colors.limeGreen + '20',
    borderStyle: 'dashed',
  },
  decorativeCircle2: {
    position: 'absolute',
    width: responsiveIcon(150),
    height: responsiveIcon(150),
    borderRadius: responsiveIcon(75),
    borderWidth: 1,
    borderColor: Colors.limeGreen + '30',
    borderStyle: 'dotted',
  },
  mainContent: {
    alignItems: 'center',
  },
  userIconContainer: {
    width: responsiveIcon(120),
    height: responsiveIcon(120),
    borderRadius: responsiveIcon(60),
    backgroundColor: Colors.limeGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveSpacing(24),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  userIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  userHead: {
    width: responsiveIcon(30),
    height: responsiveIcon(30),
    borderRadius: responsiveIcon(15),
    backgroundColor: Colors.white,
    marginBottom: responsiveSpacing(4),
  },
  userBody: {
    width: responsiveIcon(50),
    height: responsiveIcon(30),
    backgroundColor: Colors.white,
    borderTopLeftRadius: responsiveIcon(25),
    borderTopRightRadius: responsiveIcon(25),
  },
  welcomeText: {
    fontSize: responsiveFont(28),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(12),
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: responsiveFont(24),
    marginBottom: responsiveSpacing(40),
    paddingHorizontal: responsiveSpacing(32),
  },
  buttonWrapper: {
    marginBottom: responsiveSpacing(48),
  },
  loginButton: {
    backgroundColor: Colors.limeGreen,
    paddingHorizontal: responsiveSpacing(40),
    paddingVertical: responsiveSpacing(16),
    borderRadius: responsiveIcon(30),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  loginButtonText: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  featuresContainer: {
    alignSelf: 'stretch',
    paddingHorizontal: responsiveSpacing(40),
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: responsiveSpacing(16),
    paddingHorizontal: responsiveSpacing(20),
    marginBottom: responsiveSpacing(12),
    borderRadius: responsiveIcon(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featureIcon: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
    marginRight: responsiveSpacing(16),
    tintColor: Colors.limeGreen,
  },
  featureText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    flex: 1,
  },
  particle: {
    position: 'absolute',
    width: responsiveIcon(8),
    height: responsiveIcon(8),
    borderRadius: responsiveIcon(4),
    backgroundColor: Colors.limeGreen,
  },
}); 