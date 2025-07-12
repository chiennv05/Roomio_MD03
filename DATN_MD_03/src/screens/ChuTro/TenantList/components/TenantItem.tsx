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

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      {/* Thông tin phòng */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Image source={{uri: Icons.IconHome}} style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>Thông tin phòng</Text>
        </View>
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
            <Text style={styles.roomNumber}>Phòng: {item.room?.roomNumber}</Text>
            <Text style={styles.rentInfo}>
              Tiền thuê: {item.monthlyRent?.toLocaleString('vi-VN')} VNĐ
            </Text>
            <Text style={styles.dateInfo}>
              Thuê từ: {formatDate(item.contractStartDate)}
            </Text>
          </View>
        </View>
      </View>

      {/* Người đại diện thuê */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Image source={{uri: Icons.IconPersonDefault}} style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>Người đại diện thuê</Text>
        </View>
        <View style={styles.mainTenantInfo}>
          <Text style={styles.mainTenantName}>{item.fullName}</Text>
          <View style={styles.contactRow}>
            <Image source={{uri: Icons.IconHome}} style={styles.smallIcon} />
            <Text style={styles.contactText}>{item.phone}</Text>
          </View>
        </View>
      </View>

      {/* Người ở cùng */}
      {item.coTenants && item.coTenants.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Image source={{uri: Icons.IconHome}} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>
              Người ở cùng ({item.coTenants.length} người)
            </Text>
          </View>
          <View style={styles.coTenantsContainer}>
            {item.coTenants.map((coTenant: any, index: number) => (
              <View key={coTenant._id} style={styles.coTenantItem}>
                <Text style={styles.coTenantName}>
                  {index + 1}. {coTenant.fullName}
                </Text>
                <View style={styles.contactRow}>
                  <Image source={{uri: Icons.IconHome}} style={styles.smallIcon} />
                  <Text style={styles.contactText}>{coTenant.phone}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    padding: scale(12),
    marginBottom: scale(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  section: {
    marginBottom: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    paddingBottom: scale(12),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(8),
    backgroundColor: Colors.lightGray,
    padding: scale(8),
    borderRadius: scale(8),
  },
  sectionIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: Colors.darkGreen,
    marginRight: scale(8),
  },
  sectionTitle: {
    fontSize: responsiveFont(15),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGreen,
  },
  roomInfo: {
    flexDirection: 'row',
  },
  roomImageContainer: {
    width: scale(80),
    height: scale(80),
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
    justifyContent: 'center',
  },
  roomNumber: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: scale(4),
  },
  rentInfo: {
    fontSize: responsiveFont(14),
    color: Colors.textGray,
    marginBottom: scale(4),
  },
  dateInfo: {
    fontSize: responsiveFont(14),
    color: Colors.textGray,
  },
  mainTenantInfo: {
    backgroundColor: Colors.white,
    borderRadius: scale(8),
    padding: scale(8),
  },
  mainTenantName: {
    fontSize: responsiveFont(15),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: scale(4),
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(4),
  },
  smallIcon: {
    width: scale(16),
    height: scale(16),
    tintColor: Colors.darkGreen,
    marginRight: scale(4),
  },
  contactText: {
    fontSize: responsiveFont(14),
    color: Colors.textGray,
  },
  coTenantsContainer: {
    gap: scale(8),
  },
  coTenantItem: {
    backgroundColor: Colors.white,
    borderRadius: scale(8),
    padding: scale(8),
  },
  coTenantName: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: scale(2),
  },
});

export default TenantItem; 