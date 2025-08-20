import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  Animated,
} from 'react-native';
import {Swipeable} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {
  responsiveFont,
  responsiveSpacing,
  moderateScale,
} from '../../../utils/responsive';
import {Icons} from '../../../assets/icons';

interface NotificationItemCardProps {
  title: string;
  content: string;
  time: string;
  date: string; // Ngày hiển thị (VD: "24/06/2025")
  isRead: boolean;
  type: string;
  icon?: ImageSourcePropType | any; // Icon để hiển thị
  onPress?: () => void;
  onDelete?: () => void; // Callback khi nhấn nút xóa
  id: string; // ID của thông báo
  isUnread?: boolean; // Thêm prop để biết có phải chưa đọc không
}

const NotificationItemCard: React.FC<NotificationItemCardProps> = ({
  title,
  content,
  time,
  date: _date,
  isRead,
  type,
  icon: _icon,
  onPress,
  onDelete,
  id: _id,
  isUnread = false,
}) => {
  // Tham chiếu đến Swipeable để có thể đóng sau khi xóa
  const swipeableRef = React.useRef<Swipeable>(null);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Entrance animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Press animation
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  // Icon dựa trên loại thông báo thay vì trạng thái đọc/chưa đọc
  const getTypeIcon = () => {
    switch (type) {
      case 'heThong':
        return Icons.IconHeThong;
      case 'hopDong':
        return Icons.IconHopDong;
      case 'thanhToan':
        return Icons.IconThanhToan;
      case 'hoTro':
        return Icons.IconHoTro;
      default:
        return Icons.IconPaper; // Icon mặc định
    }
  };

  const getImageSource = () => {
    const iconSource = getTypeIcon();
    if (!iconSource) {
      return undefined;
    }
    if (typeof iconSource === 'string') {
      return {uri: iconSource};
    }
    return iconSource;
  };

  // Màu sắc toned-down theo loại, ưu tiên nền trắng + viền chỉ báo màu
  const getStatusColor = () => {
    const neutralText = Colors.black;
    const mutedText = Colors.textGray;

    const map = {
      support: {
        background: Colors.white,
        iconTint: '#9333EA', // Màu tím của filter Hỗ Trợ
        border: '#9333EA', // Màu tím của filter Hỗ Trợ
        titleColor: neutralText,
        contentColor: mutedText,
        shadowColor: Colors.shadowDefault,
      },
      contract: {
        background: Colors.white,
        iconTint: '#059669', // Màu xanh lá của filter Hợp Đồng
        border: '#059669', // Màu xanh lá của filter Hợp Đồng
        titleColor: neutralText,
        contentColor: mutedText,
        shadowColor: Colors.shadowDefault,
      },
      system: {
        background: Colors.white,
        iconTint: '#2563EB', // Màu xanh dương của filter Hệ Thống
        border: '#2563EB', // Màu xanh dương của filter Hệ Thống
        titleColor: neutralText,
        contentColor: mutedText,
        shadowColor: Colors.shadowDefault,
      },
      payment: {
        background: Colors.white,
        iconTint: '#EA580C', // Màu cam của filter Thanh Toán
        border: '#EA580C', // Màu cam của filter Thanh Toán
        titleColor: neutralText,
        contentColor: mutedText,
        shadowColor: Colors.shadowDefault,
      },
      schedule: {
        background: Colors.white,
        iconTint: Colors.accentSchedule,
        border: Colors.accentSchedule,
        titleColor: neutralText,
        contentColor: mutedText,
        shadowColor: Colors.shadowDefault,
      },
      default: {
        background: Colors.white,
        iconTint: Colors.gray150,
        border: Colors.gray200,
        titleColor: neutralText,
        contentColor: mutedText,
        shadowColor: Colors.shadowDefault,
      },
    } as const;

    let scheme = map.default;
    switch (type) {
      case 'hoTro':
        scheme = map.support;
        break;
      case 'hopDong':
        scheme = map.contract;
        break;
      case 'heThong':
        scheme = map.system;
        break;
      case 'thanhToan':
        scheme = map.payment;
        break;
      case 'lichXemPhong':
        scheme = map.schedule;
        break;
      default:
        if (title.toLowerCase().includes('hỗ trợ')) scheme = map.support;
        else if (title.toLowerCase().includes('hợp đồng'))
          scheme = map.contract;
        else if (title.toLowerCase().includes('hệ thống')) scheme = map.system;
        else if (
          title.toLowerCase().includes('thanh toán') ||
          title.toLowerCase().includes('hóa đơn')
        )
          scheme = map.payment;
        break;
    }

    return {
      cardBg: scheme.background,
      iconTint: scheme.iconTint,
      borderColor: scheme.border,
      titleColor: scheme.titleColor,
      contentColor: scheme.contentColor,
      shadowColor: scheme.shadowColor,
    };
  };

  const statusColors = getStatusColor();

  // Render nút xóa bên phải khi kéo
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-100, -50, 0],
      outputRange: [0, 25, 100],
      extrapolate: 'clamp',
    });

    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
    });

    const opacity = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.8, 1],
    });

    return (
      <View style={styles.rightActionContainer}>
        <Animated.View
          style={[
            styles.deleteButton,
            {
              transform: [{translateX: trans}, {scale}],
              opacity,
            },
          ]}>
          <TouchableOpacity
            onPress={() => {
              if (onDelete) {
                onDelete();
                if (swipeableRef.current) {
                  swipeableRef.current.close();
                }
              }
            }}
            style={styles.deleteButtonInner}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#ff4757', '#ff3742']}
              style={styles.deleteGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}>
              <Image
                source={{uri: Icons.IconDelete}}
                style={styles.deleteIcon}
                resizeMode="contain"
              />
              <Text style={styles.deleteText}>Xóa</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{scale: scaleAnim}],
        },
      ]}>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        friction={2}
        rightThreshold={40}
        overshootRight={false}>
        <TouchableOpacity
          style={[
            styles.container,
            {
              backgroundColor: isUnread ? '#E3F2FD' : statusColors.cardBg, // Background xanh nhạt cho chưa đọc
              borderLeftWidth: 4,
              borderLeftColor: statusColors.borderColor,
              borderTopWidth: 0.2, // Thêm viền trên
              borderTopColor: statusColors.borderColor, // Cùng màu với viền trái
              borderBottomWidth: 0.2, // Thêm viền dưới
              borderBottomColor: statusColors.borderColor, // Cùng màu với viền trái
              borderRightWidth: 0.2, // Thêm viền phải
              borderRightColor: statusColors.borderColor, // Cùng màu với viền trái
              shadowColor: statusColors.shadowColor,
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.06,
              shadowRadius: 3,
              elevation: 2,
            },
          ]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}>
          {/* Subtle overlay for unread notifications */}
          {!isRead && (
            <View
              style={[
                styles.gradientOverlay,
                {backgroundColor: 'rgba(0,0,0,0.02)'},
              ]}
            />
          )}

          {/* Icon trạng thái với nền tròn màu (không gradient) */}
          <View style={styles.iconContainer}>
            <View
              style={[
                styles.iconGradient,
                {
                  backgroundColor: Colors.white,
                  borderColor: statusColors.borderColor,
                  borderWidth: 1,
                },
              ]}>
              <Image
                source={getImageSource()}
                style={[styles.iconImage, {tintColor: statusColors.iconTint}]}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Nội dung */}
          <View style={styles.contentContainer}>
            <Text
              style={[
                styles.title,
                {
                  color: statusColors.titleColor,
                  fontWeight: isRead ? 'normal' : 'bold',
                },
              ]}
              numberOfLines={1}>
              {title}
            </Text>

            <Text
              style={[
                styles.content,
                {color: Colors.textSecondary, opacity: isRead ? 0.8 : 1},
              ]}
              numberOfLines={2}>
              {content}
            </Text>

            <Text
              style={[
                styles.time,
                {color: statusColors.contentColor, opacity: 0.6},
              ]}>
              {time}
            </Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: responsiveSpacing(20),
    borderRadius: responsiveSpacing(14),
    marginBottom: responsiveSpacing(12),
    marginHorizontal: responsiveSpacing(4),
    minHeight: moderateScale(104),
    position: 'relative',
    overflow: 'hidden',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: responsiveSpacing(16),
  },
  iconContainer: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginRight: responsiveSpacing(16),
    shadowColor: Colors.shadowDefault,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  iconGradient: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: moderateScale(24),
    height: moderateScale(24),
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    marginBottom: responsiveSpacing(4),
    color: Colors.black,
    letterSpacing: 0.3, // Thêm letter spacing
  },
  content: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular, // Đổi về Regular
    lineHeight: responsiveFont(18),
    marginBottom: responsiveSpacing(6),
    color: Colors.textSecondary,
    letterSpacing: 0.5, // Thêm letter spacing đẹp
  },
  time: {
    fontSize: responsiveFont(11),
    fontFamily: Fonts.Roboto_Regular, // Đổi về Regular
    color: Colors.textGray,
    letterSpacing: 0.3, // Thêm letter spacing
  },
  rightActionContainer: {
    width: moderateScale(90),
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: responsiveSpacing(4),
  },
  deleteButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: responsiveSpacing(16),
    marginVertical: responsiveSpacing(6),
    shadowColor: '#ff4757',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  deleteButtonInner: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    borderRadius: responsiveSpacing(16),
  },
  deleteGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(8),
    paddingHorizontal: responsiveSpacing(12),
  },
  deleteIcon: {
    width: moderateScale(20),
    height: moderateScale(20),
    tintColor: Colors.white,
    marginBottom: responsiveSpacing(4),
  },
  deleteText: {
    color: Colors.white,
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Bold,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
});

export default NotificationItemCard;
