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

// Định nghĩa kiểu dữ liệu cho thông báo đã được format
export interface FormattedNotification {
  id: string;
  title: string;
  content: string;
  time: string; // text hiển thị tương đối
  date: string; // DD/MM/YYYY hiển thị trong thẻ
  groupLabel: string; // Nhãn nhóm: Hôm nay | Hôm qua | DD/MM/YYYY
  timestamp: number; // Dùng để sắp xếp chính xác
  isRead: boolean;
  type: string;
}

// Interface cho nhóm thông báo theo ngày
interface NotificationGroup {
  dateLabel: string; // "Hôm nay", "Hôm qua", "19/08/2025"
  notifications: FormattedNotification[];
}

interface NotificationListContainerProps {
  notifications: FormattedNotification[];
  onRefresh?: () => void;
  refreshing?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  onMarkAsRead?: (notification: FormattedNotification) => void;
  onDeleteNotification?: (notificationId: string) => void;
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
  if (!notifications || notifications.length === 0) {
    return null;
  }

  // Hàm nhóm thông báo theo ngày
  const groupNotificationsByDate = (notifications: FormattedNotification[]): NotificationGroup[] => {
    const groups: { [key: string]: FormattedNotification[] } = {};

    notifications.forEach(notification => {
      const key = notification.groupLabel || notification.date;
      if (!groups[key]) groups[key] = [];
      groups[key].push(notification);
    });

    const orderIndex = (label: string) => (label === 'Hôm nay' ? 0 : label === 'Hôm qua' ? 1 : 2);

    return Object.keys(groups)
      .map(label => ({
        dateLabel: label,
        notifications: groups[label].sort((a, b) => b.timestamp - a.timestamp),
      }))
      .sort((a, b) => {
        const aOrder = orderIndex(a.dateLabel);
        const bOrder = orderIndex(b.dateLabel);
        if (aOrder !== bOrder) return aOrder - bOrder;
        // If both are custom dates, sort by latest item's timestamp desc
        const aTs = a.notifications[0]?.timestamp ?? 0;
        const bTs = b.notifications[0]?.timestamp ?? 0;
        return bTs - aTs;
      });
  };

  const notificationGroups = groupNotificationsByDate(notifications);

  const handleNotificationPress = (notification: FormattedNotification) => {
    if (onMarkAsRead) {
      onMarkAsRead(notification);
    }
  };

  const handleDeleteNotification = (notificationId: string) => {
    if (onDeleteNotification) {
      onDeleteNotification(notificationId);
    }
  };

  const renderFooter = () => {
    if (!loadingMore) {
      return null;
    }
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={Colors.limeGreen} />
      </View>
    );
  };

  const renderDateHeader = (dateLabel: string) => (
    <View style={styles.dateHeader}>
      <View style={styles.dateHeaderIndicator} />
      <Text style={styles.dateHeaderText}>{dateLabel}</Text>
    </View>
  );

  const renderNotificationItem = (notification: FormattedNotification, index: number) => (
    <View style={[
      styles.notificationWrapper, 
      index === 0 && styles.firstItem
    ]}>
      <NotificationItemCard
        id={notification.id}
        title={notification.title}
        content={notification.content}
        time={notification.time}
        date={notification.date}
        isRead={notification.isRead}
        type={notification.type}
        isUnread={!notification.isRead}
        onPress={() => handleNotificationPress(notification)}
        onDelete={() => handleDeleteNotification(notification.id)}
      />
    </View>
  );

  const renderGroup = ({ item }: { item: NotificationGroup }) => (
    <View style={styles.groupContainer}>
      {renderDateHeader(item.dateLabel)}
      {item.notifications.map((notification, index) => 
        renderNotificationItem(notification, index)
      )}
    </View>
  );

  return (
    <FlatList
      data={notificationGroups}
      keyExtractor={(item) => item.date}
      renderItem={renderGroup}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.limeGreen]}
          tintColor={Colors.limeGreen}
        />
      }
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingFooter: {
    paddingVertical: responsiveSpacing(20),
    alignItems: 'center',
  },
  dateHeader: {
    paddingVertical: responsiveSpacing(12),
    paddingHorizontal: responsiveSpacing(16),
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateHeaderText: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Roboto_Bold, // Đổi sang Bold để nổi bật
    color: Colors.black, // Đổi về black để rõ ràng
    marginBottom: 0,
    letterSpacing: 0.5, // Giảm letter spacing
    fontWeight: '700', // Font weight mạnh
  },
  dateHeaderIndicator: {
    width: moderateScale(4),
    height: moderateScale(18),
    backgroundColor: Colors.limeGreen,
    borderRadius: moderateScale(2),
    marginRight: responsiveSpacing(8),
  },
  groupContainer: {
    backgroundColor: 'transparent',
    marginBottom: responsiveSpacing(8),
  },
  notificationWrapper: {
    position: 'relative',
    marginBottom: responsiveSpacing(1),
  },
  firstItem: {
    marginTop: responsiveSpacing(8),
  },
  container: {
    paddingBottom: responsiveSpacing(20),
  },
});

export default NotificationListContainer;
