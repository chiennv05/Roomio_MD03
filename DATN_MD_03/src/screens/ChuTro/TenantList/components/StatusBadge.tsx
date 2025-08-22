import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, scale, verticalScale} from '../../../../utils/responsive';

interface StatusBadgeProps {
  status: string;
  size?: 'small' | 'medium' | 'large';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({status, size = 'medium'}) => {
  const getStatusColor = (statusValue: string) => {
    switch (statusValue) {
      case 'active':
        return Colors.limeGreen;
      case 'pending':
      case 'pending_signature':
      case 'pending_approval':
        return Colors.primaryGreen;
      case 'expired':
        return Colors.red;
      case 'needs_resigning':
        return Colors.primaryGreen;
      case 'draft':
        return Colors.darkGray;
      default:
        return Colors.darkGreen;
    }
  };

  const getStatusText = (statusValue: string) => {
    switch (statusValue) {
      case 'active':
        return 'Đang hoạt động';
      case 'pending':
        return 'Chờ xác nhận';
      case 'expired':
        return 'Hết hạn';
      case 'draft':
        return 'Bản nháp';
      case 'pending_signature':
        return 'Chờ ký';
      case 'pending_approval':
        return 'Chờ phê duyệt';
      case 'needs_resigning':
        return 'Cần gia hạn';
      default:
        return statusValue || 'Không xác định';
    }
  };

  // Xác định kích thước dựa trên prop size
  const getBadgeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: scale(8),
          paddingVertical: verticalScale(2),
          fontSize: responsiveFont(10),
        };
      case 'large':
        return {
          paddingHorizontal: scale(16),
          paddingVertical: verticalScale(6),
          fontSize: responsiveFont(14),
        };
      default:
        return {
          paddingHorizontal: scale(12),
          paddingVertical: verticalScale(4),
          fontSize: responsiveFont(12),
        };
    }
  };

  const {fontSize, ...badgeSizeStyle} = getBadgeStyle();

  return (
    <View
      style={[
        styles.statusBadge,
        {backgroundColor: getStatusColor(status)},
        badgeSizeStyle,
      ]}>
      <Text style={[styles.statusText, {fontSize}]}>{getStatusText(status)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
  },
  statusText: {
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
  },
});

export default StatusBadge;
