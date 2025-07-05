import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Tenant} from '../../../../types/Tenant';
import {RootStackParamList} from '../../../../types/route';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {
  responsiveFont,
  scale,
  verticalScale,
} from '../../../../utils/responsive';
import {Icons} from '../../../../assets/icons';
import {getImageUrl} from '../../../../configs';
import StatusBadge from './StatusBadge';

type TenantListNavigationProp = StackNavigationProp<RootStackParamList>;

interface TenantItemProps {
  item: Tenant;
}

const TenantItem: React.FC<TenantItemProps> = ({item}) => {
  const navigation = useNavigation<TenantListNavigationProp>();

  // Format ngày tháng
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Không có';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Format tiền
  const formatMoney = (money: number) => {
    if (!money && money !== 0) return 'Không có';
    return money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " VNĐ";
  };

  // Xử lý URL hình ảnh phòng
  const getRoomPhotoUrl = (photoPath: string) => {
    if (!photoPath) return '';
    // Nếu là URL đầy đủ, trả về nguyên gốc
    if (photoPath.startsWith('http')) return photoPath;
    // Nếu là đường dẫn tương đối, thêm baseUrl
    return getImageUrl(photoPath);
  };

  // Xử lý khi nhấn vào người thuê
  const handleTenantPress = () => {
    navigation.navigate('TenantDetail', { tenantId: item._id });
  };

  return (
    <TouchableOpacity style={styles.tenantItem} onPress={handleTenantPress}>
      <View style={styles.avatarContainer}>
        {item.room.photo ? (
          <Image 
            source={{uri: getRoomPhotoUrl(item.room.photo)}} 
            style={styles.avatar} 
            defaultSource={Icons.IconFluentPersonRegular as any}
          />
        ) : (
          <Image source={Icons.IconFluentPersonRegular as any} style={styles.avatar} />
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.nameText}>{item.fullName}</Text>
        <Text style={styles.detailText}>SĐT: {item.phone}</Text>
        <Text style={styles.detailText}>Phòng: {item.room.roomNumber}</Text>
        <Text style={styles.detailText}>
          Thuê từ: {formatDate(item.contractStartDate)}
        </Text>
        <Text style={styles.detailText}>
          Tiền thuê: {formatMoney(item.monthlyRent)}
        </Text>
      </View>

      <StatusBadge status={item.contractStatus} size="small" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tenantItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: scale(12),
    marginBottom: verticalScale(10),
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: scale(12),
  },
  avatar: {
    width: scale(50),
    height: scale(50),
    borderRadius: 25,
    backgroundColor: Colors.lightGray,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: verticalScale(5),
  },
  detailText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.darkGray,
    marginBottom: verticalScale(2),
  },
});

export default TenantItem; 