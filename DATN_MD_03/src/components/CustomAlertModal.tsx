import React, {useEffect} from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {Colors} from '../theme/color';
import {Fonts} from '../theme/fonts';
import {responsiveSpacing, responsiveFont} from '../utils/responsive';

interface CustomAlertModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  type?: 'error' | 'success' | 'warning' | 'info';
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
  buttons,
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
              <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.message}>{message}</Text>
                {buttons && buttons.length > 0 && (
                  <View style={styles.buttonContainer}>
                    {buttons.map((btn, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.button]}
                        onPress={btn.onPress}
                        activeOpacity={0.8}>
                        <Text
                          style={[
                            btn.style === 'cancel' && styles.cancelText,
                            btn.style === 'default' && styles.confirmText,
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
    borderRadius: responsiveSpacing(16),
    paddingHorizontal: responsiveSpacing(20),
    paddingVertical: responsiveSpacing(24),
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  content: {
    width: '100%',
  },
  title: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(8),
    textAlign: 'left',
  },
  message: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.darkGray,
    textAlign: 'left',
    lineHeight: responsiveFont(22),
    marginBottom: responsiveSpacing(20),
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: responsiveSpacing(16),
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: responsiveSpacing(8),
    borderRadius: responsiveSpacing(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: Colors.black,
    fontSize: responsiveFont(15),
    fontFamily: Fonts.Roboto_Bold,
  },
  confirmText: {
    color: Colors.darkGreen,
    fontSize: responsiveFont(15),
    fontFamily: Fonts.Roboto_Bold,
  },
  destructiveText: {
    color: Colors.red, // hoặc 'red' nếu bạn chưa định nghĩa Colors.error
    fontSize: responsiveFont(15),
    fontFamily: Fonts.Roboto_Bold,
  },
});

export default CustomAlertModal;
