import React from 'react';
import {
  FlatList,
  RefreshControl,
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
} from 'react-native';
import NotificationItemCard from './NotificationItemCard';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {responsiveSpacing, moderateScale} from '../../../utils/responsive';
import {Icons} from '../../../assets/icons';

// Định nghĩa kiểu dữ liệu cho thông báo đã được format
export interface FormattedNotification {
  id: string;
  title: string;
  content: string;
  time: string;
  date: string;
  isRead: boolean;
  type: string;
}

interface NotificationListContainerProps {
  notifications: FormattedNotification[];
  onRefresh?: () => void;
  refreshing?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  onMarkAsRead?: (notification: FormattedNotification) => void;
  onDeleteNotification?: (notificationId: string) => void; // Thêm callback xóa thông báo
}

const NotificationListContainer: React.FC<NotificationListContainerProps> = ({
  notifications,
  onRefresh,
  refreshing = false,
  onLoadMore,
  loadingMore = false,
  onMarkAsRead,
  onDeleteNotification,
}) => {
  if (!notifications || notifications.length === 0) return null;

  const handleNotificationPress = (notification: FormattedNotification) => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification);
    }
  };

  const handleDeleteNotification = (notificationId: string) => {
    if (onDeleteNotification) {
      onDeleteNotification(notificationId);
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View
        style={{
          paddingVertical: responsiveSpacing(20),
          alignItems: 'center',
        }}>
        <ActivityIndicator size="small" color={Colors.limeGreen} />
      </View>
    );
  };

  const getNotificationIcon = (isRead: boolean) => {
    if (isRead) {
      return Icons.IconTick; // Tick icon cho đã đọc
    } else {
      return Icons.IconWarning; // Warning icon cho chưa đọc
    }
  };

  const renderItem = ({item}: {item: FormattedNotification}) => (
    <View style={styles.notificationWrapper}>
      {/* Ngày hiển thị dưới dạng text tích hợp trong thông báo */}
      <NotificationItemCard
        id={item.id}
        title={item.title}
        content={item.content}
        time={item.time}
        date={item.date}
        isRead={item.isRead}
        type={item.type}
        icon={getNotificationIcon(item.isRead)}
        onPress={() => handleNotificationPress(item)}
        onDelete={() => handleDeleteNotification(item.id)}
      />
    </View>
  );

  return (
    <FlatList
      data={notifications}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.limeGreen]}
            tintColor={Colors.limeGreen}
          />
        ) : undefined
      }
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.1}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: responsiveSpacing(20),
      }}
      style={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  notificationWrapper: {
    position: 'relative',
    marginTop: 0,
  },
  listContainer: {
    flex: 1,
  },
});

export default NotificationListContainer;
