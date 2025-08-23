import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
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
          color: Colors.statusOpen, // gray badge bg
          text: 'Mới Mở',
          bgColor: Colors.statusOpenBg,
        };
      case 'dangXuLy':
        return {
          color: Colors.warning,
          text: 'Đang xử lý',
          bgColor: Colors.limeGreenOpacityLight,
        };
      case 'hoanTat':
        return {
          color: Colors.limeGreen,
          text: 'Hoàn tất',
          bgColor: Colors.lightGreenBackground,
        };
      default:
        return {
          color: Colors.textGray,
          text: 'Không xác định',
          bgColor: Colors.lightGray,
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
    console.log(
      '🗑️ SupportItem handleDelete called for item:',
      item._id,
      'canModify:',
      canModify,
    );
    if (onDelete && canModify) {
      onDelete(item);
    } else {
      console.log(
        '❌ Cannot delete - onDelete:',
        !!onDelete,
        'canModify:',
        canModify,
      );
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
            <Text style={styles.statusBadgeText}>{statusInfo.text}</Text>
          </View>
        </View>

        {/* Hiển thị nội dung mô tả */}
        {item.content && (
          <Text style={styles.description} numberOfLines={2}>
            {item.content}
          </Text>
        )}

        <View style={styles.bottomRow}>
          <View style={styles.metaInfo}>
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            <Text style={styles.categoryLabel}>
              {getCategoryText(item.category)}
            </Text>
          </View>
        </View>

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
    borderRadius: scale(12),
    padding: responsiveSpacing(16),
    marginBottom: responsiveSpacing(8), // Giảm margin bottom
    marginHorizontal: responsiveSpacing(8), // Giảm margin ngang để item rộng hơn
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    flex: 1,
    marginRight: responsiveSpacing(8),
  },
  statusBadge: {
    paddingHorizontal: responsiveSpacing(20),
    paddingVertical: responsiveSpacing(8),
    borderRadius: scale(20),
    minWidth: scale(50),
    alignItems: 'center',
  },
  statusBadgeText: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
  },
  description: {
    fontSize: responsiveFont(13),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    marginBottom: responsiveSpacing(8),
    lineHeight: responsiveFont(20),
  },
  bottomRow: {
    marginBottom: responsiveSpacing(12),
  },
  metaInfo: {
    flexDirection: 'column',
  },
  dateText: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    marginBottom: responsiveSpacing(4),
  },
  categoryLabel: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: responsiveSpacing(8),
  },
  actionButton: {
    flex: 1,
    paddingVertical: responsiveSpacing(10),
    paddingHorizontal: responsiveSpacing(12),
    borderRadius: scale(20),
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: Colors.figmaGreen,
  },
  deleteButton: {
    backgroundColor: Colors.figmaRed,
  },
  editButtonText: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  deleteButtonText: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
});

export default SupportItem;
