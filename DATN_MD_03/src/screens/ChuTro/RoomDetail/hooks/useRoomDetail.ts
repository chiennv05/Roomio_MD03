import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../../store';
import {getLandlordRoomDetail} from '../../../../store/slices/landlordRoomsSlice';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../../types/route';

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

  return {
    selectedRoom,
    loading,
    error,
    handleNavigateToUpdate,
    formatNumber,
    handleRetry,
    navigation,
  };
}; 