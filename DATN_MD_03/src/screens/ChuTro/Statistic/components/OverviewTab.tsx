import React from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, responsiveSpacing} from '../../../../utils/responsive';

interface OverviewTabProps {
  data: any;
  formatMoney: (value: number) => string;
}

const OverviewTab = ({data, formatMoney}: OverviewTabProps) => {
  return (
    <View style={styles.statsGrid}>
      {/* Tổng doanh thu */}
      <View style={[styles.statCard, styles.whiteCard]}>
        <View style={styles.statHeaderRow}>
          <Image
            source={require('../../../../assets/icons/icon_tien_coc.png')}
            style={styles.statIcon}
          />
          <Text style={styles.statLabel}>Tổng doanh thu</Text>
        </View>
        <Text style={styles.statValue}>{formatMoney(data?.revenue?.totalRevenue || 0)} VND</Text>
      </View>

      {/* Tổng phòng */}
      <View style={[styles.statCard, styles.whiteCard]}>
        <View style={styles.statHeaderRow}>
          <Image
            source={require('../../../../assets/icons/icon_room.png')}
            style={styles.statIcon}
          />
          <Text style={styles.statLabel}>Tổng phòng</Text>
        </View>
        <Text style={styles.statValue}>{data?.overview?.totalRooms || 0} Phòng</Text>
      </View>

      {/* Hợp đồng hiệu lực */}
      <View style={[styles.statCard, styles.whiteCard]}>
        <View style={styles.statHeaderRow}>
          <Image
            source={require('../../../../assets/icons/icon_contract.png')}
            style={styles.statIcon}
          />
          <Text style={styles.statLabel}>Hợp đồng hiệu lực</Text>
        </View>
        <Text style={styles.statValue}>{data?.overview?.activeContracts || 0} Hợp đồng</Text>
      </View>

      {/* Phòng đang thuê */}
      <View style={[styles.statCard, styles.whiteCard]}>
        <View style={styles.statHeaderRow}>
          <Image
            source={require('../../../../assets/icons/icon_person.png')}
            style={styles.statIcon}
          />
          <Text style={styles.statLabel}>Phòng đang thuê</Text>
        </View>
        <Text style={styles.statValue}>{data?.overview?.rentedRooms || 0} Phòng</Text>
      </View>
    </View>
  );
};

export default OverviewTab;

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: responsiveSpacing(16),
    marginTop: responsiveSpacing(20),
    gap: responsiveSpacing(16),
  },
  statCard: {
    width: '47%',
    borderRadius: 16,
    padding: responsiveSpacing(16),
    shadowColor: Colors.shadowDefault,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  whiteCard: {
    backgroundColor: Colors.white,
  },
  statHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing(8),
  },
  statIcon: {
    width: 16,
    height: 16,
    tintColor: Colors.darkGreen,
    marginRight: responsiveSpacing(8),
  },
  statLabel: {
    fontFamily: Fonts.Roboto_Medium,
    fontSize: responsiveFont(12),
    color: Colors.textSecondary,
  },
  statValue: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(18),
    color: Colors.black,
  },
});