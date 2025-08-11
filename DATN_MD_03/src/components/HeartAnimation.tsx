import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Colors } from '../theme/color';
import { responsiveIcon } from '../utils/responsive';

interface HeartAnimationProps {
  size?: number;
  color?: string;
}

const HeartAnimation: React.FC<HeartAnimationProps> = ({
  size = 80,
  color = Colors.textGray,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
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
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    // Rotate animation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    pulseAnimation.start();
    floatAnimation.start();
    rotateAnimation.start();

    return () => {
      pulseAnimation.stop();
      floatAnimation.stop();
      rotateAnimation.stop();
    };
  }, [pulseAnim, floatAnim, rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Background circle with rotation */}
      <Animated.View
        style={[
          styles.backgroundCircle,
          {
            width: responsiveIcon(size + 40),
            height: responsiveIcon(size + 40),
            transform: [{ rotate }],
          },
        ]}
      >
        <View style={styles.innerCircle} />
      </Animated.View>

      {/* Main heart with pulse and float */}
      <Animated.View
        style={[
          styles.heartContainer,
          {
            transform: [
              { scale: pulseAnim },
              { translateY: floatAnim },
            ],
          },
        ]}
      >
        <HeartShape size={size} color={color} />
      </Animated.View>

      {/* Floating love sparkles */}
      <FloatingSparkles />

      {/* Love bubbles */}
      <LoveBubbles />
    </View>
  );
};

// Heart shape component
const HeartShape: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  return (
    <View style={[styles.heart, { width: responsiveIcon(size), height: responsiveIcon(size * 0.9) }]}>
      {/* Left heart lobe */}
      <View
        style={[
          styles.heartLeft,
          {
            backgroundColor: color,
            width: responsiveIcon(size * 0.5),
            height: responsiveIcon(size * 0.4),
            borderRadius: responsiveIcon(size * 0.25),
          },
        ]}
      />
      {/* Right heart lobe */}
      <View
        style={[
          styles.heartRight,
          {
            backgroundColor: color,
            width: responsiveIcon(size * 0.5),
            height: responsiveIcon(size * 0.4),
            borderRadius: responsiveIcon(size * 0.25),
          },
        ]}
      />
      {/* Heart bottom point */}
      <View
        style={[
          styles.heartBottom,
          {
            backgroundColor: color,
            width: responsiveIcon(size * 0.4),
            height: responsiveIcon(size * 0.4),
          },
        ]}
      />
    </View>
  );
};

// Floating sparkles component (like love effects)
const FloatingSparkles: React.FC = () => {
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
            duration: 3000,
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
    const anim2 = createParticleAnimation(particle2, 1000);
    const anim3 = createParticleAnimation(particle3, 2000);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [particle1, particle2, particle3]);

  const createSparkleStyle = (animValue: Animated.Value, position: { left: number; top: number }) => {
    const translateY = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -100],
    });

    const opacity = animValue.interpolate({
      inputRange: [0, 0.1, 0.9, 1],
      outputRange: [0, 1, 1, 0],
    });

    const scale = animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 1, 0.5],
    });

    return {
      ...styles.particle,
      left: position.left,
      top: position.top,
      backgroundColor: '#FF69B4', // Pink color for love theme
      transform: [{ translateY }, { scale }],
      opacity,
    };
  };

  return (
    <>
      <Animated.View style={createSparkleStyle(particle1, { left: 20, top: 30 })} />
      <Animated.View style={createSparkleStyle(particle2, { left: 70, top: 25 })} />
      <Animated.View style={createSparkleStyle(particle3, { left: 50, top: 20 })} />
    </>
  );
};

// Love bubbles component
const LoveBubbles: React.FC = () => {
  const bubble1 = useRef(new Animated.Value(0)).current;
  const bubble2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createBubbleAnimation = (animValue: Animated.Value, delay: number) => {
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

    const anim1 = createBubbleAnimation(bubble1, 0);
    const anim2 = createBubbleAnimation(bubble2, 2000);

    anim1.start();
    anim2.start();

    return () => {
      anim1.stop();
      anim2.stop();
    };
  }, [bubble1, bubble2]);

  const createBubbleStyle = (animValue: Animated.Value, position: { left: number; top: number }, size: number) => {
    const translateY = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -150],
    });

    const opacity = animValue.interpolate({
      inputRange: [0, 0.1, 0.8, 1],
      outputRange: [0, 0.8, 0.8, 0],
    });

    const scale = animValue.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0, 1, 0.3],
    });

    return {
      ...styles.loveBubble,
      left: position.left,
      top: position.top,
      width: responsiveIcon(size),
      height: responsiveIcon(size),
      borderRadius: responsiveIcon(size / 2),
      transform: [{ translateY }, { scale }],
      opacity,
    };
  };

  return (
    <>
      <Animated.View style={createBubbleStyle(bubble1, { left: 30, top: 60 }, 12)} />
      <Animated.View style={createBubbleStyle(bubble2, { left: 80, top: 55 }, 8)} />
    </>
  );
};

export default HeartAnimation;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundCircle: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FF69B4' + '30',
    borderRadius: 1000,
    borderStyle: 'dashed',
  },
  innerCircle: {
    flex: 1,
    margin: 10,
    borderWidth: 1,
    borderColor: '#FF1493' + '20',
    borderRadius: 1000,
    borderStyle: 'dotted',
  },
  heartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heart: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartLeft: {
    position: 'absolute',
    left: '15%',
    top: 0,
    transform: [{ rotate: '-45deg' }],
  },
  heartRight: {
    position: 'absolute',
    right: '15%',
    top: 0,
    transform: [{ rotate: '45deg' }],
  },
  heartBottom: {
    position: 'absolute',
    bottom: 0,
    left: '30%',
    transform: [{ rotate: '45deg' }],
  },
  particle: {
    position: 'absolute',
    width: responsiveIcon(6),
    height: responsiveIcon(6),
    backgroundColor: Colors.limeGreen,
    borderRadius: responsiveIcon(3),
  },
  loveBubble: {
    position: 'absolute',
    backgroundColor: '#FF69B4',
    borderWidth: 1,
    borderColor: '#FF1493',
  },
});
