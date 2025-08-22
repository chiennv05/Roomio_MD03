import React, {useEffect, useMemo, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Animated,
  Easing,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import {RootState, AppDispatch} from '../../../store';
import { Icons } from '../../../assets/icons';
import {
  responsiveFont,
  responsiveIcon,
  responsiveSpacing,
} from '../../../utils/responsive';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';

interface HeaderProps {
  onNotificationPress?: () => void;
  onUserPress?: () => void;
  searchValue?: string;
  onChangeSearchText?: (text: string) => void;
  onSearchSubmit?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onNotificationPress,
  onUserPress,
  searchValue = '',
  onChangeSearchText,
  onSearchSubmit,
}) => {
  // Get user info from Redux store
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.notification);
  const avatar = user?.avatar;

  // Get display name and avatar
  const displayName = user?.username || 'Guest';
  const isGuest = !user;

  // Create avatar from first letter
  const getAvatarLetter = (name: string) => {
    if (name === 'Guest') {return 'G';}
    return name.charAt(0).toUpperCase();
  };

  const avatarLetter = getAvatarLetter(displayName);

  // Bell animation (wiggle) and badge pulse
  const bellAnim = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const previousUnreadRef = useRef<number>(unreadCount);
  const token = user?.auth_token;

  // Lazy import to avoid static circular dep at top-level
  // NOTE: using require inline inside effect to avoid hook dep warning

  // Fetch notifications to populate unread count when header mounts or user changes
  useEffect(() => {
    if (token) {
      const { fetchNotifications } = require('../../../store/slices/notificationSlice');
      dispatch(fetchNotifications({ token, page: 1, limit: 20 }));
    }
  }, [dispatch, token]);

  const triggerBellShake = useMemo(() => {
    return () => {
      bellAnim.setValue(0);
      Animated.sequence([
        Animated.timing(bellAnim, { toValue: 1, duration: 80, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(bellAnim, { toValue: -1, duration: 160, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(bellAnim, { toValue: 1, duration: 160, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(bellAnim, { toValue: 0, duration: 100, easing: Easing.linear, useNativeDriver: true }),
      ]).start();
    };
  }, [bellAnim]);

  const triggerBadgePulse = useMemo(() => {
    return () => {
      badgeScale.setValue(0);
      Animated.sequence([
        Animated.spring(badgeScale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
        Animated.timing(badgeScale, { toValue: 0.9, duration: 120, useNativeDriver: true }),
        Animated.spring(badgeScale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
      ]).start();
    };
  }, [badgeScale]);

  // Occasional shake every ~25s when there are unread notifications
  useEffect(() => {
    if (!unreadCount) {return;}
    const id = setInterval(() => {
      triggerBellShake();
    }, 25000);
    return () => clearInterval(id);
  }, [unreadCount, triggerBellShake]);

  // Animate on unread count increase (new notifications)
  useEffect(() => {
    const prev = previousUnreadRef.current;
    if (typeof prev === 'number' && unreadCount > prev) {
      triggerBellShake();
      triggerBadgePulse();
    }
    previousUnreadRef.current = unreadCount;
  }, [unreadCount, triggerBellShake, triggerBadgePulse]);

  const rotate = bellAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });
  const badgeTransform = { transform: [{ scale: badgeScale.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] } as any;
  const unreadDisplay = unreadCount > 99 ? '99+' : unreadCount?.toString();

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.userInfo}
            onPress={onUserPress}
            activeOpacity={0.7}
          >
            {avatar ? (
              <Image source={{uri: avatar}} style={styles.avatarContainer} />
            ) : (
              <LinearGradient
                colors={['#7B9EFF', '#9B7BFF']}
                style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{avatarLetter}</Text>
              </LinearGradient>
            )}
            <View style={styles.userText}>
              <Text style={styles.label}>
                {isGuest ? 'Chào mừng bạn' : 'Xin chào'}
              </Text>
              <Text style={styles.name}>{displayName}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={onNotificationPress}
            activeOpacity={0.8}
          >
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Image
                source={{ uri: Icons.IconNotification }}
                style={styles.notificationIcon}
              />
            </Animated.View>
            {!!unreadCount && unreadCount > 0 && (
              <Animated.View style={[styles.badgeContainer, badgeTransform]}>
                <Text style={styles.badgeText}>{unreadDisplay}</Text>
              </Animated.View>
            )}
          </TouchableOpacity>
        </View>
        {/* Thay thế searchRow bằng TextInput */}
        <View style={styles.searchRow}>
          <TextInput
            value={searchValue}
            onChangeText={onChangeSearchText}
            placeholder="Tìm kiếm trọ dễ dàng..."
            placeholderTextColor="#999"
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={onSearchSubmit}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={onSearchSubmit}
          >
            <Image
              source={{ uri: Icons.IconSearch }}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.backgroud,
    paddingHorizontal: responsiveSpacing(16),
    paddingTop: responsiveSpacing(12),
    paddingBottom: responsiveSpacing(16),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveSpacing(16),
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: responsiveIcon(45),
    flex: 0.6,
    backgroundColor: Colors.white,
    borderWidth: 0.6,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    // marginRight: responsiveSpacing(10),
    paddingVertical: responsiveSpacing(2),
    paddingHorizontal: responsiveSpacing(2),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  avatarContainer: {
    width: responsiveIcon(66),
    height: responsiveIcon(66),
    borderRadius: responsiveIcon(33),
    marginRight: responsiveSpacing(12),
    backgroundColor: Colors.limeGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
    fontWeight: 'bold',
  },
  userText: {
    flex: 1,
  },
  label: {
    color: Colors.darkGray,
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(12),
    marginBottom: responsiveSpacing(2),
  },
  name: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(17),
    color: Colors.black,
  },
  notificationButton: {
    width: responsiveIcon(50),
    height: responsiveIcon(50),
    borderRadius: responsiveIcon(25),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  notificationIcon: {
    width: responsiveIcon(25),
    height: responsiveIcon(25),
    tintColor: '#333',
  },
  badgeContainer: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: responsiveIcon(20),
    height: responsiveIcon(20),
    borderRadius: responsiveIcon(10),
    backgroundColor: Colors.red,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  badgeText: {
    color: Colors.white,
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(10),
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: responsiveIcon(25),
    paddingHorizontal: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(12),
    marginRight: responsiveSpacing(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    fontSize: responsiveFont(14),
    color: Colors.black,
    fontFamily: Fonts.Roboto_Regular,
  },
  searchPlaceholder: {
    fontSize: responsiveFont(14),
    color: '#999',
    fontFamily: Fonts.Roboto_Regular,
  },
  searchButton: {
    width: responsiveIcon(48),
    height: responsiveIcon(48),
    borderRadius: responsiveIcon(24),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    width: responsiveIcon(20),
    height: responsiveIcon(20),
    tintColor: '#666',
  },
});
