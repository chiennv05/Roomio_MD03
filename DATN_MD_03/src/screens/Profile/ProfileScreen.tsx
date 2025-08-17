import React, {useCallback, useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  PermissionsAndroid,
  Platform,
  Linking,
} from 'react-native';
import ProfileHeader from './components/ProfileHeader';
import SettingSwitch from './components/SettingSwitch';
import SettingItem from './components/SettingItem';
import {GuestProfileAnimation, LogoutModal} from '../../components';
import {
  SCREEN,
  responsiveFont,
  scale,
  verticalScale,
} from '../../utils/responsive';
import {Colors} from '../../theme/color';
import LinearGradient from 'react-native-linear-gradient';
import {Fonts} from '../../theme/fonts';
import {Icons} from '../../assets/icons';
import {useDispatch, useSelector} from 'react-redux';
import {logoutUser} from '../../store/slices/authSlice';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../types/route';
import {RootState, AppDispatch} from '../../store';
import {checkToken} from '../../utils/tokenCheck';
import Geolocation from '@react-native-community/geolocation';
import {loadSubscriptions} from '../../store/slices/subscriptionSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {requestNotificationPermission} from '../Notification/services/NativeNotifier';
import {
  startPolling,
  stopPolling,
} from '../Notification/services/NotificationPoller';
import CustomAlertModal from '../../components/CustomAlertModal';
import {clearFormDataFromStorage} from '../ChuTro/AddRoom/utils/asyncStorageUtils';

