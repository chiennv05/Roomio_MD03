import React, {useEffect} from 'react';
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
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {Colors} from '../theme/color';
import {Fonts} from '../theme/fonts';
import {responsiveSpacing, responsiveFont, SCREEN} from '../utils/responsive';

interface CustomAlertModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  type?: 'error' | 'success' | 'warning' | 'info';
  timestamp?: string;
  icon?: string;
  showIcon?: boolean;
  buttons?: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive' | 'primary';
  }>;
  customStyles?: {
    modal?: object;
    title?: object;
    message?: object;
    button?: object;
  };
}

const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
  visible,
  title = 'Thông báo',
  message,
  onClose,
  type = 'info',
  timestamp,
  icon,
  showIcon = false,
  buttons,
  customStyles,
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);
  const translateY = useSharedValue(50);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, {duration: 300});
      scale.value = withSpring(1);
      translateY.value = withSpring(0);
    } else {
      opacity.value = withTiming(0, {duration: 200});
      scale.value = withTiming(0.3, {duration: 200});
      translateY.value = withTiming(50, {duration: 200});
    }
  }, [opacity, scale, translateY, visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}, {translateY: translateY.value}],
    opacity: opacity.value,
  }));

  const handleClose = () => {
    opacity.value = withTiming(0, {duration: 200});
    scale.value = withTiming(0.3, {duration: 200});
    translateY.value = withTiming(50, {duration: 200}, () => {
      runOnJS(onClose)();
    });
  };

  // Get icon and color based on type
  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {icon: '✅', color: '#4CAF50', bgColor: '#E8F5E8'};
      case 'error':
        return {icon: '❌', color: '#F44336', bgColor: '#FFEBEE'};
      case 'warning':
        return {icon: '⚠️', color: '#FF9800', bgColor: '#FFF3E0'};
      case 'info':
      default:
        return {icon: 'ℹ️', color: '#2196F3', bgColor: '#E3F2FD'};
    }
  };

  const typeConfig = getTypeConfig();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.backdropTouchable}
          onPress={handleClose}>
          <Animated.View style={[styles.modal, modalStyle]}>
            <TouchableOpacity activeOpacity={1}>
              <View style={[styles.content, customStyles?.modal]}>
                {/* Icon hiển thị nếu showIcon = true hoặc có icon custom */}
                {(showIcon || icon) && (
                  <View
                    style={[
                      styles.iconContainer,
                      {backgroundColor: typeConfig.bgColor},
                    ]}>
                    <Text style={[styles.iconText, {color: typeConfig.color}]}>
                      {icon || typeConfig.icon}
                    </Text>
                  </View>
                )}

                <Text style={[styles.title, customStyles?.title]}>{title}</Text>
                <Text style={[styles.message, customStyles?.message]}>
                  {message}
                </Text>

                {/* Timestamp hiển thị nếu có */}
                {timestamp && <Text style={styles.timestamp}>{timestamp}</Text>}

                {buttons && buttons.length > 0 && (
                  <View style={styles.buttonContainer}>
                    {buttons.map((btn, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.button,
                          btn.style === 'default' && styles.primaryButton,
                          btn.style === 'primary' && styles.primaryButton,
                          btn.style === 'cancel' && styles.secondaryButton,
                          btn.style === 'destructive' &&
                            styles.destructiveButton,
                          customStyles?.button,
                        ]}
                        onPress={btn.onPress}
                        activeOpacity={0.8}>
                        <Text
                          style={[
                            styles.buttonText,
                            btn.style === 'cancel' && styles.cancelText,
                            btn.style === 'default' && styles.confirmText,
                            btn.style === 'primary' && styles.confirmText,
                            btn.style === 'destructive' &&
                              styles.destructiveText,
                          ]}>
                          {btn.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
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
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backdropTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(20),
    paddingVertical: responsiveSpacing(24),
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: responsiveSpacing(12),
    paddingHorizontal: responsiveSpacing(20),
    paddingVertical: responsiveSpacing(20),
    width: '85%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    width: '100%',
    alignItems: 'center',
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
    textAlign: 'center',
  },
  title: {
    fontSize: responsiveFont(17),
    fontFamily: Fonts.Roboto_Bold,
    color: '#333333',
    marginBottom: responsiveSpacing(12),
    textAlign: 'center',
    lineHeight: responsiveFont(22),
  },
  message: {
    fontSize: responsiveFont(15),
    fontFamily: Fonts.Roboto_Regular,
    color: '#666666',
    textAlign: 'center',
    lineHeight: responsiveFont(20),
    marginBottom: responsiveSpacing(8),
  },
  timestamp: {
    fontSize: responsiveFont(13),
    fontFamily: Fonts.Roboto_Regular,
    color: '#999999',
    textAlign: 'center',
    marginBottom: responsiveSpacing(20),
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: responsiveSpacing(12),
    justifyContent: 'space-between',
    marginTop: responsiveSpacing(8),
  },
  button: {
    flex: 1,
    paddingVertical: responsiveSpacing(12),
    paddingHorizontal: responsiveSpacing(16),
    borderRadius: responsiveSpacing(8),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: responsiveSpacing(44),
  },
  primaryButton: {
    backgroundColor: '#FFA500', // Orange color
  },
  secondaryButton: {
    backgroundColor: '#F5F5F5', // Light gray
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  destructiveButton: {
    backgroundColor: '#FF4444',
  },
  buttonText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Medium,
    textAlign: 'center',
  },
  cancelText: {
    color: '#666666',
  },
  confirmText: {
    color: '#FFFFFF',
    fontFamily: Fonts.Roboto_Bold,
  },
  destructiveText: {
    color: '#FFFFFF',
    fontFamily: Fonts.Roboto_Bold,
  },
});

export default CustomAlertModal;
