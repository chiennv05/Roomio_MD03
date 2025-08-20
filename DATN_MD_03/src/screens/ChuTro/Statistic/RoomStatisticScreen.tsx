import React, {useEffect, useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {
  responsiveFont,
  responsiveSpacing,
  scale,
  SCREEN,
} from '../../../utils/responsive';
import {fetchDashboard} from '../../../store/slices/dashboardSlice';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';
import {LoadingAnimation} from '../../../components';
import {StatChart, TopRoomCard} from './components';
import UIHeader from '../MyRoom/components/UIHeader';
import {Icons} from '../../../assets/icons';

type RoomStatisticScreenNavigationProp =
  StackNavigationProp<RootStackParamList>;

const RoomStatisticScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<RoomStatisticScreenNavigationProp>();
  const {user} = useSelector((state: RootState) => state.auth);
  const {data, loading} = useSelector((state: RootState) => state.dashboard);
  const [refreshing, setRefreshing] = useState(false);
  const statusBarHeight =
    Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  const fetchData = useCallback(async () => {
    if (user?.auth_token) {
      dispatch(fetchDashboard(user.auth_token));
    }
  }, [dispatch, user?.auth_token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const navigateToRoomDetail = (roomId: string) => {
    navigation.navigate('DetailRoomLandlord', {id: roomId});
  };

  if (loading && !refreshing && !data) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingAnimation />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={Colors.backgroud}
        barStyle="dark-content"
        translucent
      />
      <View style={[styles.headerContainer, {marginTop: statusBarHeight + 5}]}>
        <UIHeader
          title="Thống kê phòng trọ"
          iconLeft={Icons.IconArrowLeft}
          onPressLeft={handleGoBack}
          color={Colors.backgroud}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Overview Cards */}
        <View style={styles.overviewContainer}>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Tổng số phòng</Text>
            <Text style={styles.overviewValue}>
              {data?.overview?.totalRooms || 0}
            </Text>
          </View>

          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Phòng đã thuê</Text>
            <Text style={[styles.overviewValue, {color: '#2E7D5A'}]}>
              {data?.overview?.rentedRooms || 0}
            </Text>
          </View>

          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Phòng trống</Text>
            <Text style={[styles.overviewValue, {color: Colors.accentSupport}]}>
              {data?.overview?.availableRooms || 0}
            </Text>
          </View>

          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Chờ duyệt</Text>
            <Text style={[styles.overviewValue, {color: '#7DD3FC'}]}>
              {data?.overview?.pendingRooms || 0}
            </Text>
          </View>
        </View>

        {/* Room Statistics Chart */}
        {data?.monthlyStats && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>
              Biểu đồ phòng trọ theo tháng
            </Text>
            <StatChart
              title="Số lượng phòng"
              data={data.monthlyStats.rooms}
              labels={data.monthlyStats.labels}
              color={Colors.accentSupport}
            />
          </View>
        )}

        {/* Top Viewed Rooms */}
        <View style={styles.topRoomsContainer}>
          <Text style={styles.sectionTitle}>Phòng được xem nhiều nhất</Text>
          {data?.topViewedRooms && data.topViewedRooms.length > 0 ? (
            data.topViewedRooms.map((room: any, index: number) => (
              <TopRoomCard
                key={`view-${room._id}-${index}`}
                roomNumber={room.roomNumber}
                rentPrice={room.rentPrice}
                photo={room.photos?.[0] || ''}
                viewCount={room.stats?.viewCount || 0}
                favoriteCount={room.stats?.favoriteCount || 0}
                onPress={() => navigateToRoomDetail(room._id)}
              />
            ))
          ) : (
            <Text style={styles.noDataText}>Không có dữ liệu</Text>
          )}
        </View>

        {/* Top Favorite Rooms */}
        <View style={styles.topRoomsContainer}>
          <Text style={styles.sectionTitle}>Phòng được yêu thích nhất</Text>
          {data?.topFavoriteRooms && data.topFavoriteRooms.length > 0 ? (
            data.topFavoriteRooms.map((room: any, index: number) => (
              <TopRoomCard
                key={`fav-${room._id}-${index}`}
                roomNumber={room.roomNumber}
                rentPrice={room.rentPrice}
                photo={room.photos?.[0] || ''}
                viewCount={room.stats?.viewCount || 0}
                favoriteCount={room.stats?.favoriteCount || 0}
                onPress={() => navigateToRoomDetail(room._id)}
              />
            ))
          ) : (
            <Text style={styles.noDataText}>Không có dữ liệu</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RoomStatisticScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroud,
  },
  headerContainer: {
    alignItems: 'center',
    backgroundColor: Colors.backgroud,
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(8),
  },
  scrollContent: {
    paddingBottom: responsiveSpacing(24),
  },
  overviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: responsiveSpacing(16),
    paddingTop: responsiveSpacing(16),
    justifyContent: 'space-between',
  },
  overviewCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    padding: responsiveSpacing(16),
    marginBottom: responsiveSpacing(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  overviewLabel: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    marginBottom: responsiveSpacing(4),
  },
  overviewValue: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
  },
  chartSection: {
    marginTop: responsiveSpacing(8),
  },
  sectionTitle: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
    marginBottom: responsiveSpacing(10),
    paddingHorizontal: responsiveSpacing(16),
  },
  topRoomsContainer: {
    marginTop: responsiveSpacing(16),
  },
  noDataText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    textAlign: 'center',
    marginVertical: responsiveSpacing(20),
  },
});
