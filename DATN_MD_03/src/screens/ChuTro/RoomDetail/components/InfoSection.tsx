import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, responsiveSpacing} from '../../../../utils/responsive';
import {Room} from '../../../../types';

interface InfoSectionProps {
  room: Room;
  formatNumber: (num: number) => string;
}

const InfoSection: React.FC<InfoSectionProps> = ({room, formatNumber}) => {
  const getStatusText = (status: string) => {
    switch (status) {
      case 'trong':
        return 'Còn trống';
      case 'daThue':
        return 'Đã thuê';
      case 'an':
        return 'Đã ẩn';
      default:
        return status;
    }
  };

  const getApprovalStatusText = (status: string) => {
    switch (status) {
      case 'choDuyet':
        return 'Chờ duyệt';
      case 'daDuyet':
        return 'Đã duyệt';
      case 'tuChoi':
        return 'Từ chối';
      default:
        return status;
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Số phòng:</Text>
        <Text style={styles.infoValue}>{room.roomNumber}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Diện tích:</Text>
        <Text style={styles.infoValue}>{room.area} m²</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Giá thuê:</Text>
        <Text style={styles.infoValue}>
          {formatNumber(room.rentPrice)} đ/tháng
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Số người tối đa:</Text>
        <Text style={styles.infoValue}>{room.maxOccupancy} người</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Trạng thái:</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                room.status && room.status === 'daThue'
                  ? '#4CAF50' + '30'
                  : room.status && room.status === 'trong'
                  ? '#FF9800' + '30'
                  : '#9E9E9E' + '30',
            },
          ]}>
          <Text
            style={[
              styles.statusText,
              {
                color:
                  room.status && room.status === 'daThue'
                    ? '#4CAF50'
                    : room.status && room.status === 'trong'
                    ? '#FF9800'
                    : '#9E9E9E',
              },
            ]}>
            {getStatusText(room.status || '')}
          </Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Trạng thái duyệt:</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                room.approvalStatus && room.approvalStatus === 'daDuyet'
                  ? '#4CAF50' + '30'
                  : room.approvalStatus && room.approvalStatus === 'choDuyet'
                  ? '#2196F3' + '30'
                  : '#F44336' + '30',
            },
          ]}>
          <Text
            style={[
              styles.statusText,
              {
                color:
                  room.approvalStatus && room.approvalStatus === 'daDuyet'
                    ? '#4CAF50'
                    : room.approvalStatus && room.approvalStatus === 'choDuyet'
                    ? '#2196F3'
                    : '#F44336',
              },
            ]}>
            {getApprovalStatusText(room.approvalStatus || '')}
          </Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Lượt xem:</Text>
        <Text style={styles.infoValue}>{room.stats?.viewCount || 0}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Lượt yêu thích:</Text>
        <Text style={styles.infoValue}>{room.stats?.favoriteCount || 0}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: responsiveSpacing(15),
    marginTop: responsiveSpacing(15),
    borderRadius: 10,
    padding: responsiveSpacing(15),
    elevation: 2,
  },
  sectionTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(10),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: responsiveSpacing(5),
  },
  infoLabel: {
    fontSize: responsiveFont(14),
    color: Colors.textGray,
    flex: 1,
  },
  infoValue: {
    fontSize: responsiveFont(14),
    color: Colors.black,
    flex: 2,
    textAlign: 'right',
    fontFamily: Fonts.Roboto_Bold,
  },
  statusBadge: {
    paddingHorizontal: responsiveSpacing(10),
    paddingVertical: responsiveSpacing(4),
    borderRadius: 20,
  },
  statusText: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Bold,
  },
});

export default InfoSection; 