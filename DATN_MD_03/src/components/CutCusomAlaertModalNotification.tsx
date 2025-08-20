import React, {useEffect} from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
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
import {Icons} from '../assets/icons';

interface CustomAlertModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  type?: 'error' | 'success' | 'warning' | 'info';
  isRead?: boolean;
  buttons?: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive' | 'primary';
  }>;
}

const CustomAlertModalNotification: React.FC<CustomAlertModalProps> = ({
  visible,
  title = 'Thông báo',
  message,
  onClose,
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

  // Lấy icon theo loại thông báo
  const getTypeIcon = () => {
    if (title.toLowerCase().includes('hợp đồng')) {
      return Icons.IconHopDong;
    }
    if (title.toLowerCase().includes('hệ thống')) {
      return Icons.IconHeThong;
    }
    if (title.toLowerCase().includes('thanh toán')) {
      return Icons.IconThanhToan;
    }
    if (title.toLowerCase().includes('hỗ trợ')) {
      return Icons.IconHoTro;
    }
    return Icons.IconNotification;
  };

  // Lấy màu theo loại thông báo
  const getTypeColor = () => {
    if (title.toLowerCase().includes('hợp đồng')) {
      return '#059669';
    }
    if (title.toLowerCase().includes('hệ thống')) {
      return '#2563EB';
    }
    if (title.toLowerCase().includes('thanh toán')) {
      return '#EA580C';
    }
    if (title.toLowerCase().includes('hỗ trợ')) {
      return '#9333EA';
    }
    return Colors.gray;
  };

  const typeColor = getTypeColor();

  // Parse message để hiển thị với icon thực sự
  const parseMessageWithIcons = (rawMessage: string) => {
    const lines = rawMessage.split('\n');
    return lines.map((line, index) => {
      // Bỏ qua dòng CCCD/CMND hoặc các emoji định danh nếu có
      const lower = line.toLowerCase();
      if (
        lower.includes('cccd') ||
        lower.includes('cmnd') ||
        line.includes('🆔') ||
        line.includes('🪪')
      ) {
        return null;
      }

      // Xử lý thông báo thanh toán
      if (line.includes('đã đánh dấu thanh toán') || line.includes('thanh toán hóa đơn')) {
        const parts = line.split('đã đánh dấu thanh toán');
        if (parts.length > 1) {
          const details = parts[1].trim();
          // Tìm số tiền để highlight
          const amountMatch = details.match(/(\d{1,3}(?:\.\d{3})*(?:\.\d{3})*)\s*VND/);

          return (
            <View key={index} style={styles.paymentContainer}>
              <Text style={styles.paymentText}>
                <Text style={styles.paymentName}>{parts[0].trim()}</Text>
                <Text style={styles.paymentAction}> đã đánh dấu thanh toán</Text>
                <Text style={styles.paymentDetails}>
                  {amountMatch ?
                    details.replace(amountMatch[0], '') + ' ' :
                    details
                  }
                  {amountMatch && (
                    <Text style={styles.paymentAmount}>{amountMatch[0]}</Text>
                  )}
                </Text>
              </Text>
            </View>
          );
        }
      }

      // Xử lý thông báo hợp đồng với thông tin chi tiết
      if (line.includes('📞') || line.includes('📱')) {
        return (
          <View key={index} style={styles.infoRow}>
            <Image
              source={{uri: Icons.IconPhone}}
              style={[styles.infoIcon, {tintColor: typeColor}]}
              resizeMode="contain"
            />
            <Text style={styles.infoText}>{line.replace(/[📞📱]/g, '').trim()}</Text>
          </View>
        );
      }
      // if (line.includes('🆔') || line.includes('🪪')) {
      //   return (
      //     <View key={index} style={styles.infoRow}>
      //       <Image
      //         source={{uri: Icons.IconCCCD}}
      //         style={[styles.infoIcon, {tintColor: typeColor}]}
      //         resizeMode="contain"
      //       />
      //       <Text style={styles.infoText}>{line.replace(/[🆔🪪]/g, '').trim()}</Text>
      //     </View>
      //   );
      // }
      if (line.includes('💬') || line.includes('💭')) {
        return (
          <View key={index} style={styles.infoRow}>
            <Image
              source={{uri: Icons.IconNotification}}
              style={[styles.infoIcon, {tintColor: typeColor}]}
              resizeMode="contain"
            />
            <Text style={styles.infoText}>{line.replace(/[💬💭]/g, '').trim()}</Text>
          </View>
        );
      }

      // Xử lý dòng thông thường
      if (line.trim()) {
        return <Text key={index} style={styles.message}>{line}</Text>;
      }
      return null;
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
                {/* Header với icon */}
                <View style={styles.header}>
                  <View style={[styles.iconContainer, {backgroundColor: typeColor + '20'}]}>
                    <Image
                      source={{uri: getTypeIcon()}}
                      style={[styles.icon, {tintColor: typeColor}]}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.title}>{title}</Text>
                </View>

                {/* Nội dung gọn gàng */}
                <View style={styles.messageContainer}>
                  {parseMessageWithIcons(message)}
                </View>

                {/* Buttons */}
                {buttons && buttons.length > 0 && (
                  <View style={styles.buttonContainer}>
                    {buttons.map((btn, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.button,
                          btn.style === 'default' && {backgroundColor: typeColor},
                        ]}
                        onPress={btn.onPress}
                        activeOpacity={0.8}>
                        <Text
                          style={[
                            styles.buttonText,
                            btn.style === 'cancel' && styles.cancelText,
                            btn.style === 'default' && styles.confirmText,
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
    width: '95%',
    maxWidth: 480,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  content: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing(12),
  },
  iconContainer: {
    width: responsiveSpacing(40),
    height: responsiveSpacing(40),
    borderRadius: responsiveSpacing(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: responsiveSpacing(12),
  },
  icon: {
    width: responsiveSpacing(24),
    height: responsiveSpacing(24),
  },
  title: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    textAlign: 'left',
  },
  message: {
    fontSize: responsiveFont(15),
    fontFamily: Fonts.Roboto_Regular, // Đổi về Regular
    color: Colors.darkGray,
    textAlign: 'left',
    lineHeight: responsiveFont(22),
    marginBottom: responsiveSpacing(20),
    letterSpacing: 0.5, // Tăng letter spacing để đẹp hơn
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: responsiveSpacing(12),
    justifyContent: 'flex-end',
    marginTop: responsiveSpacing(16),
  },
  button: {
    paddingVertical: responsiveSpacing(10),
    paddingHorizontal: responsiveSpacing(16),
    borderRadius: responsiveSpacing(8),
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: responsiveSpacing(80),
  },
  buttonText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
  },
  cancelText: {
    color: Colors.black,
  },
  confirmText: {
    color: Colors.white,
  },
  destructiveText: {
    color: Colors.red,
    fontSize: responsiveFont(15),
    fontFamily: Fonts.Roboto_Bold,
  },
  primaryText: {
    color: Colors.limeGreen,
    fontSize: responsiveFont(15),
    fontFamily: Fonts.Roboto_Bold,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing(8),
  },
  infoIcon: {
    width: responsiveSpacing(20),
    height: responsiveSpacing(20),
    marginRight: responsiveSpacing(10),
  },
  infoText: {
    fontSize: responsiveFont(15),
    fontFamily: Fonts.Roboto_Regular, // Đổi về Regular
    color: Colors.darkGray,
    flexShrink: 1,
    letterSpacing: 0.5, // Tăng letter spacing
  },
  messageContainer: {
    marginBottom: responsiveSpacing(20),
  },
  paymentContainer: {
    marginBottom: responsiveSpacing(8),
  },
  paymentText: {
    fontSize: responsiveFont(15),
    lineHeight: responsiveFont(22),
    fontFamily: Fonts.Roboto_Regular, // Đổi về Regular
    letterSpacing: 0.5, // Tăng letter spacing
  },
  paymentName: {
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  paymentAction: {
    fontFamily: Fonts.Roboto_Regular, // Đổi về Regular
    color: Colors.darkGray,
  },
  paymentDetails: {
    fontFamily: Fonts.Roboto_Regular, // Đổi về Regular
    color: Colors.darkGray,
  },
  paymentAmount: {
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGreen,
  },
});

export default CustomAlertModalNotification;
