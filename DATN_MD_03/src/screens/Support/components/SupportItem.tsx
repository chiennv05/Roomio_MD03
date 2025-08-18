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
import {Icons} from '../../../assets/icons';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
          color: Colors.statusOpen,
          text: 'Mở',
          bgColor: Colors.statusOpenBg,
        };
      case 'dangXuLy':
        return {
          color: Colors.statusProcessing,
          text: 'Đang xử lý',
          bgColor: Colors.statusProcessingBg,
        };
      case 'hoanTat':
        return {
          color: Colors.white, // Chữ trắng trên nền xanh đậm
          text: 'Hoàn tất',
          bgColor: Colors.statusCompleted, // Background xanh đậm như admin
        };
      default:
        return {
          color: Colors.statusLow,
          text: 'Không xác định',
          bgColor: Colors.statusLowBg,
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
      activeOpacity={0.8}>
      <View style={styles.content}>
        {/* Header with title and status */}
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryLabel}>
                  {getCategoryText(item.category)}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={[styles.statusBadge, {backgroundColor: statusInfo.bgColor}]}>
            <View style={styles.statusBadgeContent}>
              {item.status === 'hoanTat' ? (
                <Image
                  source={{uri: Icons.IconCheck}}
                  style={[styles.statusIcon, {tintColor: statusInfo.color}]}
                  resizeMode="contain"
                />
              ) : item.status === 'dangXuLy' ? (
                <Image
                  source={{uri: Icons.IconWarning}}
                  style={[styles.statusIcon, {tintColor: statusInfo.color}]}
                  resizeMode="contain"
                />
              ) : (
                <Image
                  source={{uri: Icons.IconEyesOn}}
                  style={[styles.statusIcon, {tintColor: statusInfo.color}]}
                  resizeMode="contain"
                />
              )}
              <Text style={[styles.statusBadgeText, {color: statusInfo.color}]}>
                {statusInfo.text}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {/* Action buttons for modifiable items */}
        {canModify && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={handleEdit}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Image
                source={{uri: Icons.IconEditWhite}}
                style={[styles.actionIcon, {tintColor: Colors.white}]}
                resizeMode="contain"
              />
              <Text style={styles.editButtonText}>Chỉnh sửa</Text>
            </TouchableOpacity>

            {onDelete && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Image
                  source={{uri: Icons.IconTrashCanRed}}
                  style={[styles.actionIcon, {tintColor: Colors.white}]}
                  resizeMode="contain"
                />
                <Text style={styles.deleteButtonText}>Xóa</Text>
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
    borderRadius: scale(16),
    padding: responsiveSpacing(20),
    marginBottom: responsiveSpacing(12),
    marginHorizontal: responsiveSpacing(16),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: responsiveSpacing(12),
  },
  titleContainer: {
    flex: 1,
    marginRight: responsiveSpacing(12),
  },
  title: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    lineHeight: responsiveFont(22),
    marginBottom: responsiveSpacing(8),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(8),
    borderRadius: scale(20),
    minWidth: scale(80),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIcon: {
    width: scale(14),
    height: scale(14),
    marginRight: responsiveSpacing(4),
  },
  statusBadgeText: {
    fontSize: responsiveFont(11),
    fontFamily: Fonts.Roboto_Bold,
  },
  description: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.unselectedText,
    marginBottom: responsiveSpacing(16),
    lineHeight: responsiveFont(20),
  },
  dateText: {
    fontSize: responsiveFont(11),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
  },
  categoryContainer: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: responsiveSpacing(8),
    paddingVertical: responsiveSpacing(2),
    borderRadius: scale(8),
  },
  categoryLabel: {
    fontSize: responsiveFont(10),
    fontFamily: Fonts.Roboto_Medium,
    color: Colors.unselectedText,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: responsiveSpacing(12),
    marginTop: responsiveSpacing(4),
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: responsiveSpacing(10),
    paddingHorizontal: responsiveSpacing(16),
    borderRadius: scale(25),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: scale(16),
    height: scale(16),
    marginRight: responsiveSpacing(6),
  },
  editButton: {
    backgroundColor: '#22C55E', // Soft green - không chói
  },
  deleteButton: {
    backgroundColor: '#EF4444', // Soft red - không chói
  },
  editButtonText: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
  },
  deleteButtonText: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
  },
});

export default SupportItem;
