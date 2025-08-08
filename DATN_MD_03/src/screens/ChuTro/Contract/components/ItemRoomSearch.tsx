import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {Room} from '../../../../types';
import {API_CONFIG} from '../../../../configs';
import {responsiveSpacing, SCREEN} from '../../../../utils/responsive';

interface ItemRoomSearchProps {
  room: Room;
  onPress: (roomId: string, roomName: string, maxOccupancys: number) => void;
}

const ItemRoomSearch = ({room, onPress}: ItemRoomSearchProps) => {
  const imgage = `${API_CONFIG.BASE_URL}${room.photos[0]}`;
  return (
    <TouchableOpacity
      style={styles.styleContainer}
      onPress={() =>
        onPress(room._id || '', room.roomNumber || '', room.maxOccupancy || 0)
      }>
      <Image source={{uri: imgage}} style={styles.styleImage} />

      <View style={styles.containerTitle}>
        <Text>{room.roomNumber}</Text>
        <Text>Diện tích: {room.area} m²</Text>
        <Text>Giá thuê: {room.rentPrice} VNĐ</Text>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(ItemRoomSearch);

const styles = StyleSheet.create({
  styleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: SCREEN.width * 0.9,
  },
  styleImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  containerTitle: {
    marginLeft: responsiveSpacing(10),
  },
});
