import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import ProfileHeader from './components/ProfileHeader';
import SettingSwitch from './components/SettingSwitch';
import SettingItem from './components/SettingItem';
import {
  SCREEN,
  responsiveFont,
  scale,
  verticalScale,
} from '../../utils/responsive';
import {Colors} from '../../theme/color';
import {Fonts} from '../../theme/fonts';
import {Icons} from '../../assets/icons';
import {useDispatch} from 'react-redux';
import {logout} from '../../store/slices/authSlice';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../types/route';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleDangXuat = () => {
    dispatch(logout());
    if (navigation && typeof navigation.navigate === 'function') {
      navigation.replace('Login');
    }
  };

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
          onPress={() => navigation.navigate('PersonalInformation')}
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

      <TouchableOpacity onPress={handleDangXuat}>
        <Text style={styles.button}>Đăng xuất</Text>
      </TouchableOpacity>
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
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
  },
});
