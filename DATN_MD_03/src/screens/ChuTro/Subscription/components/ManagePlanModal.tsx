import React from 'react';
import {Modal, View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, scale, verticalScale, SCREEN} from '../../../../utils/responsive';
import {SubscriptionRecord} from '../../../../types';

type Props = {
  visible: boolean;
  onClose: () => void;
  subscription: SubscriptionRecord | null;
  planName?: string;
};

const formatDate = (d?: string) => {
  if (!d) { return '-'; }
  const date = new Date(d);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const diffDays = (end?: string) => {
  if (!end) { return undefined; }
  const now = new Date();
  const endAt = new Date(end);
  const ms = endAt.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

export default function ManagePlanModal({visible, onClose, subscription, planName}: Props) {
  const daysLeft = diffDays(subscription?.endAt);
  const status = (subscription?.status || '').toLowerCase();
  const statusText = status === 'active' ? 'Đang hiệu lực' : 'Hết hiệu lực';
  const statusColor = status === 'active' ? '#16a34a' : '#ef4444';
  const getPaymentMethodText = (pm?: string) => {
    const key = (pm || '').toLowerCase();
    switch (key) {
      case 'bank_transfer':
      case 'bank-transfer':
        return 'Chuyển khoản ngân hàng';
      case 'momo':
      case 'wallet':
        return 'Ví điện tử';
      case 'cash':
        return 'Tiền mặt';
      default:
        return pm || '-';
    }
  };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <LinearGradient colors={['#BAFD00', '#E9FFB7']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.headerGrad}>
            <Text style={styles.title}>Quản lý gói</Text>
            <View style={[styles.statusChip, {backgroundColor: statusColor}]}> 
              <Text style={styles.statusChipText}>{statusText}</Text>
            </View>
          </LinearGradient>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Gói hiện tại</Text>
            <Text style={styles.value}>{planName || subscription?.plan}</Text>
          </View>
          {/* Trạng thái đã hiển thị ở header, tránh lặp lại */}
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Bắt đầu</Text>
            <Text style={styles.value}>{formatDate(subscription?.startAt)}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Kết thúc</Text>
            <Text style={styles.value}>{formatDate(subscription?.endAt)}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Còn lại</Text>
            <Text style={styles.value}>{daysLeft !== undefined ? `${daysLeft} ngày` : '-'}</Text>
          </View>
          {!!subscription?.paymentMethod && (
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Phương thức</Text>
              <Text style={styles.value}>{getPaymentMethodText(subscription?.paymentMethod)}</Text>
            </View>
          )}

          <TouchableOpacity onPress={onClose} style={styles.btn} activeOpacity={0.8}>
            <Text style={styles.btnText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(16),
  },
  sheet: {
    width: SCREEN.width - scale(24),
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  headerGrad: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  title: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(18),
    color: Colors.dearkOlive,
    textAlign: 'center',
  },
  statusChip: {
    marginTop: verticalScale(6),
    alignSelf: 'center',
    borderRadius: 999,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
  },
  statusChipText: {
    color: '#fff',
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(11),
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  label: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(13),
    color: '#6b7280',
  },
  value: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(13),
    color: Colors.dearkOlive,
  },
  btn: {
    marginTop: verticalScale(12),
    alignSelf: 'center',
    backgroundColor: Colors.dearkOlive,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    borderRadius: 12,
    marginBottom: verticalScale(12),
  },
  btnText: {
    color: '#fff',
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(14),
  },
});


