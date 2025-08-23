import React, {useState, useCallback, useEffect} from 'react';
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

  // Auto-hide tooltip after 3 seconds
  useEffect(() => {
    if (selectedTenant) {
      const timer = setTimeout(() => {
        setSelectedTenant(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [selectedTenant]);

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

  const handleViewDetail = useCallback(() => {
    navigation.navigate('TenantDetail', {
      tenantId: item._id,
      ...({tenantData: item} as any),
    });
  }, [navigation, item]);

  const handleAvatarPress = useCallback((tenantName: string) => {
    setSelectedTenant(prevName =>
      prevName === tenantName ? null : tenantName,
    );
  }, []);

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const renderTenantAvatars = () => {
    // Calculate dynamic spacing based on tenant count
    const isLowCount = allTenants.length <= 2;
    const isHighCount = allTenants.length >= 4;
    
    return (
      <View style={[
        styles.avatarContainer,
        isLowCount && styles.avatarContainerLowCount,
        isHighCount && styles.avatarContainerHighCount
      ]}>
        {allTenants.map((tenant, index) => (
          <TouchableOpacity
            key={`${tenant._id}-${index}`}
            style={[
              styles.avatarWrapper,
              index > 0 && {
                marginLeft: isHighCount 
                  ? responsiveSpacing(-32) // Closer spacing for 4+ people
                  : isLowCount 
                  ? responsiveSpacing(-20) // Less overlap for 1-2 people
                  : responsiveSpacing(-24) // Default spacing for 3 people
              },
            ]}
            onPress={() => handleAvatarPress(tenant.fullName)}
            activeOpacity={0.7}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}} // Better touch area
            >
            <View style={styles.avatarItemContainer}>
              <TooltipBubble
                text={tenant.fullName}
                visible={selectedTenant === tenant.fullName}
              />
              {tenant.avatar ? (
                <Image
                  source={{uri: tenant.avatar}}
                  style={[
                    styles.avatarImage,
                    isHighCount && styles.avatarImageCompact
                  ]}
                />
              ) : (
                <LinearGradient
                  colors={['#7B9EFF', '#9B7BFF']}
                  style={[
                    styles.avatar,
                    isHighCount && styles.avatarCompact
                  ]}>
                  <Text style={[
                    styles.avatarText,
                    isHighCount && styles.avatarTextCompact
                  ]}>
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

        <View style={[
          styles.roomBasicInfo,
          allTenants.length <= 2 && styles.roomBasicInfoExpanded
        ]}>
          <View style={styles.roomNumberContainer}>
            <Text style={styles.roomNumber} numberOfLines={1}>Phòng: {roomNumber}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoText} numberOfLines={1}>Số người: {tenantCount}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.priceText} numberOfLines={1}>Giá : {price}VNĐ/tháng</Text>
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
  roomImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomBasicInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: responsiveSpacing(4),
    marginLeft: responsiveSpacing(8),
    minWidth: 0, // Allow flex item to shrink below content size
  },
  roomBasicInfoExpanded: {
    // For 1-2 people: more space for information
    marginLeft: responsiveSpacing(16),
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
    flexShrink: 1, // Allow room number to shrink if needed
  },
  infoText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    fontWeight: '400',
    flexShrink: 1, // Allow text to shrink if needed
  },
  priceText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    fontWeight: '400',
    flexShrink: 1, // Allow text to shrink if needed
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0, // Prevent avatar container from shrinking
  },
  // Dynamic avatar container styles
  avatarContainerLowCount: {
    // For 1-2 people: more space between avatars and info
    marginRight: responsiveSpacing(12),
  },
  avatarContainerHighCount: {
    // For 4+ people: compact avatars to save space
    marginRight: responsiveSpacing(8),
  },
  avatarItemContainer: {
    position: 'relative',
  },
  avatarWrapper: {
    flexShrink: 0, // Prevent avatar from shrinking
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
  // Compact styles for high tenant count
  avatarCompact: {
    width: responsiveSpacing(58),
    height: responsiveSpacing(58),
    borderRadius: responsiveSpacing(29),
  },
  avatarImageCompact: {
    width: responsiveSpacing(58),
    height: responsiveSpacing(58),
    borderRadius: responsiveSpacing(29),
  },
  avatarTextCompact: {
    fontSize: responsiveFont(14),
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

export default React.memo(TenantItem);
