import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  NativeScrollEvent,
  NativeSyntheticEvent,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import {UIHeader, ItemInput} from './components';
import {Colors} from '../../../theme/color';
import {
  responsiveIcon,
  responsiveSpacing,
  SCREEN,
} from '../../../utils/responsive';
import {Icons} from '../../../assets/icons';
import ItemFilter from './components/ItemFilter';
import ItemRoom from './components/ItemRoom';
import {ALL_ROOM_STATUSES} from './constants/roomStatus';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import {getLandlordRooms} from '../../../store/slices/landlordRoomsSlice';
import {LoadingAnimation} from '../../../components';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';

export default function MyRoomScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();
  const {rooms, loading} = useSelector(
    (state: RootState) => state.landlordRooms,
  );
  const {user} = useSelector((state: RootState) => state.auth);

  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const scrollOffset = useRef(0);
  const filterHeight = useSharedValue(50); // Chiều cao ban đầu
  const filterOpacity = useSharedValue(1); // Để mượt hơn

  const animatedFilterStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(filterHeight.value, {duration: 200}),
      opacity: withTiming(filterOpacity.value, {duration: 200}),
    };
  });

  useEffect(() => {
    if (!user?.auth_token) {
      return;
    }
    dispatch(getLandlordRooms(user.auth_token));
  }, [dispatch, user?.auth_token]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentOffset = event.nativeEvent.contentOffset.y;
      const direction = currentOffset > scrollOffset.current ? 'down' : 'up';

      if (direction === 'down') {
        filterHeight.value = 0;
        filterOpacity.value = 0;
      } else {
        filterHeight.value = 50; // hoặc bao nhiêu bạn muốn
        filterOpacity.value = 1;
      }

      scrollOffset.current = currentOffset;
    },
    [filterHeight, filterOpacity],
  );

  const handleClickFilter = useCallback((value: string) => {
    setSelectedFilter(value);
  }, []);

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchFilter =
        selectedFilter === 'all' || room.status === selectedFilter;
      const matchSearch = room.roomNumber
        ?.toLowerCase()
        .includes(searchText.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [rooms, selectedFilter, searchText]);

  const handleClickItemRooms = useCallback((id: string) => {
    navigation.navigate('DetailRoomLandlord', {id});
  }, [navigation]);

  const handleGoback = () => {
    navigation.goBack();
  };
  const handleAddRoom = () => {
    navigation.navigate('AddRooom', {});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.backgroud}
        translucent={true}
      />
      <View style={styles.container}>
        <UIHeader
          title="Phòng trọ của tôi"
          onPressLeft={handleGoback}
          iconLeft={Icons.IconArrowLeft}
          iconRight={Icons.IconAdd}
          onPressRight={handleAddRoom}
        />

        {/* Tìm kiếm */}
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

        {/* Filter - Animated */}
        <Animated.View style={[styles.conatinerFilter, animatedFilterStyle]}>
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
        </Animated.View>

        {/* Danh sách phòng */}
        <View style={styles.containerListRooms}>
          {loading && <LoadingAnimation size="medium" color={Colors.limeGreen} />}
          <FlatList
            data={filteredRooms}
            horizontal={false}
            showsVerticalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({item, index}) => (
              <ItemRoom
                item={item}
                onPress={handleClickItemRooms}
                index={index}
              />
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight || 0,
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
    marginVertical: responsiveSpacing(10),
  },
  containerListRooms: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
