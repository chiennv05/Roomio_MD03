import React from 'react';
import {StyleSheet, StyleProp, ViewStyle} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SCREEN} from '../utils/responsive';

interface ContainerLinearGradientProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function ContainerLinearGradient({
  children,
  style,
}: ContainerLinearGradientProps) {
  return (
    <LinearGradient
      colors={['#BAFD00', '#F4F4F4']}
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}
      style={[styles.container, style]}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN.width,
    height: SCREEN.height * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
