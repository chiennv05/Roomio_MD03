import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  StatusBar,
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
import ItemButtonGreen from '../../components/ItemButtonGreen';
import {ItemInput} from '../ChuTro/MyRoom/components';
import {HeaderWithBack} from '../../components';
import LinearGradient from 'react-native-linear-gradient';
import CustomAlertModal from '../../components/CustomAlertModal';

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
            parseInt(year, 10),
            parseInt(month, 10) - 1,
            parseInt(day, 10),
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
        setAlertConfig({
          visible: true,
          title: 'Lỗi',
          message: 'Mã QR không hợp lệ hoặc không đúng định dạng.',
          type: 'error',
          buttons: [{
            text: 'Đóng',
            style: 'default',
            onPress: () => setAlertConfig(prev => ({...prev, visible: false})),
          }],
        });
      }
    } catch (error) {
      console.error('Parse CCCD data error:', error);
      setAlertConfig({
        visible: true,
        title: 'Lỗi',
        message: 'Không thể đọc thông tin từ CCCD.',
        type: 'error',
        buttons: [{
          text: 'Đóng',
          style: 'default',
          onPress: () => setAlertConfig(prev => ({...prev, visible: false})),
        }],
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!cccdData || !token) {
      setAlertConfig({
        visible: true,
        title: 'Lỗi',
        message: 'Không có thông tin để cập nhật.',
        type: 'error',
        buttons: [{
          text: 'Đóng',
          style: 'default',
          onPress: () => setAlertConfig(prev => ({...prev, visible: false})),
        }],
      });
      return;
    }

    // Định dạng ngày theo YYYY-MM-DD
    const formatDateForApi = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const updatedData = {
      fullName: cccdData.fullName,
      identityNumber: cccdData.identityNumber,
      address: cccdData.address,
      birthDate: formatDateForApi(cccdData.birthDate), // Sử dụng định dạng YYYY-MM-DD
      // Không gửi phone để cho phép xác minh CCCD mà không yêu cầu SĐT
    };

    console.log('Updating profile with data:', updatedData);

    setIsUpdating(true);

    try {
      const success = await dispatch(
        updateProfile({
          token,
          data: updatedData,
        }),
      ).unwrap();

      if (success) {
        setAlertConfig({
          visible: true,
          title: 'Xác thực thành công',
          message: 'Tài khoản của bạn đã được xác thực CCCD thành công!',
          type: 'success',
          buttons: [{
            text: 'OK',
            style: 'default',
            onPress: () => {
              setAlertConfig(prev => ({...prev, visible: false}));
              if (redirectTo === 'DetailRoom' && roomId) {
                navigation.reset({
                  index: 0,
                  routes: [
                    {name: 'UITab'},
                    {name: 'DetailRoom', params: {roomId}},
                  ],
                });
              } else {
                navigation.reset({
                  index: 0,
                  routes: [{name: 'UITab'}],
                });
              }
            },
          }],
        });
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setAlertConfig({
        visible: true,
        title: 'Lỗi',
        message: 'Không thể cập nhật thông tin. Vui lòng thử lại.',
        type: 'error',
        buttons: [{
          text: 'Đóng',
          style: 'default',
          onPress: () => setAlertConfig(prev => ({...prev, visible: false})),
        }],
      });
    } finally {
      setIsUpdating(false);
    }
  };



  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN');
  };

  if (!cccdData) {
    return (
      <View style={styles.mainContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <LinearGradient
          colors={['#BAFD00', '#F4F4F4']}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          style={styles.gradientHeader}>
          <SafeAreaView edges={['top']}>
            <HeaderWithBack
              title="Xác thực CCCD"
              backgroundColor="transparent"
            />
          </SafeAreaView>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text>Đang xử lý...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#BAFD00', '#F4F4F4']}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={styles.gradientHeader}>
        <SafeAreaView edges={['top']}>
          <HeaderWithBack
            title={user?.identityNumber ? 'Thông tin CCCD' : 'Xác thực CCCD'}
            backgroundColor="transparent"
          />
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

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
          </View>
      </ScrollView>

      {/* Bottom Button */}
      {!user?.identityNumber && (
        <View style={styles.bottomContainer}>
          <ItemButtonGreen
            title={isUpdating ? 'Đang xác thực...' : 'Xác nhận và xác thực'}
            onPress={handleUpdateProfile}
          />
        </View>
      )}

      {/* Custom Alert Modal */}
      <CustomAlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig(prev => ({...prev, visible: false}))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  gradientHeader: {
    paddingBottom: verticalScale(15),
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
