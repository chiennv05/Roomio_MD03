import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import LoadingAnimation from './LoadingAnimation';
import { Colors } from '../theme/color';
import { Fonts } from '../theme/fonts';
import { responsiveFont, responsiveSpacing } from '../utils/responsive';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  size?: 'small' | 'medium' | 'large';
  transparent?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Đang tải...',
  size = 'large',
  transparent = false,
}) => {
  if (!visible) {return null;}

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
    >
      <View style={[
        styles.overlay,
        transparent && styles.transparentOverlay,
      ]}>
        <View style={styles.container}>
          <LoadingAnimation
            size={size}
            color={Colors.limeGreen}
          />
          {message && (
            <Text style={styles.message}>{message}</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transparentOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: responsiveSpacing(16),
    padding: responsiveSpacing(32),
    alignItems: 'center',
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    marginTop: responsiveSpacing(16),
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    textAlign: 'center',
  },
});

export default LoadingOverlay;
