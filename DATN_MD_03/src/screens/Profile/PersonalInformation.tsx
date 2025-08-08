import React from 'react';
import {View, StyleSheet, ScrollView, StatusBar, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {responsiveSpacing} from '../../utils/responsive';
import {Colors} from '../../theme/color';
import IteminIrmation from './components/IteminFormation';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../types/route';
import {formatDate} from '../../utils/formatUtils';
import ItemButtonGreen from '../../components/ItemButtonGreen';
import ItemInformational from './components/ItemInformational';
import {useSelector} from 'react-redux';
import {RootState} from '../../store';

export default function PersonalInformation() {
  const route =
    useRoute<RouteProp<RootStackParamList, 'PersonalInformation'>>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  // sử lý lại chỗ này
  const {redirectTo, roomId} = route.params || {};
  const user = useSelector((state: RootState) => state.auth.user);

  // Chỉ lấy giá trị khởi tạo từ redux, không reset lại khi user đổi
  const fullName = user?.fullName || '';
  const phone = user?.phone || '';
  const identityNumber = user?.identityNumber || '';
  const address = user?.address || '';
  const birthDate = user?.birthDate || '';

  const handleUpdateProfile = () => {
    if (user?.identityNumber === '') {
      Alert.alert('Thông báo', 'Vui lòng cung cấp số CMND/CCCD.');

      navigation.navigate('CCCDScanning', {
        redirectTo: redirectTo || undefined,
        roomId: roomId || undefined,
      });
      return;
    } else {
      navigation.navigate('CCCDResult', {});
    }
  };
  console.log('user', user);
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#BAFD00"
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <IteminIrmation />

          <View style={styles.formContainer}>
            <View style={styles.inputsContainer}>
              <ItemInformational title="Họ và tên" value={fullName} />
              <ItemInformational title="Số điện thoại" value={phone} />
              <ItemInformational title="Số CMND/CCCD" value={identityNumber} />
              <ItemInformational title="Địa chỉ" value={address} />
              <ItemInformational
                title="Ngày sinh"
                value={formatDate(birthDate)}
              />
            </View>

            <ItemButtonGreen
              title="Cập nhật thông tin"
              onPress={handleUpdateProfile}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

// Thêm styles mới
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#BAFD00', // Màu xanh lá theo yêu cầu
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(20),
    paddingTop: responsiveSpacing(16),
    paddingBottom: responsiveSpacing(24),
  },
  inputsContainer: {
    width: '100%',
  },
});
