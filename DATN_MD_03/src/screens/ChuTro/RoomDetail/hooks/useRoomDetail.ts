import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../../store';
import {
  getLandlordRoomDetail,
  deleteLandlordRoom,
} from '../../../../store/slices/landlordRoomsSlice';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../../types/route';
import {Alert} from 'react-native';

export const useRoomDetail = (roomId: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const {selectedRoom, loading, error} = useSelector(
    (state: RootState) => state.landlordRooms,
  );

  useEffect(() => {
    dispatch(getLandlordRoomDetail(roomId));
  }, [dispatch, roomId]);

  const handleNavigateToUpdate = () => {
    if (selectedRoom) {
      navigation.navigate('UpdateRoomScreen', {item: selectedRoom});
    }
  };

  const formatNumber = (num: number) => {
    return num?.toLocaleString('vi-VN') || '0';
  };

  const handleRetry = () => {
    dispatch(getLandlordRoomDetail(roomId));
  };

  const handleDeleteRoom = () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa phòng này không? Hành động này không thể hoàn tác.',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteLandlordRoom(roomId)).unwrap();
              Alert.alert('Thành công', 'Xóa phòng thành công!', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error: any) {
              Alert.alert('Lỗi', error || 'Không thể xóa phòng');
            }
          },
        },
      ],
    );
  };

  return {
    selectedRoom,
    loading,
    error,
    handleNavigateToUpdate,
    formatNumber,
    handleRetry,
    handleDeleteRoom,
    navigation,
  };
};
