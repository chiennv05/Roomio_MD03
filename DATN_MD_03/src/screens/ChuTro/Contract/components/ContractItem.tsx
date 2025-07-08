import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../../types/route';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {scale, responsiveFont, verticalScale} from '../../../../utils/responsive';

// Hàm lấy thông tin trạng thái
export const getContractStatusInfo = (status: string) => {
  switch (status) {
    case 'draft':
      return {
        label: 'Bản nháp',
        color: Colors.gray60,
      };
    case 'pending_signature':
      return {
        label: 'Chờ ký',
        color: Colors.darkGreen,
      };
    case 'pending_approval':
      return {
        label: 'Chờ phê duyệt',
        color: Colors.darkGreen,
      };
    case 'active':
      return {
        label: 'Đang hoạt động',
        color: Colors.primaryGreen,
      };
    case 'expired':
      return {
        label: 'Hết hạn',
        color: Colors.red,
      };
    case 'terminated':
      return {
        label: 'Đã chấm dứt',
        color: Colors.red,
      };
    default:
      return {
        label: 'Không xác định',
        color: Colors.gray60,
      };
  }
};

// Format ngày tháng
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

interface ContractItemProps {
  contract: any;
}

const ContractItem = ({contract}: ContractItemProps) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const statusInfo = getContractStatusInfo(contract.status);

  const handlePress = () => {
    // Chuyển đến màn hình chi tiết hợp đồng
    navigation.navigate('ContractDetail', {contractId: contract._id});
  };

  const renderThumbnail = () => {
    if (contract.roomId?.photos && contract.roomId.photos.length > 0) {
      // Hiển thị ảnh phòng đầu tiên nếu có
      return (
        <Image
          source={{
            uri: `http://125.212.229.71:4000${contract.roomId.photos[0]}`,
          }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      );
    } else {
      // Hiển thị View màu xám nếu không có ảnh
      return <View style={[styles.thumbnail, {backgroundColor: Colors.gray150}]} />;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      {renderThumbnail()}
      
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.roomNumber}>{contract.contractInfo.roomNumber}</Text>
          <View style={[styles.statusBadge, {backgroundColor: statusInfo.color}]}>
            <Text style={styles.statusText}>{statusInfo.label}</Text>
          </View>
        </View>
        
        <Text style={styles.address} numberOfLines={1}>
          {contract.contractInfo.roomAddress}
        </Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Người thuê:</Text>
          <Text style={styles.value}>{contract.contractInfo.tenantName}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Thời hạn:</Text>
          <Text style={styles.value}>{contract.contractInfo.contractTerm} tháng</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Từ ngày:</Text>
          <Text style={styles.value}>
            {formatDate(contract.contractInfo.startDate)} - {formatDate(contract.contractInfo.endDate)}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Tiền thuê:</Text>
          <Text style={styles.value}>
            {contract.contractInfo.monthlyRent.toLocaleString('vi-VN')} đ/tháng
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
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
  thumbnail: {
    width: scale(100),
    height: '100%',
  },
  contentContainer: {
    flex: 1,
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
    fontSize: responsiveFont(14),
    color: Colors.gray60,
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
    fontSize: responsiveFont(13),
    color: Colors.black,
    flex: 1,
  },
});

export default ContractItem; 