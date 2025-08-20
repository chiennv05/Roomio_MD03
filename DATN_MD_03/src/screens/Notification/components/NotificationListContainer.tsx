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
  time: string;
  date: string;
  isRead: boolean;
  type: string;
}

// Interface cho nhóm thông báo theo ngày
interface NotificationGroup {
  date: string;
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
      const dateKey = notification.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(notification);
    });

    // Chuyển đổi thành array và sắp xếp theo ngày
    return Object.keys(groups)
      .map(dateKey => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        let dateLabel = dateKey;
        if (dateKey === 'Hôm nay') {
          dateLabel = 'Hôm nay';
        } else if (dateKey === 'Hôm qua') {
          dateLabel = 'Hôm qua';
        } else {
          // Giữ nguyên format ngày nếu không phải hôm nay/hôm qua
          dateLabel = dateKey;
        }

        return {
          date: dateKey,
          dateLabel,
          notifications: groups[dateKey].sort((a, b) => {
            // Sắp xếp theo thời gian, mới nhất lên đầu
            const timeA = new Date(a.time).getTime();
            const timeB = new Date(b.time).getTime();
            return timeB - timeA;
          }),
        };
      })
      .sort((a, b) => {
        // Sắp xếp nhóm theo ngày, mới nhất lên đầu
        const dateOrder = { 'Hôm nay': 0, 'Hôm qua': 1 };
        const orderA = dateOrder[a.dateLabel as keyof typeof dateOrder] ?? 2;
        const orderB = dateOrder[b.dateLabel as keyof typeof dateOrder] ?? 2;
        return orderA - orderB;
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
      <Text style={styles.dateHeaderText}>{dateLabel}</Text>
      <View style={styles.dateHeaderLine} />
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
    backgroundColor: Colors.white,
  },
  dateHeaderText: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Roboto_Bold, // Đổi sang Bold để nổi bật
    color: Colors.black, // Đổi về black để rõ ràng
    marginBottom: responsiveSpacing(6),
    letterSpacing: 0.5, // Giảm letter spacing
    fontWeight: '700', // Font weight mạnh
  },
  dateHeaderLine: {
    height: 2, // Tăng từ 1 lên 2 để đậm hơn
    backgroundColor: Colors.darkGray, // Đổi về darkGray để nổi bật
    width: '100%',
    opacity: 1, // Bỏ opacity để rõ ràng
  },
  groupContainer: {
    backgroundColor: Colors.white,
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
