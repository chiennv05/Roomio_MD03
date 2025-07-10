import React from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, responsiveSpacing} from '../../../../utils/responsive';

interface RecentContractItemProps {
  roomNumber: string;
  roomPhoto: string;
  tenantName: string;
  status: string;
  date: string;
  onPress: () => void;
}

const RecentContractItem = ({
  roomNumber,
  roomPhoto,
  tenantName,
  status,
  date,
  onPress,
}: RecentContractItemProps) => {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'đang hiệu lực':
        return Colors.darkGreen;
      case 'pending_approval':
      case 'chờ ký':
        return Colors.mediumGray;
      case 'expired':
      case 'hết hạn':
        return Colors.red;
      default:
        return Colors.textGray;
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Đang hiệu lực';
      case 'pending_approval':
        return 'Chờ ký';
      case 'expired':
        return 'Hết hạn';
      default:
        return status;
    }
  };

  const statusColor = getStatusColor(status);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.borderLeft, {backgroundColor: statusColor}]} />
      <Image
        source={
          roomPhoto
            ? {uri: roomPhoto}
            : require('../../../../assets/images/image_backgroud_button.png')
        }
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.roomNumber} numberOfLines={1}>
          Phòng {roomNumber}
        </Text>
        <Text style={styles.tenantName} numberOfLines={1}>
          {tenantName}
        </Text>
        <View style={styles.footer}>
          <Text style={[styles.status, {color: statusColor}]}>
            {getStatusText(status)}
          </Text>
          <Text style={styles.date}>{formatDate(date)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RecentContractItem;

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
  image: {
    width: 100,
    height: 100,
  },
  content: {
    flex: 1,
    padding: responsiveSpacing(12),
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: responsiveSpacing(4),
  },
  status: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
  },
  date: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
  },
});
