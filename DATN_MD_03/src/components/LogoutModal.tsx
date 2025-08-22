import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
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
import { Icons } from '../assets/icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LogoutModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const LogoutModal: React.FC<LogoutModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  loading = false,
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

  const handleCancel = () => {
    if (loading) {return;}

    // Start close animation
    opacity.value = withTiming(0, { duration: 200 });
    scale.value = withTiming(0.3, { duration: 200 });
    translateY.value = withTiming(50, { duration: 200 }, () => {
      runOnJS(onCancel)();
    });
  };

  const handleConfirm = () => {
    if (loading) {return;}
    onConfirm();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleCancel}
    >
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleCancel}
        >
          <Animated.View style={[styles.modal, modalStyle]}>
            <TouchableOpacity activeOpacity={1}>
              {/* Header with icon */}
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Image
                    source={{ uri: Icons.IconOut }}
                    style={styles.iconImage}
                  />
                </View>
                <Text style={styles.title}>Đăng xuất</Text>
              </View>

              {/* Message */}
              <View style={styles.messageContainer}>
                <Text style={styles.message}>
                  Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng không?
                </Text>
              </View>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancel}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>
                    Hủy
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.confirmButton,
                    loading && styles.disabledButton,
                  ]}
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  <Text style={[styles.buttonText, styles.confirmButtonText]}>
                    {loading ? 'Đang xử lý...' : 'Đăng xuất'}
                  </Text>
                </TouchableOpacity>
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
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveSpacing(16),
  },
  iconImage: {
    width: responsiveSpacing(28),
    height: responsiveSpacing(28),
    tintColor: '#FF4757',
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
    flexDirection: 'row',
    paddingHorizontal: responsiveSpacing(20),
    paddingBottom: responsiveSpacing(24),
    paddingTop: responsiveSpacing(8),
    gap: responsiveSpacing(12),
  },
  button: {
    flex: 1,
    paddingVertical: responsiveSpacing(14),
    borderRadius: responsiveSpacing(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.backgroud,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  confirmButton: {
    backgroundColor: '#FF4757',
  },
  disabledButton: {
    backgroundColor: '#FFB3B3',
  },
  buttonText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
  },
  cancelButtonText: {
    color: Colors.darkGray,
  },
  confirmButtonText: {
    color: Colors.white,
  },
});

export default LogoutModal;
