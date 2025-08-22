import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import TooltipBubble from './TooltipBubble';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {
  responsiveFont,
  responsiveSpacing,
} from '../../../../utils/responsive';
import {Tenant} from '../../../../types/Tenant';
import {Icons} from '../../../../assets/icons';
import {RootStackParamList} from '../../../../types/route';
import {getImageUrl} from '../../../../configs';

interface TenantItemProps {
  item: Tenant;
}

type NavigationProp = StackNavigationProp<RootStackParamList, 'TenantDetail'>;

const TenantItem: React.FC<TenantItemProps> = ({item}) => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);

  const roomNumber = item.room?.roomNumber || 'N/A';
  const tenantCount = item.tenantCount || 1;
  const price = item.monthlyRent ? item.monthlyRent.toLocaleString('vi-VN') : '0';
  const roomPhoto = item.room?.photo ? getImageUrl(item.room.photo) : null;

  // Create tenant list with main tenant first, then coTenants (excluding duplicate main tenant)
  const coTenantsFiltered = (item.coTenants || []).filter(coTenant => coTenant._id !== item._id);

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
      // Truyền toàn bộ dữ liệu tenant sang màn chi tiết để không cần gọi API
      // Dùng any để tránh phải thay đổi RootStackParamList
      ...( { tenantData: item } as any ),
    });
  };

  const handleAvatarPress = (tenantName: string) => {
    setSelectedTenant(prevName => prevName === tenantName ? null : tenantName);
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
                <Image source={{uri: tenant.avatar}} style={styles.avatarImage} />
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
      {/* Header Section with Room Photo and Basic Info */}
      <View style={styles.headerSection}>
        {/* Room Photo */}
        <View style={styles.roomImageContainer}>
          {roomPhoto ? (
            <Image source={{uri: roomPhoto}} style={styles.roomImage} />
          ) : (
            <View style={styles.noImageContainer}>
              <Image source={{uri: Icons.IconRoom}} style={styles.noImageIcon} />
            </View>
          )}
        </View>

        {/* Room Basic Info */}
        <View style={styles.roomBasicInfo}>
          <View style={styles.roomNumberContainer}>
            <Image source={{uri: Icons.IconRoom}} style={styles.infoIcon} />
            <Text style={styles.roomNumber}>Phòng: {roomNumber}</Text>
          </View>

          <View style={styles.infoRow}>
            <Image source={{uri: Icons.IconSoNguoi}} style={styles.infoIcon} />
            <Text style={styles.infoText}>Số người: {tenantCount}</Text>
          </View>

          <View style={styles.infoRow}>
            <Image source={{uri: Icons.IconTienCoc}} style={styles.infoIcon} />
            <Text style={styles.priceText}>{price}VNĐ/tháng</Text>
          </View>
        </View>
      </View>

      {/* Tenant Avatars Section */}
      <View style={styles.tenantSection}>
        <View style={styles.tenantHeader}>
          <Image source={{uri: Icons.IconPersonDefaut}} style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>Danh sách người thuê</Text>
        </View>
        {renderTenantAvatars()}
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  headerSection: {
    flexDirection: 'row',
    marginBottom: responsiveSpacing(16),
  },
  roomImageContainer: {
    width: responsiveSpacing(100),
    height: responsiveSpacing(80),
    borderRadius: responsiveSpacing(12),
    overflow: 'hidden',
    marginRight: responsiveSpacing(12),
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.lightGreenBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageIcon: {
    width: responsiveSpacing(32),
    height: responsiveSpacing(32),
    tintColor: Colors.darkGreen,
  },
  roomBasicInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: responsiveSpacing(4),
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
  infoIcon: {
    width: responsiveSpacing(16),
    height: responsiveSpacing(16),
    marginRight: responsiveSpacing(8),
    tintColor: Colors.darkGreen,
  },
  roomNumber: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  infoText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  priceText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGreen,
  },
  tenantSection: {
    marginBottom: responsiveSpacing(16),
  },
  tenantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing(12),
  },
  sectionIcon: {
    width: responsiveSpacing(18),
    height: responsiveSpacing(18),
    marginRight: responsiveSpacing(8),
    tintColor: Colors.darkGreen,
  },
  sectionTitle: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarItemContainer: {
    position: 'relative',
  },
  avatarWrapper: {
    borderRadius: responsiveSpacing(25),
    borderWidth: 2,
    borderColor: Colors.white,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: Colors.white,
  },
  avatarWrapperOverlap: {
    marginLeft: responsiveSpacing(-15),
  },
  avatar: {
    width: responsiveSpacing(50),
    height: responsiveSpacing(50),
    borderRadius: responsiveSpacing(25),
    backgroundColor: Colors.darkGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: responsiveSpacing(50),
    height: responsiveSpacing(50),
    borderRadius: responsiveSpacing(25),
  },
  avatarText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
  },
  actionButton: {
    backgroundColor: Colors.darkGreen,
    borderRadius: responsiveSpacing(20),
    paddingVertical: responsiveSpacing(14),
    paddingHorizontal: responsiveSpacing(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    width: responsiveSpacing(18),
    height: responsiveSpacing(18),
    marginRight: responsiveSpacing(8),
    tintColor: Colors.white,
  },
  actionButtonText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
  },
});

export default TenantItem;
