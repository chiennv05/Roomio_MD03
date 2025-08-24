import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {
  scale,
  responsiveFont,
  verticalScale,
  SCREEN,
  responsiveSpacing,
} from '../../../../utils/responsive';
import {Contract} from '../../../../types';

// Hàm lấy thông tin trạng thái
export const getContractStatusInfo = (status: string) => {
  switch (status) {
    case 'draft':
      return {
        label: 'Bản nháp',
        color: Colors.black,
        backgroudColor: Colors.gray,
        backgroudStatus: Colors.mediumGray,
        textColor: Colors.dearkOlive,
        textColorLabel: Colors.darkGray,
      };
    case 'pending_signature':
      return {
        label: 'Chờ ký',
        color: Colors.black,
        backgroudColor: Colors.gray,
        backgroudStatus: Colors.mediumGray,
        textColor: Colors.dearkOlive,
        textColorLabel: Colors.darkGray,
      };
    case 'cancelled':
      return {
        label: 'Đã hủy',
        color: Colors.black,
        backgroudColor: Colors.gray,
        backgroudStatus: Colors.lightRed,
        textColor: Colors.dearkOlive,
        textColorLabel: Colors.darkGray,
      };
    case 'pending_approval':
      return {
        label: 'Chờ phê duyệt',
        color: Colors.black,
        backgroudColor: Colors.gray,
        backgroudStatus: '#ffc107',
        textColor: Colors.dearkOlive,
        textColorLabel: Colors.darkGray,
      };
    case 'active':
      return {
        label: 'Đang hiệu lực',
        color: Colors.black,
        backgroudColor: Colors.white,
        backgroudStatus: Colors.limeGreen,
        textColor: Colors.dearkOlive,
        textColorLabel: Colors.darkGray,
      };
    case 'expired':
      return {
        label: 'Hết hạn',
        color: Colors.black,
        backgroudColor: Colors.textGray,
        backgroudStatus: Colors.lightRed,
        textColor: Colors.dearkOlive,
        textColorLabel: Colors.darkGray,
      };
    case 'terminated':
      return {
        label: 'Đã chấm dứt',
        color: Colors.white,
        backgroudColor: Colors.textGray,
        backgroudStatus: Colors.lightRed,
        textColor: Colors.dearkOlive,
        textColorLabel: Colors.darkGray,
      };
    case 'needs_resigning':
      return {
        label: 'Cần ký lại',
        color: Colors.black,
        backgroudColor: Colors.gray,
        backgroudStatus: Colors.mediumGray,
        textColor: Colors.dearkOlive,
        textColorLabel: Colors.darkGray,
      };
    case 'rejected':
      return {
        label: 'Bị từ chối',
        color: Colors.black,
        backgroudColor: Colors.textGray,
        backgroudStatus: Colors.lightRed,
        textColor: Colors.dearkOlive,
        textColorLabel: Colors.darkGray,
      };
    default:
      return {
        label: 'Không xác định',
        color: Colors.white,
        backgroudColor: Colors.gray,
        backgroudStatus: Colors.mediumGray,
        textColor: Colors.dearkOlive,
        textColorLabel: Colors.darkGray,
      };
  }
};

// Format ngày tháng
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

interface ContractItemProps {
  contract: Contract;
  onPress: (contractId: string) => void;
}

const ContractItem = ({contract, onPress}: ContractItemProps) => {
  const statusInfo = getContractStatusInfo(contract.status);

  // const handlePress = () => {
  //   // Chuyển đến màn hình chi tiết hợp đồng
  //   navigation.navigate('ContractDetail', {contractId: contract._id});
  // };

  return (
    <TouchableOpacity
      style={[styles.container, {backgroundColor: Colors.white}]}
      onPress={() => onPress(contract._id)}>
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={[styles.roomNumber, {color: statusInfo.textColor}]}>
            {contract.contractInfo.roomNumber}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusInfo.backgroudStatus,
              },
            ]}>
            <Text style={[styles.statusText, {color: statusInfo.color}]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <Text
          style={[styles.address, {color: statusInfo.textColor}]}
          numberOfLines={1}>
          {contract.contractInfo.roomAddress}
        </Text>

        <View style={styles.infoRow}>
          <Text style={[styles.label, {color: statusInfo.textColorLabel}]}>
            Người thuê:
          </Text>
          <Text style={[styles.value, {color: statusInfo.textColor}]}>
            {contract.contractInfo.tenantName}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, {color: statusInfo.textColorLabel}]}>
            Thời hạn:
          </Text>
          <Text style={[styles.value, {color: statusInfo.textColor}]}>
            {contract.contractInfo.contractTerm} tháng
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, {color: statusInfo.textColorLabel}]}>
            Từ ngày:
          </Text>
          <Text style={[styles.value, {color: statusInfo.textColor}]}>
            {formatDate(contract.contractInfo.startDate)} -{' '}
            {formatDate(contract.contractInfo.endDate)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, {color: statusInfo.textColorLabel}]}>
            Tiền thuê:
          </Text>
          <Text style={[styles.value, {color: statusInfo.textColor}]}>
            {contract.contractInfo.monthlyRent.toLocaleString('vi-VN')} đ/tháng
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN.width * 0.9,
    flexDirection: 'row',

    backgroundColor: Colors.white,
    borderRadius: responsiveSpacing(24),
    marginBottom: verticalScale(12),
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  contentContainer: {
    flex: 4,
    padding: scale(16),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  roomNumber: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(24),
    color: Colors.black,
  },
  statusBadge: {
    borderRadius: 999,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    // Shadow cho Android
    elevation: 4,
  },
  statusText: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(16),
    color: Colors.white,
    paddingVertical: responsiveSpacing(6),
    paddingHorizontal: responsiveSpacing(24),
  },
  address: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(16),
    color: Colors.gray60,
    fontWeight: 'bold',
    marginBottom: verticalScale(12),
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: verticalScale(4),
  },
  label: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(16),
    color: Colors.textGray,
    width: scale(100),
  },
  value: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(16),
    color: Colors.black,
    flex: 1,
    fontWeight: '400',
  },
});

export default ContractItem;
