import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Colors } from '../theme/color';
import { responsiveIcon } from '../utils/responsive';

interface UserAnimationProps {
  size?: number;
  backgroundColor?: string;
  iconColor?: string;
}

const UserAnimation: React.FC<UserAnimationProps> = ({
  size = 100,
  backgroundColor = Colors.limeGreen,
  iconColor = Colors.white,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    // Float animation
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
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

    // Rotate animation for background ring
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    // Glow animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    pulseAnimation.start();
    floatAnimation.start();
    rotateAnimation.start();
    glowAnimation.start();

    return () => {
      pulseAnimation.stop();
      floatAnimation.stop();
      rotateAnimation.stop();
      glowAnimation.stop();
    };
  }, [pulseAnim, floatAnim, rotateAnim, glowAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.container}>
      {/* Background rotating ring */}
      <Animated.View
        style={[
          styles.backgroundRing,
          {
            width: responsiveIcon(size + 30),
            height: responsiveIcon(size + 30),
            borderColor: backgroundColor + '40',
            transform: [{ rotate }],
          },
        ]}
      />

      {/* Glow effect */}
      <Animated.View
        style={[
          styles.glowEffect,
          {
            width: responsiveIcon(size + 20),
            height: responsiveIcon(size + 20),
            backgroundColor: backgroundColor,
            opacity: glowOpacity,
          },
        ]}
      />

      {/* Main user avatar with pulse and float */}
      <Animated.View
        style={[
          styles.avatarContainer,
          {
            width: responsiveIcon(size),
            height: responsiveIcon(size),
            backgroundColor: backgroundColor,
            transform: [
              { scale: pulseAnim },
              { translateY: floatAnim },
            ],
          },
        ]}
      >
        <UserIcon size={size * 0.5} color={iconColor} />
      </Animated.View>

      {/* Floating particles */}
      <FloatingElements />
    </View>
  );
};

// User icon component
const UserIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  return (
    <View style={styles.userIcon}>
      {/* Head */}
      <View
        style={[
          styles.userHead,
          {
            width: responsiveIcon(size * 0.4),
            height: responsiveIcon(size * 0.4),
            backgroundColor: color,
            borderRadius: responsiveIcon(size * 0.2),
          },
        ]}
      />
      {/* Body */}
      <View
        style={[
          styles.userBody,
          {
            width: responsiveIcon(size * 0.8),
            height: responsiveIcon(size * 0.5),
            backgroundColor: color,
            borderTopLeftRadius: responsiveIcon(size * 0.4),
            borderTopRightRadius: responsiveIcon(size * 0.4),
            marginTop: responsiveIcon(size * 0.1),
          },
        ]}
      />
    </View>
  );
};

// Floating elements component
const FloatingElements: React.FC = () => {
  const element1 = useRef(new Animated.Value(0)).current;
  const element2 = useRef(new Animated.Value(0)).current;
  const element3 = useRef(new Animated.Value(0)).current;
  const element4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createElementAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 4000,
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

    const anim1 = createElementAnimation(element1, 0);
    const anim2 = createElementAnimation(element2, 1000);
    const anim3 = createElementAnimation(element3, 2000);
    const anim4 = createElementAnimation(element4, 3000);

    anim1.start();
    anim2.start();
    anim3.start();
    anim4.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
      anim4.stop();
    };
  }, [element1, element2, element3, element4]);

  const createElementStyle = (animValue: Animated.Value, position: { left: number; top: number }, shape: 'circle' | 'square' | 'triangle') => {
    const translateY = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -120],
    });

    const opacity = animValue.interpolate({
      inputRange: [0, 0.1, 0.9, 1],
      outputRange: [0, 1, 1, 0],
    });

    const scale = animValue.interpolate({
      inputRange: [0, 0.3, 0.7, 1],
      outputRange: [0, 1, 1, 0.5],
    });

    const rotation = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return {
      ...styles.floatingElement,
      ...getShapeStyle(shape),
      left: position.left,
      top: position.top,
      transform: [{ translateY }, { scale }, { rotate: rotation }],
      opacity,
    };
  };

  const getShapeStyle = (shape: 'circle' | 'square' | 'triangle') => {
    const size = responsiveIcon(8);
    switch (shape) {
      case 'circle':
        return {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: Colors.limeGreen,
        };
      case 'square':
        return {
          width: size,
          height: size,
          backgroundColor: '#00BCD4',
        };
      case 'triangle':
        return {
          width: 0,
          height: 0,
          backgroundColor: 'transparent',
          borderLeftWidth: size / 2,
          borderRightWidth: size / 2,
          borderBottomWidth: size,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: '#FF9800',
        };
      default:
        return {};
    }
  };

  return (
    <>
      <Animated.View style={createElementStyle(element1, { left: 20, top: 40 }, 'circle')} />
      <Animated.View style={createElementStyle(element2, { left: 80, top: 30 }, 'square')} />
      <Animated.View style={createElementStyle(element3, { left: 50, top: 20 }, 'triangle')} />
      <Animated.View style={createElementStyle(element4, { left: 90, top: 50 }, 'circle')} />
    </>
  );
};

export default UserAnimation;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundRing: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: 1000,
    borderStyle: 'dashed',
  },
  glowEffect: {
    position: 'absolute',
    borderRadius: 1000,
  },
  avatarContainer: {
    borderRadius: 1000,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 2,
  },
  userBody: {
    // No additional styles needed, all handled inline
  },
  floatingElement: {
    position: 'absolute',
  },
}); 