import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../../types/route';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {scale, responsiveFont} from '../../../../utils/responsive';
import {formatDate} from '../../../../utils/formatDate';
import {Icons} from '../../../../assets/icons';
import {getImageUrl} from '../../../../configs';

type TenantItemNavigationProp = StackNavigationProp<RootStackParamList, 'TenantDetail'>;

interface TenantItemProps {
  item: any;
}

const TenantItem: React.FC<TenantItemProps> = ({item}) => {
  const navigation = useNavigation<TenantItemNavigationProp>();

  const handlePress = () => {
    navigation.navigate('TenantDetail', {tenantId: item._id});
  };

  // Chỉ hiển thị các hợp đồng có trạng thái active
  if (item.contractStatus !== 'active') {
    return null;
  }

  // Tính thời gian còn lại của hợp đồng
  const calculateRemainingMonths = () => {
    const endDate = new Date(item.contractEndDate);
    const today = new Date();
    
    // Tính số tháng giữa hai ngày
    let months = (endDate.getFullYear() - today.getFullYear()) * 12;
    months += endDate.getMonth() - today.getMonth();
    
    // Nếu ngày hiện tại đã qua ngày tương ứng trong tháng kết thúc, giảm đi 1
    if (today.getDate() > endDate.getDate()) {
      months--;
    }
    
    return months > 0 ? months : 0;
  };

  const remainingMonths = calculateRemainingMonths();
  const hasCotenant = item.coTenants && item.coTenants.length > 0;

  return (
    <TouchableOpacity 
      style={[styles.container, {borderLeftColor: Colors.darkGreen, borderLeftWidth: scale(4)}]} 
      onPress={handlePress}
    >
      {/* Thông tin phòng */}
      <View style={styles.roomInfo}>
        <View style={styles.roomImageContainer}>
          {item.room?.photo ? (
            <Image
              source={{uri: getImageUrl(item.room.photo)}}
              style={styles.roomImage}
              defaultSource={{uri: Icons.IconHome}}
            />
          ) : (
            <Image source={{uri: Icons.IconHome}} style={styles.roomImage} />
          )}
        </View>
        <View style={styles.roomDetails}>
          <Text style={styles.roomNumber}>{item.room?.roomNumber}</Text>
          <Text style={styles.rentInfo}>
            {item.monthlyRent?.toLocaleString('vi-VN')} đ/tháng
          </Text>
        </View>
        <View style={[styles.badgeContainer, {backgroundColor: Colors.darkGreen}]}>
          <Text style={styles.badgeText}>Đang hiệu lực</Text>
        </View>
      </View>

      {/* Người đại diện thuê */}
      <View style={[
        styles.tenantInfo, 
        hasCotenant ? {borderBottomWidth: 1, borderBottomColor: Colors.lightGray} : null
      ]}>
        <View style={[styles.avatarContainer, {backgroundColor: Colors.darkGreen}]}>
          <Text style={styles.avatarText}>
            {item.fullName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.tenantDetails}>
          <Text style={styles.tenantName}>{item.fullName}</Text>
          <Text style={[styles.tenantLabel, {color: Colors.darkGreen}]}>Người đại diện thuê</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, {color: Colors.darkGreen}]}>SĐT:</Text>
            <Text style={styles.infoValue}>{item.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, {color: Colors.darkGreen}]}>Thời hạn:</Text>
            <Text style={styles.infoValue}>
              {formatDate(item.contractStartDate)} - {formatDate(item.contractEndDate)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, {color: Colors.darkGreen}]}>Trạng thái:</Text>
            <Text style={styles.infoValue}>Còn {remainingMonths} tháng</Text>
          </View>
        </View>
      </View>

      {/* Người ở cùng */}
      {hasCotenant && (
        <View style={styles.coTenantsContainer}>
          {item.coTenants.map((coTenant: any) => (
            <View key={coTenant._id} style={styles.coTenantRow}>
              <View style={[styles.avatarContainer, styles.smallAvatar, {backgroundColor: Colors.darkGreen}]}>
                <Text style={styles.smallAvatarText}>
                  {coTenant.fullName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.coTenantDetails}>
                <Text style={styles.coTenantName}>{coTenant.fullName}</Text>
                <Text style={[styles.tenantLabel, {color: Colors.darkGreen}]}>Người ở cùng</Text>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, {color: Colors.darkGreen}]}>SĐT:</Text>
                  <Text style={styles.infoValue}>{coTenant.phone}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    marginBottom: scale(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  roomInfo: {
    flexDirection: 'row',
    padding: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    alignItems: 'center',
  },
  roomImageContainer: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(8),
    overflow: 'hidden',
    marginRight: scale(12),
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  roomDetails: {
    flex: 1,
  },
  roomNumber: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGreen,
    marginBottom: scale(4),
  },
  rentInfo: {
    fontSize: responsiveFont(14),
    color: Colors.black,
    marginBottom: scale(4),
  },
  badgeContainer: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(4),
    borderRadius: scale(20),
  },
  badgeText: {
    color: Colors.white,
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Bold,
  },
  tenantInfo: {
    flexDirection: 'row',
    padding: scale(12),
  },
  avatarContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  avatarText: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
  },
  tenantDetails: {
    flex: 1,
  },
  tenantName: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: scale(2),
  },
  tenantLabel: {
    fontSize: responsiveFont(12),
    marginBottom: scale(6),
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: scale(2),
  },
  infoLabel: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Bold,
    width: scale(65),
  },
  infoValue: {
    fontSize: responsiveFont(12),
    color: Colors.black,
    flex: 1,
  },
  coTenantsContainer: {
    padding: scale(12),
    paddingTop: scale(6),
  },
  coTenantRow: {
    flexDirection: 'row',
    marginTop: scale(6),
  },
  smallAvatar: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
  },
  smallAvatarText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
  },
  coTenantDetails: {
    flex: 1,
  },
  coTenantName: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: scale(2),
  },
});

export default TenantItem;