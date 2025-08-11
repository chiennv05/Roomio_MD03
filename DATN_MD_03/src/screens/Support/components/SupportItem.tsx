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
          color: Colors.error,
          text: 'Mở',
          bgColor: Colors.lightOrangeBackground,
        };
      case 'dangXuLy':
        return {
          color: Colors.warning,
          text: 'Đang xử lý',
          bgColor: Colors.lightYellowBackground,
        };
      case 'hoanTat':
        return {
          color: Colors.success,
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
      case 'khac':
        return 'Khác';
      default:
        return 'Không xác định';
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) {return '';}
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const statusInfo = getStatusInfo(item.status);
  const canModify = item.status == 'mo';

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
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryText}>
              {getCategoryText(item.category)}
            </Text>
          </View>

          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <View
            style={[
              styles.statusContainer,
              {
                backgroundColor: statusInfo.bgColor,
                borderColor: statusInfo.color,
              },
            ]}>
            <Text style={[styles.statusText, {color: statusInfo.color}]}>
              {statusInfo.text}
            </Text>
          </View>

          <View style={styles.buttonGroup}>
            {canModify && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleEdit}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <View style={styles.editButton}>
                  <Image
                    source={require('../../../assets/icons/icon_edit_white.png')}
                    style={styles.actionIcon}
                    resizeMode="contain"
                  />
                </View>
              </TouchableOpacity>
            )}

            {canModify && onDelete && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDelete}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <View style={styles.deleteButton}>
                  <Image
                    source={require('../../../assets/icons/icon_delete.png')}
                    style={styles.actionIcon}
                    resizeMode="contain"
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    padding: responsiveSpacing(16),
    marginBottom: responsiveSpacing(12),
    marginHorizontal: responsiveSpacing(16),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
    marginBottom: responsiveSpacing(8),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: responsiveSpacing(8),
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightBlueBackground,
    paddingHorizontal: responsiveSpacing(8),
    paddingVertical: responsiveSpacing(4),
    borderRadius: scale(6),
  },
  categoryText: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.info,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    marginLeft: responsiveSpacing(4),
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusContainer: {
    borderWidth: 1,
    borderRadius: scale(8),
    paddingHorizontal: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(6),
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Bold,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveSpacing(8),
  },
  actionButton: {
    padding: responsiveSpacing(4),
  },
  editButton: {
    backgroundColor: Colors.info,
    padding: responsiveSpacing(8),
    borderRadius: scale(8),
    marginRight: responsiveSpacing(8),
  },
  deleteButton: {
    backgroundColor: Colors.error,
    padding: responsiveSpacing(8),
    borderRadius: scale(8),
  },
  actionIcon: {
    width: scale(16),
    height: scale(16),
    tintColor: Colors.white,
  },
  arrow: {
    marginLeft: responsiveSpacing(8),
  },
});

export default SupportItem;
