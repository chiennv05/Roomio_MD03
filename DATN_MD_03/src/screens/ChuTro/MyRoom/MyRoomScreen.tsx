import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {UIHeader, ItemInput} from './components';
import {Colors} from '../../../theme/color';
import {responsiveIcon, SCREEN} from '../../../utils/responsive';
import {Icons} from '../../../assets/icons';
import ItemFilter from './components/ItemFilter';
import {ALL_ROOM_STATUSES} from './constants/roomStatus';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import {getLandlordRooms} from '../../../store/slices/landlordRoomsSlice';
import ItemRoom from './components/ItemRoom';

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODY4YzE5MGI2OTFkNzJjNDY3ODE2NzgiLCJ1c2VybmFtZSI6ImNodXRybzIiLCJyb2xlIjoiY2h1VHJvIiwiaWF0IjoxNzUxNjk1NzgxLCJleHAiOjE3NTQyODc3ODF9.x8oDOkIXl9VOsHqmVCxK7-2SUqfrWt3HrLwwm7Jg0qc';
export default function MyRoomScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const {rooms, loading, error} = useSelector(
    (state: RootState) => state.landlordRooms,
  );
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    dispatch(getLandlordRooms(token));
    console.log('dm');
  }, [dispatch]);

  // sự kiện header
  const handleGoback = () => {};

  // sự  hiện fillter
  const handleClickFilter = useCallback((value: string) => {
    setSelectedFilter(value);
  }, []);

  // sự kiện click item
  const handleClickItemRooms = useCallback((id: string) => {
    console.log('hiii');
  }, []);

  return (
    <View style={styles.container}>
      <UIHeader title="Phòng trọ của tôi" onPress={handleGoback} />

      <View style={styles.conatinerSearch}>
        <ItemInput
          placeholder="Tìm bài viết đã đăng"
          value={searchText}
          onChangeText={setSearchText}
          editable={true}
          width={SCREEN.width * 0.8}
        />
        <TouchableOpacity style={styles.styleButton}>
          <Image
            source={{uri: Icons.IconSeachBlack}}
            style={styles.styleIcon}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.conatinerFilter}>
        <FlatList
          keyExtractor={(_, index) => index.toString()}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          data={ALL_ROOM_STATUSES}
          renderItem={({item, index}) => (
            <ItemFilter
              item={item}
              isSelected={item.value === selectedFilter}
              onPress={handleClickFilter}
              index={index}
            />
          )}
        />
      </View>

      <View style={styles.containerListRooms}>
        <FlatList
          data={rooms}
          keyExtractor={(_, index) => index.toString()}
          renderItem={item => (
            <ItemRoom item={item.item} onPress={handleClickItemRooms} />
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
    alignItems: 'center',
  },
  conatinerSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: SCREEN.width * 0.9,
  },
  styleButton: {
    width: responsiveIcon(44),
    height: responsiveIcon(44),
    borderRadius: responsiveIcon(44) / 2,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },

  styleIcon: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
  },
  conatinerFilter: {
    width: SCREEN.width,
    justifyContent: 'center',
  },
  containerListRooms: {
    flex: 1,
  },
});
