import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Support} from '../../../types/Support';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../types/route';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {
  responsiveFont,
  responsiveSpacing,
  scale,
} from '../../../utils/responsive';

interface SupportItemProps {
  item: Support;
  onPress: (item: Support) => void;
  onDelete?: (item: Support) => void;
}

type SupportItemNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SupportItem: React.FC<SupportItemProps> = ({item, onPress, onDelete}) => {
  const navigation = useNavigation<SupportItemNavigationProp>();
  // Get status color and text
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'mo':
        return {
          color: '#A0A0A0', // Gray color for "Mở" status
          text: 'Mở',
          bgColor: Colors.statusOpenBg,
        };
      case 'dangXuLy':
        return {
          color: '#FFC107', // Yellow background for "Đang xử lý" status
          text: 'Đang xử lý',
          bgColor: Colors.limeGreenOpacityLight,
        };
      case 'hoanTat':
        return {
          color: Colors.limeGreen, // Green for "Hoàn tất"
          text: 'Hoàn tất',
          bgColor: Colors.limeGreenOpacityLight,
        };
      default:
        return {
          color: Colors.statusOpen,
          text: 'Không xác định',
          bgColor: Colors.statusOpenBg,
        };
    }
  };

  // Get category text
  const getCategoryText = (category: string) => {
    switch (category) {
      case 'kyThuat':
        return 'Kỹ thuật';
      case 'thanhToan':
        return 'Thanh toán';
      case 'hopDong':
        return 'Hợp đồng';
      case 'goiDangKy':
        return 'Gói đăng ký';
      case 'khac':
        return 'Khác';
      default:
        return 'Không xác định';
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return '';
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const statusInfo = getStatusInfo(item.status);
  const canModify = item.status === 'mo';

  const handleDelete = (e: any) => {
    e.stopPropagation(); // Prevent triggering the onPress event
    if (onDelete && canModify) {
      onDelete(item);
    }
  };

  const handleEdit = (e: any) => {
    e.stopPropagation(); // Prevent triggering the onPress event
    if (canModify && item._id) {
      navigation.navigate('UpdateSupport', {supportId: item._id});
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(item)}
      activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <View
            style={[styles.statusBadge, {backgroundColor: statusInfo.color}]}>
            <Text style={[
              styles.statusBadgeText, 
              {color: (statusInfo.color === Colors.limeGreen || statusInfo.color === '#FFC107') ? Colors.black : Colors.white}
            ]}>{statusInfo.text}</Text>
          </View>
        </View>

        {/* Hiển thị content mô tả với status badge */}
        <View style={styles.categoryRow}>
          <Text style={styles.categoryLabel} numberOfLines={1}>
            {getCategoryText(item.category)}
          </Text>
        </View>

        {/* Hiển thị nội dung mô tả */}
        {item.content && (
          <Text style={[styles.description,{color: "#444444" , fontSize: responsiveFont(16)}]} numberOfLines={2}>
            {item.content}
          </Text>
        )}

        <View style={styles.bottomRow}>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>

        {/* Action buttons only for modifiable items */}
        {canModify && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={handleEdit}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={styles.editButtonText}>Chỉnh sửa yêu cầu</Text>
            </TouchableOpacity>

            {onDelete && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Text style={styles.deleteButtonText}>Xóa yêu cầu</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: scale(24),
    padding: responsiveSpacing(16),
    marginBottom: responsiveSpacing(12),
    marginHorizontal: responsiveSpacing(0),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: responsiveSpacing(8),
  },
  title: {
    fontSize: responsiveFont(24),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    flex: 1,
    marginRight: responsiveSpacing(12),
  },
  statusBadge: {
    paddingHorizontal: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(6),
    borderRadius: scale(20),
    minWidth: scale(60),
    alignItems: 'center',
  },
  statusBadgeText: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
  },
  categoryRow: {
    marginBottom: responsiveSpacing(8),
  },
  categoryLabel: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Medium,
    color: Colors.darkGreen,
    fontWeight: '700',
  },
  description: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    marginBottom: responsiveSpacing(8),
    lineHeight: responsiveFont(20),
  },
  bottomRow: {
    marginBottom: responsiveSpacing(8),
  },
  dateText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: "#A0A0A0",
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: responsiveSpacing(8),
  },
  actionButton: {
    flex: 1,
    paddingVertical: responsiveSpacing(12),
    paddingHorizontal: responsiveSpacing(16),
    borderRadius: scale(25),
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: Colors.darkGreen,
  },
  deleteButton: {
    backgroundColor: Colors.figmaRed,
  },
  editButtonText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
  },
  deleteButtonText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
  },

});

export default React.memo(SupportItem);
