import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  Animated,
  I18nManager,
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
}

const NotificationItemCard: React.FC<NotificationItemCardProps> = ({
  title,
  content,
  time,
  date,
  isRead,
  type,
  icon,
  onPress,
  onDelete,
  id,
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

  // Icon dựa trên trạng thái đọc/chưa đọc
  const getStatusIcon = () => {
    if (isRead) {
      return Icons.IconTick; // Tick icon cho đã đọc
    } else {
      return Icons.IconWarning; // Warning icon cho chưa đọc
    }
  };

  const getImageSource = () => {
    const iconSource = getStatusIcon();
    if (!iconSource) {
      return undefined;
    }
    if (typeof iconSource === 'string') {
      return {uri: iconSource};
    }
    return iconSource;
  };

  // Màu icon và background dựa trên loại thông báo
  const getStatusColor = () => {
    // Định nghĩa màu sắc cho từng loại thông báo với độ tương phản cao
    const notificationColors = {
      // Thông báo hỗ trợ - màu xanh lá tươi với gradient
      support: {
        background: isRead
          ? Colors.lightGreenBackground
          : Colors.limeGreenOpacityLight,
        gradient: ['#4CAF50', '#66BB6A'],
        iconBg: '#4CAF50',
        border: '#388E3C',
        textColor: '#1B5E20',
        shadowColor: '#4CAF50',
      },
      // Thông báo hợp đồng - màu xanh dương với gradient
      contract: {
        background: isRead ? '#E3F2FD' : '#90CAF9',
        gradient: [Colors.info, '#42A5F5'],
        iconBg: Colors.info,
        border: '#1976D2',
        textColor: '#0D47A1',
        shadowColor: '#2196F3',
      },
      // Thông báo hệ thống - màu tím với gradient
      system: {
        background: isRead ? '#F3E5F5' : '#CE93D8',
        gradient: ['#9C27B0', '#BA68C8'],
        iconBg: '#9C27B0',
        border: '#7B1FA2',
        textColor: '#4A148C',
        shadowColor: '#9C27B0',
      },
      // Thông báo thanh toán - màu cam với gradient
      payment: {
        background: isRead ? '#FFF3E0' : '#FFCC80',
        gradient: ['#FF9800', '#FFB74D'],
        iconBg: '#FF9800',
        border: '#F57C00',
        textColor: '#E65100',
        shadowColor: '#FF9800',
      },
      // Lịch xem phòng - màu xanh mint với gradient
      schedule: {
        background: isRead ? '#E0F2F1' : '#80CBC4',
        gradient: ['#26A69A', '#4DB6AC'],
        iconBg: '#26A69A',
        border: '#00695C',
        textColor: '#004D40',
        shadowColor: '#26A69A',
      },
      // Thông báo mặc định - màu xám với gradient
      default: {
        background: isRead ? '#F5F5F5' : '#E0E0E0',
        gradient: ['#757575', '#9E9E9E'],
        iconBg: '#757575',
        border: '#424242',
        textColor: '#212121',
        shadowColor: '#757575',
      },
    };

    // Xác định loại thông báo dựa trên type từ API
    let colorScheme = notificationColors.default;

    switch (type) {
      case 'hoTro':
        colorScheme = notificationColors.support;
        break;
      case 'hopDong':
        colorScheme = notificationColors.contract;
        break;
      case 'heThong':
        colorScheme = notificationColors.system;
        break;
      case 'thanhToan':
        colorScheme = notificationColors.payment;
        break;
      case 'lichXemPhong':
        colorScheme = notificationColors.schedule;
        break;
      default:
        // Fallback: kiểm tra title nếu type không khớp
        if (title.toLowerCase().includes('hỗ trợ')) {
          colorScheme = notificationColors.support;
        } else if (title.toLowerCase().includes('hợp đồng')) {
          colorScheme = notificationColors.contract;
        } else if (title.toLowerCase().includes('hệ thống')) {
          colorScheme = notificationColors.system;
        } else if (
          title.toLowerCase().includes('thanh toán') ||
          title.toLowerCase().includes('hóa đơn')
        ) {
          colorScheme = notificationColors.payment;
        }
        break;
    }

    return {
      cardBg: colorScheme.background,
      gradient: colorScheme.gradient,
      iconBg: colorScheme.iconBg,
      borderColor: colorScheme.border,
      textColor: colorScheme.textColor,
      shadowColor: colorScheme.shadowColor,
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
              backgroundColor: statusColors.cardBg,
              borderLeftWidth: 6,
              borderLeftColor: statusColors.borderColor,
              shadowColor: statusColors.shadowColor,
              shadowOffset: {
                width: 0,
                height: isRead ? 2 : 4,
              },
              shadowOpacity: isRead ? 0.1 : 0.2,
              shadowRadius: isRead ? 4 : 8,
              elevation: isRead ? 3 : 6,
            },
          ]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}>
          {/* Gradient overlay for unread notifications */}
          {!isRead && (
            <LinearGradient
              colors={[
                statusColors.gradient[0] + '10',
                statusColors.gradient[1] + '05',
              ]}
              style={styles.gradientOverlay}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            />
          )}

          {/* Icon trạng thái với gradient background */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={statusColors.gradient}
              style={styles.iconGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}>
              <Image
                source={getImageSource()}
                style={[
                  styles.iconImage,
                  {
                    tintColor: Colors.white,
                  },
                ]}
                resizeMode="contain"
              />
            </LinearGradient>
          </View>

          {/* Nội dung */}
          <View style={styles.contentContainer}>
            <Text
              style={[
                styles.title,
                {
                  color: statusColors.textColor,
                  fontWeight: isRead ? 'normal' : 'bold', // Bold nếu chưa đọc
                },
              ]}
              numberOfLines={1}>
              {title}
            </Text>

            <Text
              style={[
                styles.content,
                {
                  color: statusColors.textColor,
                  opacity: isRead ? 0.7 : 0.9, // Mờ hơn nếu đã đọc
                },
              ]}
              numberOfLines={2}>
              {content}
            </Text>

            <Text
              style={[
                styles.time,
                {
                  color: statusColors.textColor,
                  opacity: 0.6,
                },
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
    borderRadius: responsiveSpacing(16),
    marginBottom: responsiveSpacing(12),
    marginHorizontal: responsiveSpacing(4),
    minHeight: moderateScale(110),
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
    fontFamily: Fonts.Roboto_Medium,
    marginBottom: responsiveSpacing(4),
    // Màu sẽ được override bởi inline style
  },
  content: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    lineHeight: responsiveFont(18),
    marginBottom: responsiveSpacing(6),
    // Màu sẽ được override bởi inline style
  },
  time: {
    fontSize: responsiveFont(11),
    fontFamily: Fonts.Roboto_Regular,
    // Màu sẽ được override bởi inline style
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