export default function ProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const [notifEnabled, setNotifEnabled] = useState<boolean>(true);

  const loading = useSelector((state: RootState) => state.auth.loading);
  console.log(token);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState<boolean>(false);

  // Alert modal state
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'error' | 'success' | 'warning' | 'info',
    buttons: [] as Array<{
      text: string;
      onPress: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>,
  });

  // Check location permission and reflect on the switch
  const checkPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        setLocationPermissionGranted(granted);
        return granted;
      }
      // iOS: wrap in promise to get boolean
      const granted = await new Promise<boolean>(resolve => {
        Geolocation.getCurrentPosition(
          () => resolve(true),
          () => resolve(false),
          {enableHighAccuracy: false, timeout: 5000, maximumAge: 1000},
        );
      });
      // Load notification toggle from storage on mount
     

      setLocationPermissionGranted(granted);
      return granted;
    } catch (e) {
      setLocationPermissionGranted(false);
      return false;
    }
  }, []);
  // Load notification toggle from storage on mount (correct hook position)
  useEffect(() => {
    (async () => {
      try {
        const enabled = (await AsyncStorage.getItem('notif:enabled')) === '1';
        setNotifEnabled(enabled);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Re-check whenever user returns to Profile
  useFocusEffect(
    useCallback(() => {
      checkPermission();
      // Tải gói đăng ký khi quay lại màn hình
      if (user?.role === 'chuTro' && token) {
        dispatch(loadSubscriptions(token));
      }
    }, [checkPermission, dispatch, token, user?.role]),
  );

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Quyền truy cập vị trí',
            message:
              'Ứng dụng cần truy cập vị trí của bạn để hiển thị phòng gần bạn.',
            buttonPositive: 'Đồng ý',
            buttonNegative: 'Từ chối',
          },
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
      }
      // iOS: gọi getCurrentPosition để trigger prompt
      return await new Promise<boolean>(resolve => {
        Geolocation.getCurrentPosition(
          () => resolve(true),
          () => resolve(false),
          {enableHighAccuracy: true, timeout: 10000, maximumAge: 1000},
        );
      });
    } catch {
      return false;
    }
  }, []);

  // Toggle notification from Profile
  const handleToggleNotification = useCallback(
    async (nextEnabled: boolean) => {
      try {
        setNotifEnabled(nextEnabled);
        await AsyncStorage.setItem('notif:enabled', nextEnabled ? '1' : '0');
        if (nextEnabled) {
          await requestNotificationPermission();
          if (token) {
            startPolling(token, 5_000);
          }
        } else {
          stopPolling();
        }
      } catch (e) {}
    },
    [token],
  );

  const handleToggleLocation = useCallback(
    async (nextEnabled: boolean) => {
      if (nextEnabled) {
        const grantedNow = await checkPermission();
        if (grantedNow) {
          setLocationPermissionGranted(true);
          return;
        }
        const granted = await requestPermission();
        setLocationPermissionGranted(granted);
        if (!granted) {
          setAlertConfig({
            visible: true,
            title: 'Quyền vị trí bị từ chối',
            message:
              'Bạn đã từ chối cấp quyền vị trí. Bạn có thể cấp lại trong Cài đặt.',
            type: 'warning',
            buttons: [
              {
                text: 'Đóng',
                style: 'default',
                onPress: () =>
                  setAlertConfig(prev => ({...prev, visible: false})),
              },
            ],
          });
        }
      } else {
        // Không thể thu hồi quyền trực tiếp từ app. Hướng dẫn mở cài đặt.
        setLocationPermissionGranted(false);
        setAlertConfig({
          visible: true,
          title: 'Tắt quyền vị trí',
          message:
            'Để tắt hoàn toàn, vui lòng thu hồi quyền trong Cài đặt ứng dụng.',
          type: 'info',
          buttons: [
            {
              text: 'Để sau',
              style: 'cancel',
              onPress: () =>
                setAlertConfig(prev => ({...prev, visible: false})),
            },
            {
              text: 'Mở Cài đặt',
              style: 'default',
              onPress: () => {
                setAlertConfig(prev => ({...prev, visible: false}));
                Linking.openSettings?.();
              },
            },
          ],
        });
      }
    },
    [checkPermission, requestPermission],
  );

  // Check if user is guest (not logged in)
  const isGuest = !checkToken(token) || !user;

  // Check if user is landlord (chủ trọ)
  const isLandlord = user?.role === 'chuTro';
  const currentSubscription = useSelector(
    (state: RootState) => state.subscription.current,
  );
  const currentPlanLabel = (currentSubscription?.plan || '').toUpperCase();

  const handleShowLogoutModal = () => {
    setShowLogoutModal(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleConfirmLogout = async () => {
    if (!token) {
      setShowLogoutModal(false);
      navigation.navigate('Login', {});
      return;
    }

    try {
      await dispatch(logoutUser(token)).unwrap();
      setShowLogoutModal(false);
      await clearFormDataFromStorage();
      navigation.navigate('Login', {});
    } catch (error) {
      // Dù có lỗi API, vẫn logout local và navigate
      setShowLogoutModal(false);
      navigation.navigate('Login', {});
    }
  };

  const handleLogin = () => {
    navigation.replace('Login', {});
  };

  const hanleUpdateProfile = () => {
    if (!checkToken(token)) {
      setAlertConfig({
        visible: true,
        title: 'Thông báo',
        message: 'Bạn cần đăng nhập để sử dụng chức năng này',
        type: 'info',
        buttons: [
          {
            text: 'OK',
            style: 'default',
            onPress: () => {
              setAlertConfig(prev => ({...prev, visible: false}));
              navigation.reset({
                index: 0,
                routes: [{name: 'Login', params: {}}],
              });
            },
          },
        ],
      });
      return;
    }
    navigation.navigate('PersonalInformation', {});
  };

  // Hàm xử lý khi nhấn vào "Danh sách người thuê"
  const handleTenantListPress = () => {
    // Chuyển đến màn hình TenantList
    navigation.navigate('TenantList');
  };

  // Hàm xử lý khi nhấn vào "Quản lý hợp đồng"
  const handleContractPress = () => {
    if (isLandlord) {
      // Nếu là chủ
      navigation.navigate('ContractManagement');
    } else {
      // Nếu là người thuê
      navigation.navigate('ContractLessee');
    }
  };

  // Hàm xử lý khi nhấn vào "Yêu cầu hỗ trợ"
  const handleSupportPress = () => {
    navigation.navigate('SupportScreen');
  };
  const handleNavigateToBill = () => {
    if (!checkToken(token)) {
      setAlertConfig({
        visible: true,
        title: 'Thông báo',
        message: 'Bạn cần đăng nhập để sử dụng chức năng này',
        type: 'info',
        buttons: [
          {
            text: 'OK',
            style: 'default',
            onPress: () => {
              setAlertConfig(prev => ({...prev, visible: false}));
              navigation.navigate('Login', {});
            },
          },
        ],
      });
      return;
    }
    navigation.navigate('Bill');
  };

  // Show guest screen if not logged in
  if (isGuest) {
    return (
      <SafeAreaView style={styles.container}>
        <GuestProfileAnimation onLoginPress={handleLogin} />
      </SafeAreaView>
    );
  }

  const handleGoLandlord = () => {
    navigation.navigate('LandlordRoom');
  };

  const handleGoStatistic = () => {
    navigation.navigate('StatisticScreen');
  };

  const handleGoSubscription = () => {
    navigation.navigate('SubscriptionScreen');
  };

  // Show normal profile screen for logged in users
  return (
    <SafeAreaView style={styles.container}>
      <ProfileHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.box}>
          <SettingSwitch
            iconStat={Icons.IconsNotification}
            label="Thông báo"
            initialValue={false}
            value={notifEnabled}
            onToggle={handleToggleNotification}
          />
          <SettingSwitch
            iconStat={Icons.IconsLocation}
            label="Vị trí"
            initialValue={false}
            value={locationPermissionGranted}
            onToggle={handleToggleLocation}
          />
        </View>

        {isLandlord && (
          <TouchableOpacity activeOpacity={0.9} onPress={handleGoSubscription}>
            <LinearGradient
              colors={['#BAFD00', '#A5F000']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.premiumCard}>
              <View style={styles.premiumContent}>
                <Text style={styles.premiumTitle}>Nâng cấp gói đăng ký</Text>
                <Text style={styles.premiumSubtitle}>
                  Mở khóa các tính năng nâng cao cho chủ trọ
                </Text>
              </View>
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>
                  {currentPlanLabel || 'NÂNG CẤP'}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={styles.box}>
          <SettingItem
            iconStat={Icons.IconFluentPersonRegular}
            label="Thông tin cá nhân"
            iconEnd={Icons.IconNext}
            onPress={hanleUpdateProfile}
          />
          <SettingItem
            iconStat={Icons.IconContract}
            label={isLandlord ? 'Quản lý hợp đồng' : 'Hợp đồng thuê'}
            iconEnd={Icons.IconNext}
            onPress={handleContractPress}
          />
          <SettingItem
            iconStat={Icons.IconPaper}
            label="Hóa đơn thu chi"
            iconEnd={Icons.IconNext}
            onPress={handleNavigateToBill}
          />

          {/* Chỉ hiển thị các tùy chọn cho chủ trọ nếu user có role là chuTro */}
          {isLandlord && (
            <>
              <SettingItem
                iconStat={Icons.IconPersonDefault}
                label="Danh sách người thuê"
                iconEnd={Icons.IconNext}
                onPress={handleTenantListPress}
              />
              <SettingItem
                iconStat={Icons.IconPaper}
                label="Thống kê "
                iconEnd={Icons.IconNext}
                onPress={handleGoStatistic}
              />
              <SettingItem
                iconStat={Icons.IconPaper}
                label="Quản lý phòng trọ "
                iconEnd={Icons.IconNext}
                onPress={handleGoLandlord}
              />
            </>
          )}
        </View>

        <View style={styles.box}>
          <SettingItem
            iconStat={Icons.IconLightReport}
            label="Yêu cầu hỗ trợ"
            iconEnd={Icons.IconNext}
            onPress={handleSupportPress}
          />
          <SettingItem
            iconStat={Icons.Iconoir_Privacy_Policy}
            label="Điều khoản & chính sách"
            iconEnd={Icons.IconNext}
            onPress={() => navigation.navigate('PolicyTerms')}
          />
        </View>

        <TouchableOpacity
          onPress={handleShowLogoutModal}
          style={styles.logoutButtonContainer}>
          <Text style={styles.button}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>

      <LogoutModal
        visible={showLogoutModal}
        onCancel={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        loading={loading}
      />

      {/* Custom Alert Modal */}
      <CustomAlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig(prev => ({...prev, visible: false}))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN.width,
    backgroundColor: Colors.backgroud,
  },
  scrollViewContent: {
    paddingBottom: verticalScale(100),
    alignItems: 'center',
  },
  premiumCard: {
    marginVertical: verticalScale(8),
    borderRadius: 14,
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
  },
  premiumContent: {
    flex: 1,
    paddingRight: scale(12),
  },
  premiumTitle: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  premiumSubtitle: {
    marginTop: verticalScale(4),
    fontSize: responsiveFont(13),
    fontFamily: Fonts.Roboto_Regular,
    color: '#2b2b2b',
  },
  premiumBadge: {
    backgroundColor: '#0f172a',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(8),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  premiumBadgeText: {
    color: '#fff',
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(12),
    letterSpacing: 0.5,
  },
  box: {
    backgroundColor: Colors.white,
    marginVertical: verticalScale(8),
    paddingHorizontal: scale(12),
    borderRadius: 12,
    // width: '90%',
    // alignSelf: 'center',
  },
  button: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    marginVertical: scale(5),
  },
  logoutButtonContainer: {
    alignItems: 'center',
    marginTop: verticalScale(10),
  },
});
