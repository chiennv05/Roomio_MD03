import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {Support} from '../../../types/Support';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../types/route';

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
        return {color: '#f44336', text: 'Mở'};
      case 'dangXuLy':
        return {color: '#ff9800', text: 'Đang xử lý'};
      case 'hoanTat':
        return {color: '#4caf50', text: 'Hoàn tất'};
      default:
        return {color: '#9e9e9e', text: 'Không xác định'};
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
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const statusInfo = getStatusInfo(item.status);
  const canModify = item.status !== 'hoanTat';

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
            style={[styles.statusContainer, {borderColor: statusInfo.color}]}>
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
                <View
                  style={{
                    backgroundColor: '#007bff',
                    padding: 5,
                    borderRadius: 10,
                    marginRight: 10,
                  }}>
                  <Image
                    source={require('../../../assets/icons/icon_edit_white.png')}
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
                <View
                  style={{
                    backgroundColor: 'red',
                    padding: 5,
                    borderRadius: 10,
                  }}>
                  <Image
                    source={require('../../../assets/icons/icon_delete.png')}
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
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    color: '#555',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusContainer: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 4,
  },
  arrow: {
    marginLeft: 8,
  },
});

export default SupportItem;
