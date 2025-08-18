import React, {useRef, useEffect} from 'react';
import {View, Text, StyleSheet, Image, Animated} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icons} from '../../../assets/icons';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {
  responsiveFont,
  responsiveSpacing,
  moderateScale,
} from '../../../utils/responsive';

const EmptyNotification = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating animation
    const floatingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    );
    floatingAnimation.start();

    return () => floatingAnimation.stop();
  }, [fadeAnim, scaleAnim, floatAnim]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(139, 195, 74, 0.1)', 'rgba(168, 230, 0, 0.05)']}
        style={styles.gradientBackground}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{scale: scaleAnim}, {translateY: floatAnim}],
          },
        ]}>
        {/* Beautiful icon with gradient background */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[Colors.limeGreen, '#A8E600']}
            style={styles.iconGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}>
            <Text style={styles.iconEmoji}>🔔</Text>
          </LinearGradient>
        </View>

        {/* Tiêu đề chính với gradient text effect */}
        <Text style={styles.title}>✨ Chưa có thông báo nào</Text>

        {/* Mô tả phụ */}
        <Text style={styles.subtitle}>
          Chúng tôi sẽ thông báo ngay khi có điều gì mới dành cho bạn
        </Text>

        {/* Decorative elements */}
        <View style={styles.decorativeContainer}>
          <View
            style={[styles.decorativeDot, {backgroundColor: Colors.limeGreen}]}
          />
          <View style={[styles.decorativeDot, {backgroundColor: '#A8E600'}]} />
          <View
            style={[styles.decorativeDot, {backgroundColor: Colors.limeGreen}]}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(32),
    backgroundColor: 'transparent',
    position: 'relative',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: responsiveSpacing(20),
    margin: responsiveSpacing(16),
  },
  content: {
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: responsiveSpacing(32),
    shadowColor: Colors.limeGreen,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  iconGradient: {
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: moderateScale(60),
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: responsiveFont(48),
  },
  title: {
    fontSize: responsiveFont(24),
    fontFamily: Fonts.Roboto_Bold,
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: responsiveSpacing(12),
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: '#718096',
    textAlign: 'center',
    lineHeight: responsiveFont(24),
    marginBottom: responsiveSpacing(32),
    paddingHorizontal: responsiveSpacing(16),
  },
  decorativeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorativeDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    marginHorizontal: responsiveSpacing(4),
    opacity: 0.6,
  },
});

export default EmptyNotification;
