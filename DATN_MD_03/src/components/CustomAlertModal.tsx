import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Colors } from '../theme/color';
import { Fonts } from '../theme/fonts';
import { responsiveSpacing, responsiveFont } from '../utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CustomAlertModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  type?: 'error' | 'success' | 'warning' | 'info';
  buttonText?: string;
  buttons?: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
  visible,
  title = 'Thông báo',
  message,
  onClose,
  type = 'info',
  buttonText = 'OK',
  buttons,
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);
  const translateY = useSharedValue(50);

  useEffect(() => {
    if (visible) {
      // Show animation
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 200,
      });
    } else {
      // Hide animation
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.3, { duration: 200 });
      translateY.value = withTiming(50, { duration: 200 });
    }
  }, [visible, opacity, scale, translateY]);

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const modalStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
      opacity: opacity.value,
    };
  });

  const handleClose = () => {
    // Start close animation
    opacity.value = withTiming(0, { duration: 200 });
    scale.value = withTiming(0.3, { duration: 200 });
    translateY.value = withTiming(50, { duration: 200 }, () => {
      runOnJS(onClose)();
    });
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return {
          iconColor: '#FF4757',
          borderColor: '#FF4757',
          icon: '⚠️',
        };
      case 'success':
        return {
          iconColor: '#2ED573',
          borderColor: '#2ED573',
          icon: '✅',
        };
      case 'warning':
        return {
          iconColor: '#FFA502',
          borderColor: '#FFA502',
          icon: '⚠️',
        };
      default:
        return {
          iconColor: '#3742FA',
          borderColor: '#3742FA',
          icon: 'ℹ️',
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View style={[styles.modal, modalStyle]}>
            <TouchableOpacity activeOpacity={1}>
              {/* Header with icon */}
              <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: typeStyles.iconColor + '20' }]}>
                  <Text style={styles.iconText}>{typeStyles.icon}</Text>
                </View>
                <Text style={styles.title}>{title}</Text>
              </View>

              {/* Message */}
              <View style={styles.messageContainer}>
                <Text style={styles.message}>{message}</Text>
              </View>

              {/* Buttons */}
              <View style={[
                styles.buttonContainer,
                buttons && buttons.length === 2 && styles.buttonContainerRow,
              ]}>
                {(buttons && buttons.length > 0
                  ? buttons
                  : [{ text: buttonText, onPress: handleClose }]
                ).map((btn, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.button,
                      buttons && buttons.length === 2 && styles.buttonHalf,
                      btn.style === 'cancel' && { backgroundColor: '#FFA502' },
                      btn.style === 'destructive' && { backgroundColor: '#FF4757' },
                      btn.style === 'default' && { backgroundColor: typeStyles.iconColor },
                      !btn.style && { backgroundColor: typeStyles.iconColor },
                      buttons && buttons.length !== 2 && { marginTop: idx > 0 ? 10 : 0 },
                    ]}
                    onPress={btn.onPress}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buttonText}>{btn.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: responsiveSpacing(16),
    marginHorizontal: responsiveSpacing(24),
    maxWidth: SCREEN_WIDTH - responsiveSpacing(48),
    minWidth: SCREEN_WIDTH - responsiveSpacing(48),
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    paddingTop: responsiveSpacing(24),
    paddingHorizontal: responsiveSpacing(20),
  },
  iconContainer: {
    width: responsiveSpacing(60),
    height: responsiveSpacing(60),
    borderRadius: responsiveSpacing(30),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveSpacing(16),
  },
  iconText: {
    fontSize: responsiveFont(24),
  },
  title: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    textAlign: 'center',
  },
  messageContainer: {
    paddingHorizontal: responsiveSpacing(20),
    paddingVertical: responsiveSpacing(16),
  },
  message: {
    fontSize: responsiveFont(15),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.darkGray,
    textAlign: 'center',
    lineHeight: responsiveFont(22),
  },
  buttonContainer: {
    paddingHorizontal: responsiveSpacing(20),
    paddingBottom: responsiveSpacing(24),
    paddingTop: responsiveSpacing(8),
  },
  buttonContainerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: responsiveSpacing(14),
    borderRadius: responsiveSpacing(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonHalf: {
    width: '48%',
    marginTop: 0,
  },
  buttonText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
  },
});

export default CustomAlertModal;
