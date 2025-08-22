import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Easing } from 'react-native';
import { Colors } from '../theme/color';

interface LoadingAnimationProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: any;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  size = 'medium',
  color = Colors.limeGreen,
  style,
}) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Size configurations
  const sizeConfig = {
    small: { container: 30, dots: 6, spacing: 15 },
    medium: { container: 50, dots: 10, spacing: 25 },
    large: { container: 70, dots: 14, spacing: 35 },
  };

  const currentSize = sizeConfig[size];

  useEffect(() => {
    // Initial scale in animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Continuous spin animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Continuous pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    spinAnimation.start();
    pulseAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
    };
  }, [spinAnim, pulseAnim, scaleAnim]);

  const spinRotation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: currentSize.container * 2,
          height: currentSize.container * 2,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      {/* Background pulse circle */}
      <Animated.View
        style={[
          styles.backgroundCircle,
          {
            width: currentSize.container,
            height: currentSize.container,
            borderColor: color,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      {/* Rotating dots container */}
      <Animated.View
        style={[
          styles.dotsContainer,
          {
            width: currentSize.container * 2,
            height: currentSize.container * 2,
            transform: [{ rotate: spinRotation }],
          },
        ]}
      >
        {/* Static dots positioned around circle */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
          const angle = (index * 360) / 8;
          const radians = (angle * Math.PI) / 180;
          const x = Math.cos(radians) * currentSize.spacing;
          const y = Math.sin(radians) * currentSize.spacing;

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: currentSize.dots,
                  height: currentSize.dots,
                  backgroundColor: color,
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.3],
                    outputRange: [0.4, 1],
                  }),
                  transform: [
                    { translateX: x },
                    { translateY: y },
                    { scale: pulseAnim.interpolate({
                      inputRange: [1, 1.3],
                      outputRange: [0.6, 1],
                    })},
                  ],
                },
              ]}
            />
          );
        })}
      </Animated.View>

      {/* Center dot */}
      <Animated.View
        style={[
          styles.centerDot,
          {
            width: currentSize.dots * 1.5,
            height: currentSize.dots * 1.5,
            backgroundColor: color,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundCircle: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 1,
    opacity: 0.2,
  },
  dotsContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    position: 'absolute',
    borderRadius: 100,
  },
  centerDot: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.8,
  },
});

export default LoadingAnimation;
