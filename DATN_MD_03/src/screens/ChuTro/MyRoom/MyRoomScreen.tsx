import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
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
import {CustomAlertModal, LoadingAnimation} from '../../../components';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';
import EmptyRoom from './components/EmptyRoom';
import {useCustomAlert} from '../../../hooks/useCustomAlrert';
import {
  loadPlans,
  loadSubscriptions,
} from '../../../store/slices/subscriptionSlice';

export default function MyRoomScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();
  const [loadingMore, setLoadingMore] = useState(false);
  const token = useSelector((s: RootState) => s.auth.token);
  const {rooms, loading, pagination} = useSelector(
    (state: RootState) => state.landlordRooms,
  );
  const {
    alertConfig,
    visible: alertVisible,
    hideAlert,
    showConfirm,
  } = useCustomAlert();
  const {total} = useSelector(
    (state: RootState) => state.landlordRooms.pagination || {total: 0},
  );
  const {user} = useSelector((state: RootState) => state.auth);

  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    dispatch(loadPlans());
    if (token) {
      dispatch(loadSubscriptions(token));
    }
  }, [dispatch, token]);
  const subscription = useSelector((state: RootState) => state.subscription);

  // Key plan hiện tại (string hoặc undefined)
  const currentPlanKey = subscription.current?.plan ?? 'free';
  // Lấy object plan đầy đủ
  const currentPlanItem = subscription.plans.find(
    p => p.key === currentPlanKey,
  );

  // Nếu không tìm thấy thì fallback Free
  const effectivePlan =
    currentPlanItem ?? subscription.plans.find(p => p.key === 'free') ?? null;
  // pagination state
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
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
      await dispatch(
        // getLandlordRooms thunk should accept an object with token & params
        getLandlordRooms({
          token: user.auth_token,
          status: statusToSend,
          approvalStatus: '',
          page: pageToLoad,
          limit,
          roomName: searchText,
        } as any),
      );
    },
    [
      page,
      itemsPerPage,
      selectedFilter,
      user?.auth_token,
      dispatch,
      searchText,
    ],
  );

  // Gọi load khi user.token, selectedFilter hoặc page thay đổi
  useEffect(() => {
    loadRooms({pageToLoad: page, limit: itemsPerPage, status: selectedFilter});
    // reset to page 1 when filter changed handled below
  }, [loadRooms, page, selectedFilter, itemsPerPage]);

  const handleClickFilter = useCallback((value: string) => {
    setSelectedFilter(value);
    setPage(1); // khi đổi filter, load lại từ trang 1
  }, []);

  const handleClickItemRooms = useCallback(
    (id: string) => {
      navigation.navigate('DetailRoomLandlord', {id});
    },
    [navigation],
  );
  const handleGoback = () => navigation.goBack();
  const handleAddRoom = () => {
    if (effectivePlan && total >= effectivePlan.maxActiveRooms) {
      showConfirm(
        `Bạn đã đạt giới hạn ${effectivePlan.maxActiveRooms} phòng trong gói ${effectivePlan.name}. Vui lòng nâng cấp gói để thêm phòng mới.`,
        () => {
          navigation.navigate('SubscriptionScreen');
          hideAlert();
        },
        'Giới hạn phòng',
        [
          {
            text: 'Nâng cấp',
            onPress: () => {
              navigation.navigate('SubscriptionScreen');
              hideAlert();
            },
            style: 'default',
          },
          {
            text: 'Hủy',
            onPress: () => hideAlert(),
            style: 'cancel',
          },
        ],
      );
      return;
    }

    navigation.navigate('AddRooom', {});
  };

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

  const loadMoreRooms = useCallback(async () => {
    if (loadingMore || loading) return; // đang load thì bỏ qua
    if (pagination && page >= pagination.totalPages) return; // hết dữ liệu rồi

    setLoadingMore(true);
    await loadRooms({
      pageToLoad: page + 1,
      limit: itemsPerPage,
      status: selectedFilter,
    });
    setPage(prev => prev + 1);
    setLoadingMore(false);
  }, [
    loadingMore,
    loading,
    pagination,
    page,
    itemsPerPage,
    selectedFilter,
    loadRooms,
  ]);

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
          <FlatList
            data={rooms}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({item, index}) => (
              <ItemRoom
                item={item}
                onPress={handleClickItemRooms}
                index={index}
              />
            )}
            ListEmptyComponent={
              <EmptyRoom
                loading={loading && !refreshing}
                isSearching={!!searchText}
                isFiltering={selectedFilter !== 'all'}
              />
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.limeGreen]}
                tintColor={Colors.limeGreen}
              />
            }
            onEndReached={loadMoreRooms}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <LoadingAnimation size="small" color={Colors.limeGreen} />
              ) : null
            }
          />
        </View>

        <TouchableOpacity style={styles.buttonAddRoom} onPress={handleAddRoom}>
          <Image source={{uri: Icons.IconAdd}} style={styles.styleIcon} />
        </TouchableOpacity>
      </View>
      {alertConfig && (
        <CustomAlertModal
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={hideAlert}
          type={alertConfig.type}
          buttons={alertConfig.buttons}
        />
      )}
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
    bottom: responsiveSpacing(60),
    right: responsiveSpacing(20),
    width: responsiveIcon(56),
    height: responsiveIcon(56),
    backgroundColor: Colors.limeGreen,
    borderRadius: responsiveIcon(56) / 2,
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
