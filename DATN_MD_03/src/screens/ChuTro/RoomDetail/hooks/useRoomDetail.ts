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
      if (
        selectedRoom.approvalStatus === 'choDuyet' ||
        selectedRoom.approvalStatus === 'tuChoi'
      ) {
        navigation.navigate('UpdateRoomScreen', {item: selectedRoom});
        return;
      }
      showConfirm(
        'Cập nhật phòng sẽ:\n' +
          ' - Chuyển sang trạng thái "Chờ duyệt" và ẩn khỏi trang chủ\n' +
          ' - Xóa hợp đồng "Nháp"\n' +
          ' - Hủy hợp đồng "Chờ ký" hoặc "Chờ duyệt"\n' +
          'Bạn có muốn tiếp tục không?',
        () => {
          hideAlert();
          navigation.navigate('UpdateRoomScreen', {item: selectedRoom});
        },
        'Xác nhận cập nhật',
      );
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

    if (
      selectedRoom?.approvalStatus === 'choDuyet' ||
      selectedRoom?.approvalStatus === 'tuChoi'
    ) {
      showConfirm(
        'Bạn có chắc chắn muốn xóa phòng này không?',
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
      return;
    }

    showConfirm(
      'Xóa phòng sẽ xóa tất cả các hợp đồng có trạng thái:\n' +
        ' - Bản nháp\n' +
        ' - Chờ ký\n' +
        ' - Chờ phê duyệt\n' +
        ' - Đã hủy\n' +
        ' - Bị từ chối\n' +
        'Bạn có muốn tiếp tục không?',
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
