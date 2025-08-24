import React from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, responsiveSpacing, scale} from '../../../../utils/responsive';
import {TopRoomCardFancy} from './index';
import {Icons} from '../../../../assets/icons';

interface RoomsTabProps {
  data: any;
  navigateToRoomDetail: (roomId: string) => void;
  navigation: any;
}

const RoomsTab = ({data, navigateToRoomDetail, navigation}: RoomsTabProps) => {
  return (
    <View style={styles.tabContent}>
      {/* Overview Cards */}
      <View style={styles.overviewContainer}>
        {/* Tổng số phòng */}
        <View style={[styles.overviewCardSimple, styles.cardTotal]}>
          <View style={styles.statHeader}>
            <Image source={{uri: Icons.IconRoom}} style={styles.statIcon} />
            <Text style={styles.overviewLabel}>Tổng số phòng</Text>
          </View>
          <Text style={styles.overviewValue}>{data?.overview?.totalRooms || 0}</Text>
        </View>

        {/* Phòng đã thuê */}
        <View style={[styles.overviewCardSimple, styles.cardRented]}>
          <View style={styles.statHeader}>
            <Image source={{uri: Icons.IconHopDongThue}} style={styles.statIcon} />
            <Text style={styles.overviewLabel}>Phòng đã thuê</Text>
          </View>
          <Text style={styles.overviewValue}>{data?.overview?.rentedRooms || 0}</Text>
        </View>

        {/* Phòng trống */}
        <View style={[styles.overviewCardSimple, styles.cardAvailable]}>
          <View style={styles.statHeader}>
            <Image source={{uri: Icons.IconPhongTrong}} style={styles.statIcon} />
            <Text style={styles.overviewLabel}>Phòng trống</Text>
          </View>
          <Text style={styles.overviewValue}>{data?.overview?.availableRooms || 0}</Text>
        </View>

        {/* Chờ duyệt */}
        <View style={[styles.overviewCardSimple, styles.cardPending]}>
          <View style={styles.statHeader}>
            <Image source={{uri: Icons.IconChoDuyet}} style={[styles.statIcon, {tintColor: Colors.warning}]} />
            <Text style={styles.overviewLabel}>Chờ duyệt</Text>
          </View>
          <Text style={styles.overviewValue}>{data?.overview?.pendingRooms || 0}</Text>
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
          style={[styles.quickCard, {backgroundColor: Colors.limeGreen}]}
        >
          <View style={styles.quickGradient}>
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
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RoomsTab;

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
  },
  overviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: responsiveSpacing(16),
    paddingTop: responsiveSpacing(20),
    gap: responsiveSpacing(16),
  },
  overviewCardSimple: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    padding: responsiveSpacing(16),
    shadowColor: Colors.shadowDefault,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTotal: {},
  cardRented: {},
  cardAvailable: {},
  cardPending: {},
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing(12),
  },
  statIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: Colors.darkGreen,
    marginRight: responsiveSpacing(8),
  },
  overviewLabel: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Medium,
    color: Colors.textSecondary,
    flex: 1,
  },
  overviewValue: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
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
  quickIcon: {width: scale(18), height: scale(18), tintColor: Colors.darkGreen},
  quickText: {fontFamily: Fonts.Roboto_Bold, fontSize: responsiveFont(16), color: Colors.black },
  quickArrow: {width: scale(12), height: scale(18), tintColor: Colors.black},
});