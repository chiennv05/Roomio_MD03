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
  // Map amenities từ API
  const amenityItems = amenities.map(item => ({
    ...amenitiesMapping[item] || { label: item, icon: '📦' },
    type: 'amenity'
  }));

  // Map furniture từ API  
  const furnitureItems = furniture.map(item => ({
    ...furnitureMapping[item] || { label: item, icon: '📦' },
    type: 'furniture'
  }));

  return (
    <View style={styles.container}>
      {/* Section Tiện nghi */}
      {amenityItems.length > 0 && (
        <>
          <Text style={styles.title}>Tiện nghi</Text>
          <View style={styles.grid}>
            {amenityItems.slice(0, 4).map((item, index) => (
              <AmenityItem
                key={`amenity-${index}`}
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
            {furnitureItems.slice(0, 4).map((item, index) => (
              <AmenityItem
                key={`furniture-${index}`}
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
      <Text style={styles.amenityLabel}>{label}</Text>
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
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: responsiveSpacing(16),
  },
  separator: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: responsiveSpacing(16),
  },
  amenityItem: {
    alignItems: 'center',
    width: '22%',
  },
  amenityIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: Colors.lightGray,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveSpacing(8),
  },
  amenityIcon: {
    fontSize: 20,
  },
  amenityImageIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.darkGreen,
  },
  amenityLabel: {
    fontSize: responsiveFont(12),
    color: Colors.textGray,
    fontFamily: Fonts.Roboto_Regular,
    textAlign: 'center',
  },
});

export default Amenities;
