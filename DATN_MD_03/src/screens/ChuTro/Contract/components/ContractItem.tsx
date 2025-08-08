import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {
  scale,
  responsiveFont,
  verticalScale,
  SCREEN,
} from '../../../../utils/responsive';
import {Contract} from '../../../../types';

// Hàm lấy thông tin trạng thái
export const getContractStatusInfo = (status: string) => {
  switch (status) {
    case 'draft':
      return {
        label: 'Bản nháp',
        color: Colors.textGray,
        backgroudColor: Colors.gray,
        backgroudStatus: Colors.white,
        textColor: Colors.white,
        textColorLabel: Colors.gray200,
      };
    case 'pending_signature':
      return {
        label: 'Chờ ký',
        color: Colors.black,
        backgroudColor: Colors.limeGreen,
        backgroudStatus: Colors.white,
        textColor: Colors.dearkOlive,
        textColorLabel: Colors.darkGray,
      };
    case 'pending_approval':
      return {
        label: 'Chờ phê duyệt',
        color: Colors.black,
        backgroudColor: Colors.limeGreenOpacity,
        backgroudStatus: Colors.white,
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
        color: Colors.textGray,
        backgroudColor: Colors.textGray,
        backgroudStatus: Colors.white,
        textColor: Colors.white,
        textColorLabel: Colors.gray200,
      };
    case 'terminated':
      return {
        label: 'Đã chấm dứt',
        color: Colors.red,
        backgroudColor: Colors.textGray,
        backgroudStatus: Colors.white,
        textColor: Colors.white,
        textColorLabel: Colors.gray200,
      };
    case 'needs_resigning':
      return {
        label: 'Cần ký lại',
        color: Colors.red,
        backgroudColor: Colors.textGray,
        backgroudStatus: Colors.white,
        textColor: Colors.white,
        textColorLabel: Colors.gray200,
      };
    case 'rejected':
      return {
        label: 'Bị từ chối',
        color: Colors.textGray,
        backgroudColor: Colors.textGray,
        backgroudStatus: Colors.white,
        textColor: Colors.white,
        textColorLabel: Colors.gray200,
      };
    default:
      return {
        label: 'Không xác định',
        color: Colors.textGray,
        backgroudColor: Colors.textGray,
        backgroudStatus: Colors.white,
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
      style={[styles.container, {backgroundColor: statusInfo.backgroudColor}]}
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
    borderRadius: 10,
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
    padding: scale(12),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  roomNumber: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(16),
    color: Colors.black,
  },
  statusBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
    borderRadius: 12,
  },
  statusText: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(12),
    color: Colors.white,
  },
  address: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(16),
    color: Colors.gray60,
    fontWeight: 'bold',
    marginBottom: verticalScale(8),
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: verticalScale(2),
  },
  label: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(13),
    color: Colors.textGray,
    width: scale(85),
  },
  value: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(16),
    color: Colors.black,
    flex: 1,
    fontWeight: '500',
  },
});

export default ContractItem;
