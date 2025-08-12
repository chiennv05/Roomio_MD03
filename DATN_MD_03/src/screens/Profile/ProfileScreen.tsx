import React, {useCallback, useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  PermissionsAndroid,
  Platform,
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

export default function ProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const loading = useSelector((state: RootState) => state.auth.loading);
  console.log(token);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState<boolean>(false);

  // Check location permission and reflect on the switch
  const checkPermission = useCallback(async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
          setLocationPermissionGranted(granted);
        } else {
          // iOS: try to get current location; if permission denied, error.code === 1
          Geolocation.getCurrentPosition(
            () => setLocationPermissionGranted(true),
            () => setLocationPermissionGranted(false),
            {enableHighAccuracy: false, timeout: 5000, maximumAge: 1000},
          );
        }
      } catch (e) {
        setLocationPermissionGranted(false);
      }
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Re-check whenever user returns to Profile
  useFocusEffect(
    useCallback(() => {
      checkPermission();
    }, [checkPermission]),
  );

  // Check if user is guest (not logged in)
  const isGuest = !checkToken(token) || !user;

  // Check if user is landlord (chủ trọ)
  const isLandlord = user?.role === 'chuTro';

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
      Alert.alert(
        'Thông báo',
        'Bạn cần đăng nhập để sử dụng chức năng này',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('Login', {}), // Chuyển sang màn Login
          },
        ],
        {cancelable: false},
      );
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
      Alert.alert(
        'Thông báo',
        'Bạn cần đăng nhập để sử dụng chức năng này',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login', {}),
          },
        ],
        {cancelable: false},
      );
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
            initialValue={true}
          />
          <SettingSwitch
            iconStat={Icons.IconsLocation}
            label="Vị trí"
            initialValue={false}
            value={locationPermissionGranted}
            disabled
          />
        </View>

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
    paddingBottom: verticalScale(20),
    alignItems: 'center',
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
