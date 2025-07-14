import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import {Modal} from 'react-native';
import {Colors} from '../../../../theme/color';
import ItemInput from '../../../LoginAndRegister/components/ItemInput';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../../store';
import {getLandlordRooms} from '../../../../store/slices/landlordRoomsSlice';
import ItemRoomSearch from './ItemRoomSearch';

interface ModalSearchRoomProps {
  visible?: boolean;
  onClose: () => void;
  onSelectRoom: (
    roomId: string,
    roomName: string,
    maxOccupancys: number,
  ) => void;
}
const ModalSearchRoom = ({
  visible,
  onClose,
  onSelectRoom,
}: ModalSearchRoomProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const {rooms, loading} = useSelector(
    (state: RootState) => state.landlordRooms,
  );

  const {user} = useSelector((state: RootState) => state.auth);

  const [searchText, setSearchText] = React.useState('');

  useEffect(() => {
    if (!user?.auth_token) return;

    // Nếu đã có dữ liệu trong rooms, không gọi lại
    if (rooms && rooms.length > 0) return;

    dispatch(getLandlordRooms(user.auth_token));
  }, [dispatch, user?.auth_token, rooms]);

  // ✅ Hàm lọc phòng theo roomNumber
  const filterRoomsByRoomNumber = () => {
    return rooms.filter(
      room =>
        room.status === 'trong' &&
        room.approvalStatus === 'duyet' &&
        room.roomNumber?.toLowerCase().includes(searchText.toLowerCase()),
    );
  };

  const filteredRooms = filterRoomsByRoomNumber();
  const handleSelectRoom = (
    roomId: string,
    roomName: string,
    maxOccupancys: number,
  ) => {
    onSelectRoom(roomId, roomName, maxOccupancys);
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modal}>
        <ItemInput
          placeholder="Tìm kiếm phòng"
          value={searchText}
          onChangeText={setSearchText}
          editable={true}
        />

        {/* Hiển thị kết quả lọc */}
        {filteredRooms.map(room => (
          <ItemRoomSearch
            key={room._id}
            room={room}
            onPress={handleSelectRoom}
          />
        ))}
      </View>
    </Modal>
  );
};

export default ModalSearchRoom;

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.backgroud,
  },
});
