import React from 'react';
import {Modal, View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, scale, verticalScale, SCREEN} from '../../../../utils/responsive';

type Props = {
  visible: boolean;
  onClose: () => void;
  qrUrl?: string;
  amount?: number | null;
  currency?: string;
  transferNote?: string;
  planName?: string;
};

export default function PaymentQRModal({visible, onClose, qrUrl, amount, currency, transferNote, planName}: Props) {
  const priceText = amount && amount > 0 ? `${amount.toLocaleString('vi-VN')} ${currency || 'VND'}` : 'Miễn phí';
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <LinearGradient colors={['#BAFD00', '#E9FFB7']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.headerGrad}>
            <Text style={styles.title}>Thanh toán nâng cấp</Text>
            {!!planName && <Text style={styles.subtitle}>{planName}</Text>}
          </LinearGradient>
          <View style={styles.content}>
            {qrUrl ? (
              <Image source={{uri: qrUrl}} style={styles.qr} resizeMode="contain" />
            ) : (
              <View style={styles.qrPlaceholder} />
            )}
            <View style={styles.infoBox}>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Số tiền</Text>
                <Text style={styles.value}>{priceText}</Text>
              </View>
              {!!transferNote && (
                <View style={styles.rowBetween}>
                  <Text style={styles.label}>Nội dung CK</Text>
                  <Text style={styles.value}>{transferNote}</Text>
                </View>
              )}
              <Text style={styles.note}>Sau khi chuyển khoản, yêu cầu sẽ được gửi đến Admin để duyệt. Bạn sẽ nhận thông báo khi gói được kích hoạt.</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.btn} activeOpacity={0.8}>
            <Text style={styles.btnText}>Đã hiểu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', padding: scale(16)},
  sheet: {width: SCREEN.width - scale(24), backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden'},
  headerGrad: {paddingHorizontal: scale(16), paddingVertical: verticalScale(14), alignItems: 'center'},
  title: {fontFamily: Fonts.Roboto_Bold, fontSize: responsiveFont(18), color: Colors.dearkOlive},
  subtitle: {marginTop: verticalScale(4), fontFamily: Fonts.Roboto_Bold, fontSize: responsiveFont(13), color: '#111827'},
  content: {padding: scale(16), alignItems: 'center'},
  qr: {width: SCREEN.width - scale(120), height: SCREEN.width - scale(120), borderRadius: 12, backgroundColor: '#fff'},
  qrPlaceholder: {width: SCREEN.width - scale(120), height: SCREEN.width - scale(120), borderRadius: 12, backgroundColor: '#E5E7EB'},
  infoBox: {marginTop: verticalScale(14), width: '100%', borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E5E7EB'},
  rowBetween: {flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: scale(14), paddingVertical: verticalScale(10), borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB'},
  label: {fontFamily: Fonts.Roboto_Regular, fontSize: responsiveFont(13), color: '#6b7280'},
  value: {fontFamily: Fonts.Roboto_Bold, fontSize: responsiveFont(13), color: Colors.dearkOlive},
  note: {padding: scale(12), fontFamily: Fonts.Roboto_Regular, fontSize: responsiveFont(12), color: '#374151'},
  btn: {marginTop: verticalScale(6), alignSelf: 'center', backgroundColor: Colors.dearkOlive, paddingHorizontal: scale(16), paddingVertical: verticalScale(10), borderRadius: 12, marginBottom: verticalScale(12)},
  btnText: {color: '#fff', fontFamily: Fonts.Roboto_Bold, fontSize: responsiveFont(14)},
});


