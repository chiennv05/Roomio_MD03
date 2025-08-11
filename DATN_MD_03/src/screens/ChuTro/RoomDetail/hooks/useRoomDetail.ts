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
import {useCustomAlert} from '../../../../hooks/useCustomAlrert';

export const useRoomDetail = (roomId: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const {selectedRoom, loading, error} = useSelector(
    (state: RootState) => state.landlordRooms,
  );

  const {
    alertConfig,
    visible: alertVisible,
    hideAlert,
    showSuccess,
    showError,
    showConfirm,
  } = useCustomAlert();

  useEffect(() => {
    dispatch(getLandlordRoomDetail(roomId));
  }, [dispatch, roomId]);

  const handleNavigateToUpdate = () => {
    if (selectedRoom?.status === 'daThue') {
      showError(
        'Phòng này đã được thuê, không thể cập nhật thông tin.',
        'Thông báo',
      );
      return;
    }
    if (selectedRoom) {
      navigation.navigate('UpdateRoomScreen', {item: selectedRoom});
    }
  };

  const handleRetry = () => {
    dispatch(getLandlordRoomDetail(roomId));
  };

  const handleDeleteRoom = () => {
    if (selectedRoom?.status === 'daThue') {
      showError('Phòng này đã được thuê, không thể xóa.', 'Thông báo');
      return;
    }

    showConfirm(
      'Bạn có chắc chắn muốn xóa phòng này không? Hành động này không thể hoàn tác.',
      async () => {
        try {
          await dispatch(deleteLandlordRoom(roomId)).unwrap();
          showSuccess('Xóa phòng thành công!', 'Thành công');
          navigation.goBack();
        } catch (err: any) {
          showError(err || 'Không thể xóa phòng', 'Lỗi');
        }
      },
      'Xác nhận xóa',
    );
  };

  return {
    selectedRoom,
    loading,
    error,
    handleNavigateToUpdate,
    handleRetry,
    handleDeleteRoom,
    navigation,
    alertConfig,
    alertVisible,
    hideAlert,
    showSuccess,
    showError,
    showConfirm,
  };
};
