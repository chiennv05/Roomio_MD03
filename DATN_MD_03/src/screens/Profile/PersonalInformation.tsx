import React, {useState, useEffect, useCallback, lazy, Suspense} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Text,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  verticalScale,
  scale,
  responsiveFont,
  responsiveSpacing,
} from '../../utils/responsive';
import {Colors} from '../../theme/color';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../types/route';
import {formatDate} from '../../utils/formatUtils';
import {useSelector, useDispatch} from 'react-redux';
import {RootState, AppDispatch} from '../../store';
import {launchImageLibrary} from 'react-native-image-picker';
import {updateAvatar, updatePhoneEmail} from '../../store/slices/authSlice';
import LinearGradient from 'react-native-linear-gradient';
import {Fonts} from '../../theme/fonts';
import {Icons} from '../../assets/icons';
import {HeaderWithBack} from '../../components';
import CustomAlertModal from '../../components/CustomAlertModal';

// Import components
import ProfileAvatar from './components/ProfileAvatar';
import QuickStatsCards from './components/QuickStatsCards';
import InfoField from './components/InfoField';
import EditableInfoField from './components/EditableInfoField';
// Lazy load EditModal
const EditModal = lazy(() => import('./components/EditModal'));
import VerificationCard from './components/VerificationCard';

