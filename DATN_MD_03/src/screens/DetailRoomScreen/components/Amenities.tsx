import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';
import { responsiveSpacing, responsiveFont } from '../../../utils/responsive';
import { furnitureMapping, amenitiesMapping } from '../../../utils/amenityIcons';

interface AmenitiesProps {
  amenities?: string[];
  furniture?: string[];
}

const Amenities: React.FC<AmenitiesProps> = ({ amenities = [], furniture = [] }) => {
  // Map amenities từ API - hiển thị tất cả
  const amenityItems = amenities.map(item => ({
    ...amenitiesMapping[item] || { label: item, icon: '📦' },
    type: 'amenity',
    key: item
  }));

  // Map furniture từ API - hiển thị tất cả
  const furnitureItems = furniture.map(item => ({
    ...furnitureMapping[item] || { label: item, icon: '📦' },
    type: 'furniture',
    key: item
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
}

const AmenityItem: React.FC<AmenityItemProps> = ({ icon, label }) => {
  // Kiểm tra xem icon có phải là đường dẫn assets không (bắt đầu bằng 'asset:' hoặc chứa '.png')
  const isImageIcon = icon.includes('asset:') || icon.includes('.png') || icon.includes('icon_');
  
  return (
    <View style={styles.amenityItem}>
      <View style={styles.amenityIconContainer}>
        {isImageIcon ? (
          <Image 
            source={{ uri: icon }} 
            style={styles.amenityImageIcon}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.amenityIcon}>{icon}</Text>
        )}
      </View>
      <Text style={styles.amenityLabel} numberOfLines={2}>{label}</Text>
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
  },
  separator: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: responsiveSpacing(20),
  },
  amenityItem: {
    alignItems: 'center',
    width: '33.333%', // Exactly 1/3 for 3 columns
    marginBottom: responsiveSpacing(20),
    paddingHorizontal: responsiveSpacing(4), // Add padding for consistent spacing
  },
  amenityIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: Colors.lightGray,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveSpacing(8),
  },
  amenityIcon: {
    fontSize: 24,
  },
  amenityImageIcon: {
    width: 28,
    height: 28,
    tintColor: Colors.darkGreen,
  },
  amenityLabel: {
    fontSize: responsiveFont(12),
    color: Colors.textGray,
    fontFamily: Fonts.Roboto_Regular,
    textAlign: 'center',
    lineHeight: responsiveFont(16),
    minHeight: responsiveFont(32), // Đảm bảo height consistent
  },
});

export default Amenities;
