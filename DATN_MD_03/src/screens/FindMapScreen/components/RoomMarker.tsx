import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {Marker} from 'react-native-maps';
import {Room} from '../../../types/Room';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {responsiveIcon, responsiveFont, responsiveSpacing} from '../../../utils/responsive';
import {Icons} from '../../../assets/icons';

interface RoomMarkerProps {
  room: Room;
  onPress: (room: Room) => void;
  isSelected?: boolean;
}

const RoomMarker: React.FC<RoomMarkerProps> = ({room, onPress, isSelected}) => {
  const coordinates = room.location?.coordinates?.coordinates;
  if (!coordinates || coordinates.length !== 2) return null;

  const [longitude, latitude] = coordinates;

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}tr`;
    }
    return `${(price / 1000).toFixed(0)}k`;
  };

  return (
    <Marker
      coordinate={{
        latitude,
        longitude,
      }}
      anchor={{x: 0.5, y: 0.5}}
      onPress={() => onPress(room)}>
      <View style={styles.container}>
        <View style={[styles.priceTag, isSelected && styles.selectedPriceTag]}>
          <Text style={styles.priceText}>{formatPrice(room.rentPrice)}</Text>
          <Image
            source={{uri: Icons.IconHome}}
            style={styles.homeIcon}
            resizeMode="contain"
          />
        </View>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: responsiveSpacing(8),
    paddingVertical: responsiveSpacing(4),
    borderRadius: responsiveSpacing(16),
    gap: responsiveSpacing(4),
  },
  selectedPriceTag: {
    backgroundColor: '#2E7D32',
    transform: [{scale: 1.1}],
  },
  priceText: {
    color: Colors.white,
    fontSize: responsiveFont(13),
    fontFamily: Fonts.Roboto_Bold,
  },
  homeIcon: {
    width: responsiveIcon(14),
    height: responsiveIcon(14),
    tintColor: Colors.white,
  },
});

export default RoomMarker; 