const PersonalInformation = React.memo(() => {
  const route =
    useRoute<RouteProp<RootStackParamList, 'PersonalInformation'>>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();

  // sử lý lại chỗ này
  const {redirectTo, roomId} = route.params || {};
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  // Lấy dữ liệu người dùng
  const username = user?.username || '';
  const fullName = user?.fullName || '';
  const birthDate = user?.birthDate || '';
  const email = user?.email || '';
  const phone = user?.phone || '';
  const address = user?.address || '';
  const avatar = user?.avatar || '';
  const identityNumber = user?.identityNumber || '';

  // State for editing
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempPhone, setTempPhone] = useState(phone);
  const [tempEmail, setTempEmail] = useState(email);

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

  // Update temp values when user data changes
  useEffect(() => {
    setTempPhone(phone);
    setTempEmail(email);
  }, [phone, email]);

  const handleVerifyAccount = useCallback(() => {
    if (!identityNumber || identityNumber.length === 0) {
      // Chưa có CCCD, chuyển sang quét CCCD
      navigation.navigate('CCCDScanning', {
        redirectTo: redirectTo || undefined,
        roomId: roomId || undefined,
      });
    } else {
      // Đã có CCCD (đã xác thực), hiển thị thông tin
      setAlertConfig({
        visible: true,
        title: 'Đã xác thực',
        message: `CCCD: ${identityNumber}\nBạn chỉ có thể cập nhật Email và Số điện thoại.\nCác thông tin định danh đã được bảo vệ.`,
        type: 'info',
        buttons: [{
          text: 'Đã hiểu',
          style: 'default',
          onPress: () => setAlertConfig(prev => ({...prev, visible: false})),
        }],
      });
    }
  }, [identityNumber, navigation, redirectTo, roomId]);


  const handleSavePhone = useCallback(async () => {
    // Validate phone number
    if (!tempPhone || tempPhone.length < 10) {
      setAlertConfig({
        visible: true,
        title: 'Lỗi',
        message: 'Số điện thoại không hợp lệ',
        type: 'error',
        buttons: [{
          text: 'Đóng',
          style: 'default',
          onPress: () => setAlertConfig(prev => ({...prev, visible: false})),
        }],
      });
      return;
    }

    if (!token) {
      setAlertConfig({
        visible: true,
        title: 'Lỗi',
        message: 'Phiên đăng nhập hết hạn',
        type: 'error',
        buttons: [{
          text: 'Đóng',
          style: 'default',
          onPress: () => setAlertConfig(prev => ({...prev, visible: false})),
        }],
      });
      return;
    }

    try {
      await dispatch(
        updatePhoneEmail({
          token,
          data: { phone: tempPhone },
        }),
      ).unwrap();

      setIsEditingPhone(false);
      setAlertConfig({
        visible: true,
        title: 'Thành công',
        message: 'Đã cập nhật số điện thoại',
        type: 'success',
        buttons: [{
          text: 'Đóng',
          style: 'default',
          onPress: () => setAlertConfig(prev => ({...prev, visible: false})),
        }],
      });
    } catch (error: any) {
      setAlertConfig({
        visible: true,
        title: 'Lỗi',
        message: error || 'Không thể cập nhật số điện thoại',
        type: 'error',
        buttons: [{
          text: 'Đóng',
          style: 'default',
          onPress: () => setAlertConfig(prev => ({...prev, visible: false})),
        }],
      });
    }
  }, [tempPhone, token, dispatch]);

  const handleSaveEmail = useCallback(async () => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!tempEmail || !emailRegex.test(tempEmail)) {
      setAlertConfig({
        visible: true,
        title: 'Lỗi',
        message: 'Email không hợp lệ',
        type: 'error',
        buttons: [{
          text: 'Đóng',
          style: 'default',
          onPress: () => setAlertConfig(prev => ({...prev, visible: false})),
        }],
      });
      return;
    }

    if (!token) {
      setAlertConfig({
        visible: true,
        title: 'Lỗi',
        message: 'Phiên đăng nhập hết hạn',
        type: 'error',
        buttons: [{
          text: 'Đóng',
          style: 'default',
          onPress: () => setAlertConfig(prev => ({...prev, visible: false})),
        }],
      });
      return;
    }

    try {
      await dispatch(
        updatePhoneEmail({
          token,
          data: { email: tempEmail },
        }),
      ).unwrap();

      setIsEditingEmail(false);
      setAlertConfig({
        visible: true,
        title: 'Thành công',
        message: 'Đã cập nhật email',
        type: 'success',
        buttons: [{
          text: 'Đóng',
          style: 'default',
          onPress: () => setAlertConfig(prev => ({...prev, visible: false})),
        }],
      });
    } catch (error: any) {
      setAlertConfig({
        visible: true,
        title: 'Lỗi',
        message: error || 'Không thể cập nhật email',
        type: 'error',
        buttons: [{
          text: 'Đóng',
          style: 'default',
          onPress: () => setAlertConfig(prev => ({...prev, visible: false})),
        }],
      });
    }
  }, [tempEmail, token, dispatch]);

  const handleChangeAvatar = useCallback(() => {
    if (!token) {
      setAlertConfig({
        visible: true,
        title: 'Lỗi',
        message: 'Phiên đăng nhập hết hạn',
        type: 'error',
        buttons: [{
          text: 'Đóng',
          style: 'default',
          onPress: () => setAlertConfig(prev => ({...prev, visible: false})),
        }],
      });
      return;
    }

    const options = {
      mediaType: 'photo' as const,
      includeBase64: false,
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.8 as const,
    };

    // Mở thư viện ảnh trực tiếp
    launchImageLibrary(options, async (response) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const imageUri = response.assets[0].uri;

        if (!imageUri) {
          setAlertConfig({
            visible: true,
            title: 'Lỗi',
            message: 'Không thể lấy ảnh',
            type: 'error',
            buttons: [{
              text: 'Đóng',
              style: 'default',
              onPress: () => setAlertConfig(prev => ({...prev, visible: false})),
            }],
          });
          return;
        }

        try {
          await dispatch(
            updateAvatar({
              token,
              imageUri,
            }),
          ).unwrap();

          setAlertConfig({
            visible: true,
            title: 'Thành công',
            message: 'Đã cập nhật ảnh đại diện',
            type: 'success',
            buttons: [{
              text: 'Đóng',
              style: 'default',
              onPress: () => setAlertConfig(prev => ({...prev, visible: false})),
            }],
          });
        } catch (error: any) {
          setAlertConfig({
            visible: true,
            title: 'Lỗi',
            message: error || 'Không thể cập nhật ảnh đại diện',
            type: 'error',
            buttons: [{
              text: 'Đóng',
              style: 'default',
              onPress: () => setAlertConfig(prev => ({...prev, visible: false})),
            }],
          });
        }
      }
    });
  }, [token, dispatch]);
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#BAFD00', '#F4F4F4']}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={styles.gradientHeader}>
        <SafeAreaView edges={['top']}>
          <HeaderWithBack
            title="Thông tin cá nhân"
            backgroundColor="transparent"
          />

            {/* Avatar Section with integrated Badge */}
            <ProfileAvatar
              avatar={avatar}
              fullName={fullName}
              username={username}
              role={user?.role}
              isVerified={!!identityNumber}
              onChangeAvatar={handleChangeAvatar}
            />
          </SafeAreaView>
        </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>

        {/* Quick Stats Cards */}
        <QuickStatsCards
          email={email}
          username={username}
          isVerified={!!identityNumber}
        />

        {identityNumber ? (
          // Interface for verified users
          <>
            {/* Identity Section - Non-editable */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={['#BAFD00', '#9FE600']}
                  style={styles.sectionGradientIndicator} />
                <Text style={styles.sectionTitle}>Thông tin định danh</Text>
              </View>
              <View style={styles.fieldContainer}>
                <InfoField
                  icon={Icons.IconCCCD}
                  iconBgColor="#E3F2FD"
                  label="Số CMND/CCCD"
                  value={identityNumber}
                />
                <InfoField
                  icon={Icons.IconBirthDate}
                  iconBgColor="#FCE4EC"
                  label="Ngày sinh"
                  value={birthDate ? formatDate(birthDate) : undefined}
                />

                <InfoField
                  icon={Icons.IconLocationHome}
                  iconBgColor="#FFF3E0"
                  label="Địa chỉ thường trú"
                  value={address || 'Chưa cập nhật'}
                />
              </View>
            </View>
            {/* Contact Section - Editable */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={['#4CAF50', '#45A049']}
                  style={styles.sectionGradientIndicator} />
                <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
              </View>
              <View style={styles.fieldContainer}>
                <EditableInfoField
                  icon={Icons.IconPhone}
                  iconBgColor="#E8F5E9"
                  label="SỐ ĐIỆN THOẠI"
                  value={phone}
                  onPress={() => {
                    setTempPhone(phone);
                    setIsEditingPhone(true);
                  }}
                />
                <EditableInfoField
                  icon={Icons.IconEmail}
                  iconBgColor="#E3F2FD"
                  label="EMAIL"
                  value={email}
                  onPress={() => {
                    setTempEmail(email);
                    setIsEditingEmail(true);
                  }}
                />
              </View>
            </View>
          </>
        ) : (
          // Interface for unverified users
          <>
            {/* Verification Required Card */}
            <VerificationCard onVerify={handleVerifyAccount} />
            {/* Contact Info Section - Editable for unverified users */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={['#4CAF50', '#45A049']}
                  style={styles.sectionGradientIndicator} />
                <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
                <View style={styles.infoBadge}>
                  <Text style={styles.infoBadgeText}>Có thể chỉnh sửa</Text>
                </View>
              </View>
              <View style={styles.fieldContainer}>
                <EditableInfoField
                  icon={Icons.IconPhone}
                  iconBgColor="#E8F5E9"
                  label="SỐ ĐIỆN THOẠI"
                  value={phone}
                  onPress={() => {
                    setTempPhone(phone);
                    setIsEditingPhone(true);
                  }}
                />
                <EditableInfoField
                  icon={Icons.IconEmail}
                  iconBgColor="#E3F2FD"
                  label="EMAIL"
                  value={email}
                  onPress={() => {
                    setTempEmail(email);
                    setIsEditingEmail(true);
                  }}
                />
              </View>
            </View>
            {/* Basic Info Section - Locked */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={['#BDBDBD', '#9E9E9E']}
                  style={styles.sectionGradientIndicator} />
                <Text style={styles.sectionTitle}>Thông tin định danh</Text>
                                  <View style={styles.lockedBadge}>
                    <Image source={{uri: Icons.IconWarning}} style={styles.lockBadgeIcon} />
                    <Text style={styles.lockedBadgeText}>Cần xác thực</Text>
                  </View>
              </View>
              <View style={styles.fieldContainer}>
                <View style={styles.blurredField}>
                  <View style={styles.blurredIconContainer}>
                    <Image source={{uri: Icons.IconCCCD}} style={styles.blurredIcon} />
                  </View>
                  <View style={styles.blurredContent}>
                    <Text style={styles.blurredLabel}>SỐ CMND/CCCD</Text>
                    <View style={styles.blurredValue}>
                      <Text style={styles.blurredText}>••••••••••••</Text>
                      <Image source={{uri: Icons.IconWarning}} style={styles.miniLockIcon} />
                    </View>
                  </View>
                </View>
                <View style={styles.blurredField}>
                  <View style={styles.blurredIconContainer}>
                    <Image source={{uri: Icons.IconBirthDate}} style={styles.blurredIcon} />
                  </View>
                  <View style={styles.blurredContent}>
                    <Text style={styles.blurredLabel}>NGÀY SINH</Text>
                    <View style={styles.blurredValue}>
                      <Text style={styles.blurredText}>••/••/••••</Text>
                      <Image source={{uri: Icons.IconWarning}} style={styles.miniLockIcon} />
                    </View>
                  </View>
                </View>
                <View style={styles.blurredField}>
                  <View style={styles.blurredIconContainer}>
                    <Image source={{uri: Icons.IconLocationHome}} style={styles.blurredIcon} />
                  </View>
                  <View style={styles.blurredContent}>
                    <Text style={styles.blurredLabel}>ĐỊA CHỈ THƯỜNG TRÚ</Text>
                    <View style={styles.blurredValue}>
                      <Text style={styles.blurredText}>•••••••••••••••••</Text>
                      <Image source={{uri: Icons.IconWarning}} style={styles.miniLockIcon} />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Removed Update Button */}
        {/* Footer Space */}
        <View style={{height: verticalScale(20)}} />
      </ScrollView>
      {/* Phone Edit Modal */}
      <Suspense fallback={null}>
        <EditModal
        visible={isEditingPhone}
        title="Cập nhật số điện thoại"
        value={tempPhone}
        onChangeText={setTempPhone}
        onSave={handleSavePhone}
        onCancel={() => setIsEditingPhone(false)}
        placeholder="Nhập số điện thoại"
        keyboardType="phone-pad"
        maxLength={11}
        />
      </Suspense>

      {/* Email Edit Modal */}
      <Suspense fallback={null}>
        <EditModal
        visible={isEditingEmail}
        title="Cập nhật email"
        value={tempEmail}
        onChangeText={setTempEmail}
        onSave={handleSaveEmail}
        onCancel={() => setIsEditingEmail(false)}
        placeholder="Nhập email"
        keyboardType="email-address"
        autoCapitalize="none"
        />
      </Suspense>

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
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  gradientHeader: {
    paddingBottom: verticalScale(30),  // Giảm padding bottom để gần hơn
  },
  content: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    marginTop: verticalScale(-20),
  },
  contentContainer: {
    paddingTop: verticalScale(5),  // Giảm padding top để gần hơn
  },
  section: {
    marginBottom: verticalScale(20),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(20),
    marginBottom: verticalScale(12),
  },
  sectionIndicator: {
    width: scale(4),
    height: verticalScale(20),
    backgroundColor: '#BAFD00',
    borderRadius: scale(2),
    marginRight: scale(10),
  },
  sectionGradientIndicator: {
    width: scale(4),
    height: verticalScale(20),
    borderRadius: scale(2),
    marginRight: scale(10),
  },
  sectionTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.dearkOlive,
    letterSpacing: 0.2,
  },
  fieldContainer: {
    paddingHorizontal: responsiveSpacing(20),
  },
  updateButton: {
    marginHorizontal: responsiveSpacing(20),
    marginBottom: verticalScale(10),
  },
  buttonGradient: {
    paddingVertical: verticalScale(15),
    borderRadius: scale(12),
    alignItems: 'center',
    shadowColor: '#BAFD00',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    fontSize: responsiveFont(16),
    color: Colors.dearkOlive,
    fontFamily: Fonts.Roboto_Bold,
    letterSpacing: 0.5,
  },
  lockedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: scale(12),
    marginLeft: 'auto',
  },
  lockIcon: {
    width: scale(12),
    height: scale(12),
    tintColor: '#757575',
    marginRight: scale(4),
  },
  lockedText: {
    fontSize: responsiveFont(11),
    fontFamily: Fonts.Roboto_Medium,
    color: '#757575',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: scale(10),
    marginLeft: 'auto',
  },
  lockBadgeIcon: {
    width: scale(12),
    height: scale(12),
    tintColor: '#757575',
    marginRight: scale(4),
  },
  lockedBadgeText: {
    fontSize: responsiveFont(10),
    fontFamily: Fonts.Roboto_Medium,
    color: '#616161',
  },
  blurredField: {
    backgroundColor: '#FAFAFA',
    borderRadius: scale(14),
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(16),
    marginBottom: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    opacity: 0.7,
  },
  blurredIconContainer: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(12),
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(14),
  },
  blurredIcon: {
    width: scale(22),
    height: scale(22),
    tintColor: '#BDBDBD',
  },
  blurredContent: {
    flex: 1,
  },
  blurredLabel: {
    fontSize: responsiveFont(12),
    color: '#9E9E9E',
    fontFamily: Fonts.Roboto_Regular,
    marginBottom: scale(4),
    letterSpacing: 0.5,
  },
  blurredValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  blurredText: {
    fontSize: responsiveFont(15),
    color: '#BDBDBD',
    fontFamily: Fonts.Roboto_Medium,
    letterSpacing: 2,
  },
  miniLockIcon: {
    width: scale(16),
    height: scale(16),
    tintColor: '#9E9E9E',
  },
  unlockPrompt: {
    marginTop: verticalScale(10),
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(20),
  },
  unlockText: {
    fontSize: responsiveFont(13),
    fontFamily: Fonts.Roboto_Medium,
    color: '#FF9800',
    textAlign: 'center',
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: scale(10),
    marginLeft: 'auto',
  },
  infoBadgeText: {
    fontSize: responsiveFont(10),
    fontFamily: Fonts.Roboto_Medium,
    color: '#2E7D32',
  },
});

export default PersonalInformation;
