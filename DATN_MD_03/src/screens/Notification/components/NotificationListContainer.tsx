import React from 'react';
import { FlatList, RefreshControl, View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import NotificationItemCard from './NotificationItemCard';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';
import { responsiveSpacing, responsiveFont, moderateScale } from '../../../utils/responsive';
import { Icons } from '../../../assets/icons';

interface Notification {
  id: string;
  title: string;
  content: string;
  time: string;
  date: string;
  isRead: boolean;
  type: string;
}

interface NotificationListContainerProps {
  notifications: Notification[];
  onRefresh?: () => void;
  refreshing?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  onMarkAsRead?: (notificationId: string) => void;
}

const NotificationListContainer: React.FC<NotificationListContainerProps> = ({ 
  notifications,
  onRefresh,
  refreshing = false,
  onLoadMore,
  loadingMore = false,
  onMarkAsRead,
}) => {
  if (!notifications || notifications.length === 0) return null;

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={{
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

  const renderItem = ({ item }: { item: Notification }) => (
    <View style={styles.notificationWrapper}>
      {/* Ngày ở góc trên ngoài */}
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>
      
      {/* Notification Card */}
      <NotificationItemCard
        title={item.title}
        content={item.content}
        time={item.time}
        date={item.date}
        isRead={item.isRead}
        type={item.type}
        icon={getNotificationIcon(item.isRead)}
        onPress={() => handleNotificationPress(item)}
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
    />
  );
};

const styles = StyleSheet.create({
  notificationWrapper: {
    position: 'relative',
    marginTop: responsiveSpacing(14),
  },
  dateContainer: {
    position: 'absolute',
    top: -responsiveSpacing(16),
    right: responsiveSpacing(32),
    backgroundColor: Colors.white,
    width: responsiveSpacing(104),
    height: responsiveSpacing(32),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(16),
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
  
  },
  dateText: {
    fontSize: 14,
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
  },
});

export default NotificationListContainer; 