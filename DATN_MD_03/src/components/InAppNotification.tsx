import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import {Colors} from '../theme/color';
import {Fonts} from '../theme/fonts';
import {responsiveFont, responsiveSpacing, scale} from '../utils/responsive';
import {NotificationType} from '../types/Notification';

const {width: screenWidth} = Dimensions.get('window');

interface InAppNotificationProps {
  visible: boolean;
  title: string;
  message: string;
  type: NotificationType;
  onPress?: () => void;
  onDismiss?: () => void;
  autoHide?: boolean;
  duration?: number;
}

const InAppNotification: React.FC<InAppNotificationProps> = ({
  visible,
  title,
  message,
  type,
  onPress,
  onDismiss,
  autoHide = true,
  duration = 4000,
}) => {
  const [isVisible, setIsVisible] = useState(visible);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      showNotification();
      
      if (autoHide) {
        const timer = setTimeout(() => {
          hideNotification();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      hideNotification();
    }
  }, [visible, autoHide, duration]);

  const showNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      if (onDismiss) {
        onDismiss();
      }
    });
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
    hideNotification();
  };

  const getNotificationIcon = () => {
    switch (type) {
      case 'hopDong':
        return require('../assets/icons/icon_ban_ghe.png');
      case 'thanhToan':
        return require('../assets/icons/icon_area_black.png');
      case 'lichXemPhong':
        return require('../assets/icons/icon_calendar.png');
      case 'hoTro':
        return require('../assets/icons/icon_support.png');
      default:
        return require('../assets/icons/icon_notification.png');
    }
  };

  const getNotificationColor = () => {
    switch (type) {
      case 'hopDong':
        return Colors.primaryGreen;
      case 'thanhToan':
        return Colors.darkGreen;
      case 'lichXemPhong':
        return Colors.limeGreen;
      case 'hoTro':
        return Colors.warning;
      default:
        return Colors.info;
    }
  };

  const getTypeDisplayName = () => {
    switch (type) {
      case 'hopDong':
        return 'Hợp đồng';
      case 'thanhToan':
        return 'Thanh toán';
      case 'lichXemPhong':
        return 'Lịch xem phòng';
      case 'hoTro':
        return 'Hỗ trợ';
      case 'heThong':
        return 'Hệ thống';
      default:
        return 'Thông báo';
    }
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{translateY: slideAnim}],
          opacity: opacityAnim,
        },
      ]}>
      <TouchableOpacity
        style={styles.notificationCard}
        onPress={handlePress}
        activeOpacity={0.9}>
        
        {/* Icon */}
        <View style={[styles.iconContainer, {backgroundColor: getNotificationColor()}]}>
          <Image
            source={getNotificationIcon()}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.typeText}>{getTypeDisplayName()}</Text>
            <Text style={styles.timeText}>Vừa xong</Text>
          </View>
          
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        </View>

        {/* Close button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={hideNotification}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Image
            source={require('../assets/icons/icon_close.png')}
            style={styles.closeIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: responsiveSpacing(16),
    right: responsiveSpacing(16),
    zIndex: 9999,
    elevation: 999,
  },
  notificationCard: {
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    padding: responsiveSpacing(16),
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryGreen,
  },
  iconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: responsiveSpacing(12),
  },
  icon: {
    width: scale(20),
    height: scale(20),
    tintColor: Colors.white,
  },
  content: {
    flex: 1,
    marginRight: responsiveSpacing(8),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveSpacing(4),
  },
  typeText: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.primaryGreen,
    textTransform: 'uppercase',
  },
  timeText: {
    fontSize: responsiveFont(10),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.mediumGray,
  },
  title: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
    marginBottom: responsiveSpacing(2),
  },
  message: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    lineHeight: responsiveFont(16),
  },
  closeButton: {
    padding: responsiveSpacing(4),
  },
  closeIcon: {
    width: scale(12),
    height: scale(12),
    tintColor: Colors.mediumGray,
  },
});

export default InAppNotification;
