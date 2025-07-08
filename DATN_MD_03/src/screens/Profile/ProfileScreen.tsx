import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import ProfileHeader from './components/ProfileHeader';
import SettingSwitch from './components/SettingSwitch';
import SettingItem from './components/SettingItem';
import { GuestProfileAnimation, LogoutModal } from '../../components';
import {
  SCREEN,
  responsiveFont,
  scale,
  verticalScale,
} from '../../utils/responsive';
import { Colors } from '../../theme/color';
import { Fonts } from '../../theme/fonts';
import { Icons } from '../../assets/icons';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/route';
import { RootState, AppDispatch } from '../../store';
import { checkToken } from '../../utils/tokenCheck';

export default function ProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const loading = useSelector((state: RootState) => state.auth.loading);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Check if user is guest (not logged in)
  const isGuest = !checkToken(token) || !user;

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
    navigation.navigate('Login', {});
  };

  const hanleUpdateProfile = () => {
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
        { cancelable: false },
      );
      return;
    }
    navigation.navigate('PersonalInformation', {});
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
        { cancelable: false },
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

  // Show normal profile screen for logged in users
  return (
    <SafeAreaView style={styles.container}>
      <ProfileHeader />

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
          label="Hợp đồng thuê"
          iconEnd={Icons.IconNext}
        />
        <SettingItem
          iconStat={Icons.IconPaper}
          label="Hóa đơn thu chi"
          iconEnd={Icons.IconNext}
          onPress={handleNavigateToBill}
        />
      </View>

      <View style={styles.box}>
        <SettingItem
          iconStat={Icons.IconLightReport}
          label="Báo cáo sự cố"
          iconEnd={Icons.IconNext}
        />
        <SettingItem
          iconStat={Icons.Iconoir_Privacy_Policy}
          label="Điều khoản & chính sách"
          iconEnd={Icons.IconNext}
        />
      </View>

      <TouchableOpacity onPress={handleShowLogoutModal}>
        <Text style={styles.button}>Đăng xuất</Text>
      </TouchableOpacity>

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
    width: SCREEN.width,
    height: SCREEN.height,
    backgroundColor: Colors.backgroud,
    alignItems: 'center',
  },
  box: {
    backgroundColor: Colors.white,
    marginVertical: verticalScale(8),
    paddingHorizontal: scale(12),
    borderRadius: 12,
  },
  button: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    marginVertical: scale(5),
  },
});
