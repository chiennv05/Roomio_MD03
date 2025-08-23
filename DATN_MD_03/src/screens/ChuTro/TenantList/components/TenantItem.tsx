import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import TooltipBubble from './TooltipBubble';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, responsiveSpacing} from '../../../../utils/responsive';
import {Tenant} from '../../../../types/Tenant';
import {RootStackParamList} from '../../../../types/route';
interface TenantItemProps {
  item: Tenant;
}

type NavigationProp = StackNavigationProp<RootStackParamList, 'TenantDetail'>;

const TenantItem: React.FC<TenantItemProps> = ({item}) => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);

  const roomNumber = item.room?.roomNumber || 'N/A';
  const tenantCount = item.tenantCount || 1;
  const price = item.monthlyRent
    ? item.monthlyRent.toLocaleString('vi-VN')
    : '0';

  // Create tenant list with main tenant first, then coTenants (excluding duplicate main tenant)
  const coTenantsFiltered = (item.coTenants || []).filter(
    coTenant => coTenant._id !== item._id,
  );

  const allTenants = [
    {
      _id: item._id,
      fullName: item.fullName,
      isMainTenant: true,
      avatar: item.avatar,
    },
    ...coTenantsFiltered.map(coTenant => ({
      _id: coTenant._id,
      fullName: coTenant.fullName,
      isMainTenant: false,
      avatar: coTenant.avatar,
    })),
  ];

  const handleViewDetail = () => {
    navigation.navigate('TenantDetail', {
      tenantId: item._id,
      ...({tenantData: item} as any),
    });
  };

  const handleAvatarPress = (tenantName: string) => {
    setSelectedTenant(prevName =>
      prevName === tenantName ? null : tenantName,
    );
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const renderTenantAvatars = () => {
    return (
      <View style={styles.avatarContainer}>
        {allTenants.map((tenant, index) => (
          <TouchableOpacity
            key={`${tenant._id}-${index}`}
            style={[
              styles.avatarWrapper,
              index > 0 && styles.avatarWrapperOverlap,
            ]}
            onPress={() => handleAvatarPress(tenant.fullName)}>
            <View style={styles.avatarItemContainer}>
              <TooltipBubble
                text={tenant.fullName}
                visible={selectedTenant === tenant.fullName}
              />
              {tenant.avatar ? (
                <Image
                  source={{uri: tenant.avatar}}
                  style={styles.avatarImage}
                />
              ) : (
                <LinearGradient
                  colors={['#7B9EFF', '#9B7BFF']}
                  style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {getInitials(tenant.fullName)}
                  </Text>
                </LinearGradient>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section with Avatars and Basic Info */}
      <View style={styles.headerSection}>
        <View style={styles.roomImageContainer}>{renderTenantAvatars()}</View>

        <View style={styles.roomBasicInfo}>
          <View style={styles.roomNumberContainer}>
            <Text style={styles.roomNumber}>Phòng: {roomNumber}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoText}>Số người: {tenantCount}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.priceText}>Giá : {price}VNĐ/tháng</Text>
          </View>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity style={styles.actionButton} onPress={handleViewDetail}>
        <Text style={styles.actionButtonText}>Xem chi tiết</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: responsiveSpacing(20),
    padding: responsiveSpacing(16),
    marginBottom: responsiveSpacing(16),
    elevation: 3,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  headerSection: {
    flexDirection: 'row',
    marginBottom: responsiveSpacing(16),
  },
  roomImageContainer: {},
  roomBasicInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: responsiveSpacing(4),
    marginLeft: responsiveSpacing(8),
  },
  roomNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing(8),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing(6),
  },
  roomNumber: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  infoText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    fontWeight: '400',
  },
  priceText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    fontWeight: '400',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarItemContainer: {
    position: 'relative',
  },
  avatarWrapper: {},
  avatarWrapperOverlap: {
    marginLeft: responsiveSpacing(-24),
  },
  avatar: {
    width: responsiveSpacing(66),
    height: responsiveSpacing(66),
    borderRadius: responsiveSpacing(33),
    backgroundColor: Colors.darkGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: responsiveSpacing(66),
    height: responsiveSpacing(66),
    borderRadius: responsiveSpacing(33),
  },
  avatarText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
  },
  actionButton: {
    backgroundColor: Colors.limeGreen,
    borderRadius: responsiveSpacing(46),
    paddingVertical: responsiveSpacing(14),
    paddingHorizontal: responsiveSpacing(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
});

export default TenantItem;
