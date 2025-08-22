import React from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, responsiveSpacing, scale} from '../../../../utils/responsive';
import {TopRoomCardFancy} from './index';

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
          <View style={[styles.iconBadge, styles.iconWrap]}>
            <Image source={require('../../../../assets/icons/icon_room.png')} style={[styles.overviewIcon, {tintColor: Colors.brandPrimary}]} />
          </View>
          <View style={styles.overviewContent}>
            <Text style={styles.overviewLabel}>Tổng số phòng</Text>
            <Text style={styles.overviewValue}>{data?.overview?.totalRooms || 0}</Text>
          </View>
        </View>

        {/* Phòng đã thuê */}
        <View style={[styles.overviewCardSimple, styles.cardRented]}>
          <View style={[styles.iconBadge, styles.iconWrap]}>
            <Image source={require('../../../../assets/icons/icon_person.png')} style={[styles.overviewIcon, {tintColor: Colors.brandPrimary}]} />
          </View>
          <View style={styles.overviewContent}>
            <Text style={styles.overviewLabel}>Phòng đã thuê</Text>
            <Text style={styles.overviewValue}>{data?.overview?.rentedRooms || 0}</Text>
          </View>
        </View>

        {/* Phòng trống */}
        <View style={[styles.overviewCardSimple, styles.cardAvailable]}>
          <View style={[styles.iconBadge, styles.iconWrap]}>
            <Image source={require('../../../../assets/icons/icon_room.png')} style={[styles.overviewIcon, {tintColor: Colors.brandPrimary}]} />
          </View>
          <View style={styles.overviewContent}>
            <Text style={styles.overviewLabel}>Phòng trống</Text>
            <Text style={styles.overviewValue}>{data?.overview?.availableRooms || 0}</Text>
          </View>
        </View>

        {/* Chờ duyệt */}
        <View style={[styles.overviewCardSimple, styles.cardPending]}>
          <View style={[styles.iconBadge, styles.iconWrapNeutral]}>
            <Image source={require('../../../../assets/icons/icon_light_report.png')} style={[styles.overviewIcon, {tintColor: Colors.textSecondary}]} />
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
          <Image source={require('../../../../assets/icons/icon_view_light.png')} style={styles.sectionIcon} />
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
          <Image source={require('../../../../assets/icons/icon_heart_favourite.png')} style={styles.sectionIcon} />
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
          <Image source={require('../../../../assets/icons/icon_light_report.png')} style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('LandlordRoom')}
          style={[styles.quickCard, {backgroundColor: Colors.darkGreen}]}
        >
          <View style={styles.quickGradient}>
            <View style={styles.quickLeft}>
              <View style={styles.quickIconWrap}>
                <Image
                  source={require('../../../../assets/icons/icon_room.png')}
                  style={styles.quickIcon}
                />
              </View>
              <Text style={styles.quickText}>Xem tất cả phòng</Text>
            </View>
            <Image
              source={require('../../../../assets/icons/icon_arrow_right.png')}
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
    paddingTop: responsiveSpacing(16),
    justifyContent: 'space-between',
  },
  overviewCardSimple: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    padding: responsiveSpacing(12),
    marginBottom: responsiveSpacing(12),
    borderWidth: 1,
    borderColor: Colors.gray200,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: scale(80),
  },
  cardTotal: {},
  cardRented: {},
  cardAvailable: {},
  cardPending: {},
  iconBadge: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: responsiveSpacing(12),
  },
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
  overviewContent: {
    flex: 1,
    justifyContent: 'center',
  },
  overviewLabel: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textSecondary,
    marginBottom: responsiveSpacing(4),
  },
  overviewValue: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.dearkOlive,
    flexWrap: 'nowrap',
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
  quickText: {fontFamily: Fonts.Roboto_Bold, fontSize: responsiveFont(16), color: Colors.white},
  quickArrow: {width: scale(18), height: scale(18), tintColor: Colors.white},
});