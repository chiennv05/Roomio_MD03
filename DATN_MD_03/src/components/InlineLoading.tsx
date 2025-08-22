import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LoadingAnimation from './LoadingAnimation';
import { Colors } from '../theme/color';
import { Fonts } from '../theme/fonts';
import { responsiveFont, responsiveSpacing } from '../utils/responsive';

interface InlineLoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: any;
}

const InlineLoading: React.FC<InlineLoadingProps> = ({
  message = 'Đang tải...',
  size = 'small',
  color = Colors.limeGreen,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <LoadingAnimation
        size={size}
        color={color}
      />
      {message && (
        <Text style={styles.message}>{message}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsiveSpacing(8),
  },
  message: {
    marginLeft: responsiveSpacing(12),
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
  },
});

export default InlineLoading;
