import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Colors } from '../theme/color';
import { Fonts } from '../theme/fonts';
import { responsiveFont, responsiveSpacing } from '../utils/responsive';

interface EmptySearchAnimationProps {
  title?: string;
  subtitle?: string;
}

const EmptySearchAnimation: React.FC<EmptySearchAnimationProps> = ({
  title = 'Không tìm thấy phòng phù hợp',
  subtitle = 'Thử thay đổi từ khóa tìm kiếm khác',
}) => {
  const searchIconAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Bounce animation for main container
    Animated.sequence([
      Animated.delay(200),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Rotating search icon animation
    const rotateAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(searchIconAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(searchIconAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
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
      ])
    );

    rotateAnimation.start();
    pulseAnimation.start();

    return () => {
      rotateAnimation.stop();
      pulseAnimation.stop();
    };
  }, [searchIconAnim, pulseAnim, fadeAnim, bounceAnim]);

  const searchIconRotation = searchIconAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: bounceAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          })}],
        },
      ]}
    >
      <View style={styles.animationContainer}>
        {/* Background circles */}
        <Animated.View
          style={[
            styles.backgroundCircle,
            styles.circle1,
            { transform: [{ scale: pulseAnim }] },
          ]}
        />
        <Animated.View
          style={[
            styles.backgroundCircle,
            styles.circle2,
            { transform: [{ scale: pulseAnim.interpolate({
              inputRange: [1, 1.2],
              outputRange: [1.1, 1.3],
            })}] },
          ]}
        />

        {/* Search icon container */}
        <Animated.View
          style={[
            styles.searchIconContainer,
            { transform: [{ rotate: searchIconRotation }] },
          ]}
        >
          <View style={styles.searchIcon}>
            <View style={styles.searchCircle} />
            <View style={styles.searchHandle} />
          </View>
        </Animated.View>

        {/* Floating dots */}
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, styles.dot1, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.dot, styles.dot2, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.dot, styles.dot3, { opacity: pulseAnim }]} />
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(32),
    paddingVertical: responsiveSpacing(40),
  },
  animationContainer: {
    width: 200,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveSpacing(30),
    position: 'relative',
  },
  backgroundCircle: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: Colors.limeGreen,
  },
  circle1: {
    width: 80,
    height: 80,
    opacity: 0.1,
  },
  circle2: {
    width: 120,
    height: 120,
    opacity: 0.05,
  },
  searchIconContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  searchIcon: {
    width: 30,
    height: 30,
    position: 'relative',
  },
  searchCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: Colors.limeGreen,
    position: 'absolute',
    top: 2,
    left: 2,
  },
  searchHandle: {
    width: 12,
    height: 3,
    backgroundColor: Colors.limeGreen,
    borderRadius: 2,
    position: 'absolute',
    bottom: 3,
    right: 3,
    transform: [{ rotate: '45deg' }],
  },
  dotsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.limeGreen,
    position: 'absolute',
  },
  dot1: {
    top: 20,
    right: 30,
  },
  dot2: {
    bottom: 30,
    left: 20,
  },
  dot3: {
    top: 50,
    left: 40,
  },
  title: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: responsiveSpacing(8),
  },
  subtitle: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: responsiveFont(20),
  },
});

export default EmptySearchAnimation;
