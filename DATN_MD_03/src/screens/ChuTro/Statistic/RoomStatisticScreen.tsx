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
  Image,
  TouchableOpacity,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {
  responsiveFont,
  responsiveSpacing,
  scale,
} from '../../../utils/responsive';
import {fetchDashboard} from '../../../store/slices/dashboardSlice';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';
import {LoadingAnimation} from '../../../components';
import {TopRoomCardFancy} from './components';
import UIHeader from '../MyRoom/components/UIHeader';
import {Icons} from '../../../assets/icons';
import LinearGradient from 'react-native-linear-gradient';

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
          {/* Tổng số phòng */}
          <View style={[styles.overviewCardSimple, styles.cardTotal]}>
            <View style={[styles.iconBadge, styles.iconWrap]}>
              <Image source={{uri: Icons.IconRoom}} style={[styles.overviewIcon, {tintColor: Colors.brandPrimary}]} />
            </View>
            <View style={styles.overviewContent}>
              <Text style={styles.overviewLabel}>Tổng số phòng</Text>
              <Text style={styles.overviewValue}>{data?.overview?.totalRooms || 0}</Text>
            </View>
          </View>

          {/* Phòng đã thuê */}
          <View style={[styles.overviewCardSimple, styles.cardRented]}>
            <View style={[styles.iconBadge, styles.iconWrap]}>
              <Image source={{uri: Icons.IconPerson}} style={[styles.overviewIcon, {tintColor: Colors.brandPrimary}]} />
            </View>
            <View style={styles.overviewContent}>
              <Text style={styles.overviewLabel}>Phòng đã thuê</Text>
              <Text style={styles.overviewValue}>{data?.overview?.rentedRooms || 0}</Text>
            </View>
          </View>

          {/* Phòng trống */}
          <View style={[styles.overviewCardSimple, styles.cardAvailable]}>
            <View style={[styles.iconBadge, styles.iconWrap]}>
              <Image source={{uri: Icons.IconRoom}} style={[styles.overviewIcon, {tintColor: Colors.brandPrimary}]} />
            </View>
            <View style={styles.overviewContent}>
              <Text style={styles.overviewLabel}>Phòng trống</Text>
              <Text style={styles.overviewValue}>{data?.overview?.availableRooms || 0}</Text>
            </View>
          </View>

          {/* Chờ duyệt */}
          <View style={[styles.overviewCardSimple, styles.cardPending]}>
            <View style={[styles.iconBadge, styles.iconWrapNeutral]}>
              <Image source={{uri: Icons.IconLightReport}} style={[styles.overviewIcon, {tintColor: Colors.textSecondary}]} />
            </View>
            <View style={styles.overviewContent}>
              <Text style={styles.overviewLabel}>Chờ duyệt</Text>
              <Text style={styles.overviewValue}>{data?.overview?.pendingRooms || 0}</Text>
            </View>
          </View>
        </View>


        {/* Top Viewed Rooms */}
        <View style={styles.topRoomsContainer}>
          <View style={styles.sectionHeader}>
            <Image source={{uri: Icons.IconViewLight}} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Phòng được xem nhiều nhất</Text>
          </View>
          {data?.topViewedRooms && data.topViewedRooms.length > 0 ? (
            data.topViewedRooms.slice(0, 3).map((room: any, index: number) => (
              <TopRoomCardFancy
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
          <View style={styles.sectionHeader}>
            <Image source={{uri: Icons.IconHeartFavourite}} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Phòng được yêu thích nhất</Text>
          </View>
          {data?.topFavoriteRooms && data.topFavoriteRooms.length > 0 ? (
            data.topFavoriteRooms.slice(0, 3).map((room: any, index: number) => (
              <TopRoomCardFancy
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

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <View style={styles.sectionHeader}>
            <Image source={{uri: Icons.IconLightReport}} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('LandlordRoom')}
            style={styles.quickCard}
          >
            <LinearGradient
              colors={[Colors.limeGreen, '#E9FFB7']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.quickGradient}
            >
              <View style={styles.quickLeft}>
                <View style={styles.quickIconWrap}>
                  <Image
                    source={{uri: Icons.IconRoom}}
                    style={styles.quickIcon}
                  />
                </View>
                <Text style={styles.quickText}>Xem tất cả phòng</Text>
              </View>
              <Image
                source={{uri: Icons.IconArrowRight}}
                style={styles.quickArrow}
              />
            </LinearGradient>
          </TouchableOpacity>
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
    padding: responsiveSpacing(14),
    marginBottom: responsiveSpacing(12),
    shadowColor: Colors.shadowDefault,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewCardGd: {
    width: '48%',
    borderRadius: scale(12),
    padding: responsiveSpacing(14),
    marginBottom: responsiveSpacing(12),
    shadowColor: Colors.shadowDefault,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  // New simple card style with white background for better readability
  overviewCardSimple: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    padding: responsiveSpacing(14),
    marginBottom: responsiveSpacing(12),
    borderWidth: 1,
    borderColor: Colors.gray200,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTotal: {},
  cardRented: {},
  cardAvailable: {},
  cardPending: {},
  iconBadgeOverlay: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  iconWhite: {
    tintColor: Colors.white,
  },
  overviewLabelLight: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.white,
    marginBottom: responsiveSpacing(4),
  },
  overviewValueLight: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
  },
  iconBadge: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: responsiveSpacing(12),
  },
  // Wrapped icon styles
  iconWrap: {
    backgroundColor: Colors.brandPrimarySoft,
    shadowColor: Colors.shadowDefault,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  iconWrapNeutral: {
    backgroundColor: Colors.neutralSoft,
    shadowColor: Colors.shadowDefault,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  overviewIcon: {
    width: scale(20),
    height: scale(20),
  },
  overviewContent: {flex: 1},
  overviewLabel: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textSecondary,
    marginBottom: responsiveSpacing(4),
  },
  overviewValue: {
    fontSize: responsiveFont(22),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.dearkOlive,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(16),
    marginBottom: responsiveSpacing(10),
  },
  sectionIcon: {
    width: 20,
    height: 20,
    marginRight: responsiveSpacing(8),
    tintColor: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
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
  actionsContainer: {
    marginTop: responsiveSpacing(8),
    paddingHorizontal: responsiveSpacing(16),
    paddingBottom: responsiveSpacing(12),
  },
  quickCard: {
    borderRadius: scale(14),
    overflow: 'hidden',
    shadowColor: Colors.shadowDefault,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  quickGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: responsiveSpacing(16),
    paddingHorizontal: responsiveSpacing(16),
  },
  quickLeft: {flexDirection: 'row', alignItems: 'center'},
  quickIconWrap: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(10),
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: responsiveSpacing(10),
  },
  quickIcon: {width: scale(18), height: scale(18), tintColor: Colors.darkGray},
  quickText: {fontFamily: Fonts.Roboto_Bold, fontSize: responsiveFont(16), color: Colors.dearkOlive},
  quickArrow: {width: scale(18), height: scale(18), tintColor: Colors.dearkOlive},
});
