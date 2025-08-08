import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  StatusBar,
  Alert,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../types/route';
import {useDispatch, useSelector} from 'react-redux';
import {updateProfile} from '../../store/slices/authSlice';
import type {AppDispatch} from '../../store';
import {
  responsiveFont,
  responsiveSpacing,
  SCREEN,
  verticalScale,
} from '../../utils/responsive';
import {Colors} from '../../theme/color';
import {Icons} from '../../assets/icons';
import ItemButtonGreen from '../../components/ItemButtonGreen';
import {ItemInput, UIHeader} from '../ChuTro/MyRoom/components';

interface CCCDData {
  identityNumber: string;
  fullName: string;
  birthDate: Date;
  address: string;
  gender: string;
}

export default function CCCDResult() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CCCDResult'>>();
  const {rawData, imageUri, redirectTo, roomId} = route.params;

  console.log(rawData, imageUri, redirectTo, roomId);

  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: any) => state.auth.token);
  const user = useSelector((state: any) => state.auth.user);

  const [cccdData, setCccdData] = useState<CCCDData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (rawData) {
      parseCCCDData(rawData);
    } else {
      // Trường hợp không có rawData => lấy từ Redux
      if (user) {
        setCccdData({
          identityNumber: user.identityNumber || '',
          fullName: user.fullName || '',
          birthDate: user.birthDate ? new Date(user.birthDate) : new Date(),
          address: user.address || '',
          gender: user.gender || '',
        });
        setPhoneNumber(user.phone || '');
      }
    }
  }, [rawData, user]);

  const parseCCCDData = (data: string) => {
    try {
      const infoArray = data.split('|');

      if (infoArray.length >= 6) {
        // Parse ngày sinh (format: ddMMyyyy)
        const dobString = infoArray[3];
        let parsedDate = new Date();

        if (dobString && dobString.length === 8) {
          const day = dobString.substring(0, 2);
          const month = dobString.substring(2, 4);
          const year = dobString.substring(4, 8);
          parsedDate = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
          );
        }

        const parsed: CCCDData = {
          identityNumber: infoArray[0] || '',
          fullName: infoArray[2] || '',
          birthDate: parsedDate,
          address: infoArray[5] || '',
          gender: infoArray[4] || '',
        };

        setCccdData(parsed);
      } else {
        Alert.alert('Lỗi', 'Mã QR không hợp lệ hoặc không đúng định dạng.');
      }
    } catch (error) {
      console.error('Parse CCCD data error:', error);
      Alert.alert('Lỗi', 'Không thể đọc thông tin từ CCCD.');
    }
  };

  const handleUpdateProfile = async () => {
    if (!cccdData || !token) {
      Alert.alert('Lỗi', 'Không có thông tin để cập nhật.');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Lỗi', 'Số điện thoại không được để trống.');
      return;
    }
    if (phoneNumber.length !== 10) {
      Alert.alert('Lỗi', 'Số điện thoại phải có 10 chữ số.');
      return;
    }

    const updatedData = {
      fullName: cccdData.fullName,
      identityNumber: cccdData.identityNumber,
      address: cccdData.address,
      birthDate: cccdData.birthDate.toISOString(),
      phone: phoneNumber,
    };

    console.log('Updating profile with data:', updatedData);

    setIsUpdating(true);

    try {
      const success = await dispatch(
        updateProfile({
          token,
          data: {
            fullName: cccdData.fullName,
            identityNumber: cccdData.identityNumber,
            address: cccdData.address,
            birthDate: cccdData.birthDate.toISOString(),
            phone: phoneNumber,
          },
        }),
      ).unwrap();

      if (success) {
        Alert.alert('Thành công', 'Đã cập nhật thông tin từ CCCD thành công!', [
          {
            text: 'OK',
            onPress: () => {
              if (redirectTo === 'DetailRoom' && roomId) {
                navigation.reset({
                  index: 0,
                  routes: [{name: 'DetailRoom', params: {roomId}}],
                });
              } else {
                navigation.replace('PersonalInformation', {});
              }
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRetake = () => {
    navigation.goBack();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN');
  };

  if (!cccdData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text>Đang xử lý...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#BAFD00"
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Header */}
          <UIHeader
            iconLeft={Icons.IconArrowLeft}
            onPressLeft={handleRetake}
            title="Cập nhật thông tin "
          />

          <View style={styles.content}>
            {/* Information Fields */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Họ tên</Text>
              <ItemInput
                value={cccdData.fullName}
                placeholder="Họ tên"
                editable={false}
                onChangeText={() => {}}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Ngày sinh</Text>
              <ItemInput
                value={formatDate(cccdData.birthDate)}
                placeholder="Ngày sinh"
                editable={false}
                onChangeText={() => {}}
                width={SCREEN.width * 0.9}
              />
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Số CCCD</Text>
              <ItemInput
                value={cccdData.identityNumber}
                placeholder="Số CCCD"
                editable={false}
                onChangeText={() => {}}
              />
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Địa chỉ</Text>
              <ItemInput
                value={cccdData.address}
                placeholder="Địa chỉ"
                editable={false}
                onChangeText={() => {}}
              />
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Số điện thoại</Text>
              <ItemInput
                value={phoneNumber}
                placeholder="Số điện thoại"
                editable={true}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomContainer}>
          <ItemButtonGreen
            title={isUpdating ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
            onPress={handleUpdateProfile}
          />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#BAFD00',
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: responsiveSpacing(20),
    paddingTop: responsiveSpacing(16),
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  subtitle: {
    fontSize: responsiveFont(14),
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: responsiveSpacing(32),
    lineHeight: responsiveFont(20),
    paddingHorizontal: responsiveSpacing(10),
  },
  fieldContainer: {
    marginBottom: responsiveSpacing(12),
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsiveSpacing(12),
  },
  halfField: {
    flex: 0.48,
  },
  fieldLabel: {
    fontSize: responsiveFont(16),
    color: Colors.black,
    marginBottom: responsiveSpacing(4),
    fontWeight: '500',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: Colors.gray200,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginVertical: verticalScale(5),
    alignSelf: 'center',
    width: SCREEN.width * 0.9,
  },
  inputText: {
    fontSize: responsiveFont(16),
    color: Colors.black,
  },
  bottomContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: responsiveSpacing(20),
    paddingVertical: responsiveSpacing(16),
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  confirmButton: {
    backgroundColor: '#BAFD00',
    borderRadius: responsiveFont(12),
    paddingVertical: responsiveSpacing(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: responsiveFont(16),
    fontWeight: 'bold',
    color: Colors.black,
  },
});
