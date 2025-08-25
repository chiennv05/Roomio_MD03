import React, {useState} from 'react';
import {View, StyleSheet, Text, Image, TouchableOpacity, ScrollView, StatusBar} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../../store';
import {AppDispatch} from '../../../store';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {SCREEN, responsiveFont, scale, verticalScale, responsiveSpacing} from '../../../utils/responsive';
import HeaderWithBack from '../TenantList/components/HeaderWithBack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';
import {createSubscriptionUpgrade} from '../../../store/slices/subscriptionSlice';
import {Icons} from '../../../assets/icons';
import RNFS from 'react-native-fs';
import CustomAlertModal from '../../../components/CustomAlertModal';

export default function SubscriptionPaymentScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const {quote, bankInfo, current, plans} = useSelector((s: RootState) => s.subscription);
  const token = useSelector((s: RootState) => s.auth.token);
  const insets = useSafeAreaInsets();
  
  // State cho CustomAlertModal
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'error' | 'success' | 'warning' | 'info'>('info');
  
  const priceText = quote?.expectedAmount && quote.expectedAmount > 0
    ? `${quote.expectedAmount.toLocaleString('vi-VN')} ${quote?.currency || 'VND'}`
    : 'Miễn phí';

  const getPlanNameByKey = (key?: string) => {
    if (!key) { return undefined; }
    const k = key.toLowerCase();
    const found = plans?.find(p => (p.key || '').toLowerCase() === k);
    return found?.name || key;
  };
  const currentName = getPlanNameByKey(current?.plan || 'free') || (current?.plan || 'Free');
  const targetName = quote?.planName || getPlanNameByKey(quote?.plan) || quote?.plan || '';

  const showAlert = (title: string, message: string, type: 'error' | 'success' | 'warning' | 'info' = 'info') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const handleDownloadQR = async () => {
    if (!quote?.qrUrl) {
      showAlert('Lỗi', 'Không có mã QR để tải xuống', 'error');
      return;
    }

    try {
      // Tạo tên file với timestamp
      const timestamp = new Date().getTime();
      const fileName = `roomio_qr_${timestamp}.png`;
      const filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

      // Tải ảnh QR từ URL và lưu vào thư mục Download
      const downloadResult = await RNFS.downloadFile({
        fromUrl: quote.qrUrl,
        toFile: filePath,
        background: true,
        discretionary: true,
        progress: (res) => {
          console.log(`Downloaded ${res.bytesWritten} of ${res.contentLength} bytes`);
        },
      }).promise;

      if (downloadResult.statusCode === 200) {
        showAlert('Thành công', 'Đã tải mã QR vào thư mục Download', 'success');
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Lỗi khi tải QR code:', error);
      showAlert('Lỗi', 'Không thể tải xuống mã QR. Vui lòng thử lại.', 'error');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#BAFD00', '#F4F4F4']} start={{x: 0, y: 0}} end={{x: 0, y: 1}} style={[styles.header, {paddingTop: insets.top + responsiveSpacing(8)}]}>
        <HeaderWithBack title="Thanh toán nâng cấp" backgroundColor="transparent" />
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.qrCard}>
          {/* Bỏ khung tiêu đề trong thẻ theo yêu cầu */}
          {!!quote?.qrUrl && (
            <View style={styles.qrContainer}>
              <Image source={{uri: quote.qrUrl}} style={styles.qr} resizeMode="contain" />
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={handleDownloadQR}
                activeOpacity={0.8}
              >
                <Image source={{uri: Icons.IconDownLoad}} style={styles.downloadIcon} />
                <Text style={styles.downloadText}>Tải QR</Text>
              </TouchableOpacity>
            </View>
          )}
          {!!targetName && (
            <View style={styles.routePill}>
              <Text style={styles.routeFrom}>{currentName}</Text>
              <Image source={{uri: Icons.IconArrowRight}} style={styles.routeArrowIcon} />
              <Text style={styles.routeTo}>{targetName}</Text>
            </View>
          )}
          <View style={styles.infoBox}>
            <View style={styles.rowBetween}><Text style={styles.label}>Số tiền</Text><Text style={styles.value}>{priceText}</Text></View>
            {!!quote?.transferNote && (
              <View style={styles.rowBetween}><Text style={styles.label}>Nội dung CK</Text><Text style={styles.value}>{quote.transferNote}</Text></View>
            )}
            {!!bankInfo && (
              <>
                <View style={styles.rowBetween}><Text style={styles.label}>Ngân hàng</Text><Text style={styles.value}>{bankInfo.bankName}</Text></View>
                <View style={styles.rowBetween}><Text style={styles.label}>Số tài khoản</Text><Text style={styles.value}>{bankInfo.accountNumber}</Text></View>
                <View style={styles.rowBetween}><Text style={styles.label}>Chủ tài khoản</Text><Text style={styles.value}>{bankInfo.accountHolder}</Text></View>
              </>
            )}
            <Text style={styles.noteStrong}>Lưu ý: BẮT BUỘC ghi đúng nội dung chuyển khoản như hiển thị để hệ thống tự động đối soát.</Text>
            <Text style={styles.note}>Sau khi chuyển khoản, yêu cầu sẽ được gửi đến Admin để duyệt. Bạn sẽ nhận thông báo khi gói được kích hoạt.</Text>
          </View>
          <TouchableOpacity
            style={styles.btn}
            activeOpacity={0.8}
            onPress={() => {
              if (!token || !quote?.plan) { return; }
              dispatch(createSubscriptionUpgrade({token, plan: quote.plan})).then(() => {
                // sau khi gửi yêu cầu, quay lại màn gói đăng ký
                navigation.goBack();
              });
            }}
          >
            <Text style={styles.btnText}>Đã chuyển khoản</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <CustomAlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.backgroud},
  header: {width: SCREEN.width, paddingBottom: responsiveSpacing(6), paddingHorizontal: scale(16), borderBottomLeftRadius: 24, borderBottomRightRadius: 24},
  content: {padding: scale(16)},
  qrCard: {backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 1, paddingTop: verticalScale(12)},
  qrContainer: {position: 'relative', alignItems: 'center'},
  qr: {alignSelf: 'center', width: SCREEN.width - scale(60), height: SCREEN.width - scale(60), marginVertical: verticalScale(10)},
  downloadButton: {
    position: 'absolute',
    top: verticalScale(10),
    right: scale(10),
    backgroundColor: Colors.dearkOlive,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  downloadIcon: {width: scale(16), height: scale(16), tintColor: '#fff', marginRight: scale(4)},
  downloadText: {color: '#fff', fontFamily: Fonts.Roboto_Bold, fontSize: responsiveFont(12)},
  routePill: {alignSelf: 'center', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 999, paddingHorizontal: scale(10), paddingVertical: verticalScale(6), marginBottom: verticalScale(6)},
  routeFrom: {fontFamily: Fonts.Roboto_Bold, fontSize: responsiveFont(12), color: '#374151', marginRight: scale(6)},
  routeArrowIcon: {width: scale(6), height: scale(12), tintColor: '#111827', marginRight: scale(6)},
  routeTo: {fontFamily: Fonts.Roboto_Bold, fontSize: responsiveFont(12), color: Colors.black},
  infoBox: {margin: scale(12), borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E5E7EB'},
  rowBetween: {flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: scale(14), paddingVertical: verticalScale(10), borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB'},
  label: {fontFamily: Fonts.Roboto_Regular, fontSize: responsiveFont(13), color: '#6b7280'},
  value: {fontFamily: Fonts.Roboto_Bold, fontSize: responsiveFont(13), color: Colors.dearkOlive},
  noteStrong: {paddingHorizontal: scale(12), paddingTop: verticalScale(10), fontFamily: Fonts.Roboto_Bold, fontSize: responsiveFont(12), color: Colors.error},
  note: {padding: scale(12), paddingTop: verticalScale(6), fontFamily: Fonts.Roboto_Regular, fontSize: responsiveFont(12), color: '#374151'},
  btn: {alignSelf: 'center', backgroundColor: Colors.dearkOlive, paddingHorizontal: scale(16), paddingVertical: verticalScale(10), borderRadius: 12, marginBottom: verticalScale(14)},
  btnText: {color: '#fff', fontFamily: Fonts.Roboto_Bold, fontSize: responsiveFont(14)},
});


