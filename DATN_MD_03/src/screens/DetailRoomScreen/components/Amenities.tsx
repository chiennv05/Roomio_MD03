import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {
  responsiveSpacing,
  responsiveFont,
  responsiveIcon,
  isSmallDevice,
  isTablet,
} from '../../../utils/responsive';
import {furnitureMapping, amenitiesMapping} from '../../../utils/amenityIcons';

interface AmenitiesProps {
  amenities?: string[];
  furniture?: string[];
}

const Amenities: React.FC<AmenitiesProps> = ({
  amenities = [],
  furniture = [],
}) => {
  // Responsive logic cho số cột
  const getItemWidth = () => {
    if (isTablet) {
      return '23%'; // 4 cột cho tablet
    } else if (isSmallDevice) {
      return '48%'; // 2 cột cho màn hình nhỏ
    } else {
      return '31%'; // 3 cột cho màn hình bình thường
    }
  };

  const itemWidth = getItemWidth();

  // Map amenities từ API - hiển thị tất cả
  const amenityItems = amenities.map(item => ({
    ...(amenitiesMapping[item] || {label: item, icon: '📦'}),
    type: 'amenity',
    key: item,
  }));

  // Map furniture từ API - hiển thị tất cả
  const furnitureItems = furniture.map(item => ({
    ...(furnitureMapping[item] || {label: item, icon: '📦'}),
    type: 'furniture',
    key: item,
  }));

  return (
    <View style={styles.container}>
      {/* Section Tiện nghi */}
      {amenityItems.length > 0 && (
        <>
          <Text style={styles.title}>Tiện nghi</Text>
          <View style={styles.grid}>
            {amenityItems.map((item, index) => (
              <AmenityItem
                key={`amenity-${item.key}-${index}`}
                icon={item.icon}
                label={item.label}
                itemWidth={itemWidth}
              />
            ))}
          </View>
        </>
      )}

      {/* Separator nếu có cả 2 sections */}
      {amenityItems.length > 0 && furnitureItems.length > 0 && (
        <View style={styles.separator} />
      )}

      {/* Section Nội thất */}
      {furnitureItems.length > 0 && (
        <>
          <Text style={styles.title}>Nội thất</Text>
          <View style={styles.grid}>
            {furnitureItems.map((item, index) => (
              <AmenityItem
                key={`furniture-${item.key}-${index}`}
                icon={item.icon}
                label={item.label}
                itemWidth={itemWidth}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
};

interface AmenityItemProps {
  icon: string;
  label: string;
  itemWidth: string;
}

const AmenityItem: React.FC<AmenityItemProps> = ({icon, label, itemWidth}) => {
  // Kiểm tra xem icon có phải là đường dẫn assets không
  const isImageIcon =
    icon.includes('asset:') || icon.includes('.png') || icon.includes('icon_');

  return (
    <View style={[styles.amenityItemNoBg, {width: itemWidth as any}]}>
      {isImageIcon ? (
        <Image
          source={{uri: icon}}
          style={styles.amenityImageIconNoBg}
          resizeMode="contain"
        />
      ) : (
        <Text style={styles.amenityIconNoBg}>{icon}</Text>
      )}
      <Text style={styles.amenityLabelNoBg} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: responsiveSpacing(16),
  },
  title: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(16),
    color: Colors.black,
    marginBottom: responsiveSpacing(16),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: responsiveSpacing(isSmallDevice ? 8 : 12),
    backgroundColor: 'transparent',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: responsiveSpacing(20),
  },
  amenityItemNoBg: {
    alignItems: 'center',
    marginBottom: responsiveSpacing(isTablet ? 16 : 12),
    paddingHorizontal: responsiveSpacing(4),
    backgroundColor: 'transparent',
  },
  amenityIconNoBg: {
    fontSize: responsiveFont(32),
    color: Colors.darkGreen,
    marginBottom: responsiveSpacing(4),
  },
  amenityImageIconNoBg: {
    width: responsiveIcon(32),
    height: responsiveIcon(32),
    marginBottom: responsiveSpacing(4),
  },
  amenityLabelNoBg: {
    fontSize: responsiveFont(13),
    color: Colors.black,
    fontWeight: 'bold',
    fontFamily: Fonts.Roboto_Regular,
    textAlign: 'center',
    lineHeight: responsiveFont(16),
    minHeight: responsiveFont(32),
  },
});

export default Amenities;