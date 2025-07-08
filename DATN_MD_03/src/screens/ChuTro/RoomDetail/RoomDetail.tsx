import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect} from 'react';
import {useRoute, useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import {getLandlordRoomDetail} from '../../../store/slices/landlordRoomsSlice';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';

type RoomDetailRouteProp = {
  params: {
    id: string;
  };
};

export default function RoomDetail() {
  const route = useRoute<any>() as RoomDetailRouteProp;
  const {id: roomId} = route.params;

  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const {selectedRoom, loading, error} = useSelector(
    (state: RootState) => state.landlordRooms,
  );

  useEffect(() => {
    dispatch(getLandlordRoomDetail(roomId));
  }, [dispatch, roomId]);

  // chuyển sang màn hình uodate
  const handleNavigateToUpdate = () => {
    if (selectedRoom) {
      navigation.navigate('UpdateRoomScreen', {item: selectedRoom});
    }
  };
  return (
    <View>
      <Text>RoomDetail</Text>
    </View>
  );
}

const styles = StyleSheet.create({});
