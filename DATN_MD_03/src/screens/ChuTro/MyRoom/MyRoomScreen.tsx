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
  RefreshControl,
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
import Pagination from '../Contract/components/Pagination'; // tùy đường dẫn của bạn

export default function MyRoomScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();

  const {rooms, loading, pagination} = useSelector(
    (state: RootState) => state.landlordRooms as any,
  );
  const {user} = useSelector((state: RootState) => state.auth);

  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // pagination state
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // animated filter
  const scrollOffset = useRef(0);
  const filterHeight = useSharedValue(50);
  const filterOpacity = useSharedValue(1);

  const animatedFilterStyle = useAnimatedStyle(() => ({
    height: withTiming(filterHeight.value, {duration: 200}),
    opacity: withTiming(filterOpacity.value, {duration: 200}),
  }));

  // Load rooms từ server (gọi API) - stable với useCallback
  const loadRooms = useCallback(
    async ({
      pageToLoad = page,
      limit = itemsPerPage,
      status = selectedFilter,
    }: {pageToLoad?: number; limit?: number; status?: string} = {}) => {
      if (!user?.auth_token) return;
      const statusToSend = status === 'all' ? '' : status;
      // debug: kiểm tra payload gửi
      console.log('[MyRoomScreen] loadRooms ->', {
        page: pageToLoad,
        limit,
        status: statusToSend,
      });
      await dispatch(
        // getLandlordRooms thunk should accept an object with token & params
        getLandlordRooms({
          token: user.auth_token,
          status: statusToSend,
          approvalStatus: '',
          page: pageToLoad,
          limit,
        } as any),
      );
    },
    [dispatch, user?.auth_token, page, itemsPerPage, selectedFilter],
  );

  // Gọi load khi user.token, selectedFilter hoặc page thay đổi
  useEffect(() => {
    loadRooms({pageToLoad: page, limit: itemsPerPage, status: selectedFilter});
    // reset to page 1 when filter changed handled below
  }, [loadRooms, page, selectedFilter, itemsPerPage]);

  // scroll behavior: ẩn/hiện filter
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentOffset = event.nativeEvent.contentOffset.y;
      const direction = currentOffset > scrollOffset.current ? 'down' : 'up';
      if (direction === 'down') {
        filterHeight.value = 0;
        filterOpacity.value = 0;
      } else {
        filterHeight.value = 50;
        filterOpacity.value = 1;
      }
      scrollOffset.current = currentOffset;
    },
    [filterHeight, filterOpacity],
  );

  const handleClickFilter = useCallback((value: string) => {
    setSelectedFilter(value);
    setPage(1); // khi đổi filter, load lại từ trang 1
  }, []);

  // local filtering/search on current page data
  const filteredRooms = useMemo(() => {
    return (rooms || []).filter((room: any) => {
      const matchFilter =
        selectedFilter === 'all' || room.status === selectedFilter;
      const matchSearch = room?.roomNumber
        ?.toString()
        .toLowerCase()
        .includes(searchText.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [rooms, selectedFilter, searchText]);

  const handleClickItemRooms = useCallback(
    (id: string) => {
      navigation.navigate('DetailRoomLandlord', {id});
    },
    [navigation],
  );

  const handleGoback = () => navigation.goBack();
  const handleAddRoom = () => navigation.navigate('AddRooom', {});

  // stable page change handler for Pagination
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1) return;
      if (pagination?.totalPages && newPage > pagination.totalPages) return;
      setPage(newPage);
    },
    [pagination?.totalPages],
  );

  // refresh pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await loadRooms({
      pageToLoad: 1,
      limit: itemsPerPage,
      status: selectedFilter,
    });
    setRefreshing(false);
  }, [loadRooms, itemsPerPage, selectedFilter]);

  // debug pagination from store
  useEffect(() => {
    console.log('[MyRoomScreen] pagination ->', pagination);
  }, [pagination]);

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
        />

        {/* Search */}
        <View style={styles.conatinerSearch}>
          <ItemInput
            placeholder="Tìm phòng trọ đã đăng"
            value={searchText}
            onChangeText={setSearchText}
            editable={true}
            width={SCREEN.width * 0.9}
          />
        </View>

        {/* Animated filter */}
        <Animated.View style={[styles.conatinerFilter, animatedFilterStyle]}>
          <FlatList
            keyExtractor={(_, index) => index.toString()}
            horizontal
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

        {/* Rooms list */}
        <View style={styles.containerListRooms}>
          {loading && !refreshing ? (
            <LoadingAnimation size="medium" color={Colors.limeGreen} />
          ) : null}

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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.limeGreen]}
                tintColor={Colors.limeGreen}
              />
            }
            ListFooterComponent={
              // show pagination if server reports more than one page (or total>itemsPerPage)
              pagination &&
              (pagination.total > itemsPerPage || pagination.totalPages > 1) ? (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              ) : null
            }
          />
        </View>

        <TouchableOpacity style={styles.buttonAddRoom} onPress={handleAddRoom}>
          <Image source={{uri: Icons.IconAdd}} style={styles.styleIcon} />
        </TouchableOpacity>
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
    width: SCREEN.width, // ensure list uses full width so footer centered
  },
  buttonAddRoom: {
    position: 'absolute',
    bottom: responsiveSpacing(20),
    right: responsiveSpacing(20),
    width: responsiveIcon(44),
    height: responsiveIcon(44),
    backgroundColor: Colors.limeGreen,
    borderRadius: responsiveIcon(44) / 2,
    padding: responsiveSpacing(12),
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
