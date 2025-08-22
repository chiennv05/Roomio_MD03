import React from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, responsiveSpacing} from '../../../../utils/responsive';
import {getFirstImageUrl} from '../../../../utils/imageUtils';

interface ContractCardProps {
  roomNumber: string;
  tenantName: string;
  roomPhoto: string[];
  status: string;
  createdAt: string;
  onPress: () => void;
}

const ContractCard = ({
  roomNumber,
  tenantName,
  roomPhoto,
  status,
  createdAt,
  onPress,
}: ContractCardProps) => {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Get status color and text
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          color: Colors.accentContract,
          text: 'Đang hiệu lực',
          borderColor: Colors.accentContract,
        };
      case 'pending_approval':
        return {
          color: '#F59E0B',
          text: 'Chờ duyệt',
          borderColor: '#F59E0B',
        };
      case 'expired':
        return {
          color: Colors.red,
          text: 'Đã hết hạn',
          borderColor: Colors.red,
        };
      case 'terminated':
        return {
          color: '#6B7280',
          text: 'Đã kết thúc',
          borderColor: '#6B7280',
        };
      case 'draft':
        return {
          color: Colors.mediumGray,
          text: 'Nháp',
          borderColor: Colors.mediumGray,
        };
      case 'cancelled':
        return {
          color: Colors.lightRed,
          text: 'Đã hủy',
          borderColor: Colors.lightRed,
        };
      default:
        return {
          color: Colors.mediumGray,
          text: status,
          borderColor: Colors.mediumGray,
        };
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}>
      <View
        style={[styles.borderLeft, {backgroundColor: statusInfo.borderColor}]}
      />
      <View style={styles.containerImage}>
        <Image
          source={
            roomPhoto && roomPhoto.length > 0
              ? {uri: getFirstImageUrl(roomPhoto)}
              : require('../../../../assets/images/image_backgroud_button.png')
          }
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.roomNumber} numberOfLines={1}>
          Phòng {roomNumber}
        </Text>
        <Text style={styles.tenantName} numberOfLines={1}>
          {tenantName}
        </Text>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, {color: statusInfo.color}]}>
            {statusInfo.text}
          </Text>
          <Text style={styles.dateText}>{formatDate(createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ContractCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    flexDirection: 'row',
    marginHorizontal: responsiveSpacing(16),
    marginBottom: responsiveSpacing(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  borderLeft: {
    width: 5,
    height: '100%',
  },
  containerImage: {
    borderTopEndRadius: 12,
    borderBottomEndRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: responsiveSpacing(100),
    height: responsiveSpacing(100),
  },
  content: {
    flex: 1,
    padding: responsiveSpacing(12),
    justifyContent: 'space-between',
  },
  roomNumber: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
    marginBottom: responsiveSpacing(4),
  },
  tenantName: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    marginBottom: responsiveSpacing(8),
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Medium,
  },
  dateText: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
  },
});
