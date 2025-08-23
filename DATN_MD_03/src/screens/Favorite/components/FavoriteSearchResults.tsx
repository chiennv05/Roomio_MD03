import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  Easing,
  ViewToken,
} from 'react-native';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';
import {
  responsiveFont,
  responsiveSpacing,
} from '../../../utils/responsive';
import { Room } from '../../../types/Room';
import FavoriteRoomCard from './FavoriteRoomCard';
import { usePaginatedData } from '../../../hooks/usePaginatedData';
import EmptySearchAnimation from '../../../components/EmptySearchAnimation';
import LoadingAnimation from '../../../components/LoadingAnimation';

interface FavoriteSearchResultsProps {
  title: string;
  rooms: Room[];
  onRoomPress: (roomId: string) => void;
}

const FavoriteSearchResults: React.FC<FavoriteSearchResultsProps> = React.memo(({ title, rooms, onRoomPress }) => {
  // Animation for room cards
  const animatedValues = useRef<Map<string, Animated.Value>>(new Map()).current;
  const viewableItems = useRef<Set<string>>(new Set()).current;
  
  // Sử dụng pagination hook với 10 items per page cho hiệu suất tốt hơn
  const {
    displayedData,
    hasMore,
    isLoading,
    loadMore,
    reset,
    totalItems,
  } = usePaginatedData({
    data: rooms,
    pageSize: 10, // Tăng lên 10 để giảm số lần render
    initialPageCount: 1,
  });

  // Reset pagination when rooms data changes (new search) - optimized
  useEffect(() => {
    reset();
  }, [rooms.length, reset]); // Chỉ reset khi length thay đổi

  // Initialize animation value for a room
  const getAnimatedValue = useCallback((roomId: string) => {
    if (!animatedValues.has(roomId)) {
      animatedValues.set(roomId, new Animated.Value(0));
    }
    return animatedValues.get(roomId)!;
  }, [animatedValues]);

  // Handle viewability change for room cards (optimized)
  const onViewableItemsChanged = useCallback(({ viewableItems: visibleItems }: { viewableItems: ViewToken[] }) => {
    visibleItems.forEach(({ item, isViewable }) => {
      if (item?._id) {
        const roomId = item._id;
        const animValue = getAnimatedValue(roomId);

        if (isViewable && !viewableItems.has(roomId)) {
          viewableItems.add(roomId);

          // Animate in với stagger effect
          Animated.timing(animValue, {
            toValue: 1,
            duration: 400, // Giảm duration để mượt hơn
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start();
        } else if (!isViewable && viewableItems.has(roomId)) {
          viewableItems.delete(roomId);
        }
      }
    });
  }, [getAnimatedValue, viewableItems]);

  // Viewability config (optimized)
  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 30, // Tăng từ 20% lên 30% để giảm trigger
    minimumViewTime: 200, // Tăng thời gian để giảm animation không cần thiết
  }), []);

  // Animated Room Card Component (optimized)
  const AnimatedFavoriteRoomCard = useCallback(({ item }: { item: Room }) => {
    const roomId = item._id || '';
    if (!roomId) return <FavoriteRoomCard item={item} onPress={onRoomPress} />;
    
    const animValue = getAnimatedValue(roomId);

    const translateY = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [30, 0], // Giảm từ 50px xuống 30px
    });

    const opacity = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Animated.View
        style={[
          styles.animatedCard,
          {
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <FavoriteRoomCard
          item={item}
          onPress={onRoomPress}
        />
      </Animated.View>
    );
  }, [getAnimatedValue, onRoomPress]);

  // Footer component with loading indicator
  const renderFooter = () => {
    if (!hasMore && displayedData.length > 0) {
      return (
        <View style={styles.endMessage}>
          <Text style={styles.endText}>
            Đã hiển thị tất cả {totalItems} kết quả
          </Text>
        </View>
      );
    }

    if (isLoading) {
      return (
        <View style={styles.loadingFooter}>
          <LoadingAnimation size="medium" color={Colors.limeGreen} />
          <Text style={styles.loadingText}>Đang tải thêm...</Text>
        </View>
      );
    }

    return null;
  };

  // Empty component với Lottie animation (memoized)
  const renderEmptyComponent = useMemo(() => {
    const isSearching = title.includes('Tìm kiếm trong yêu thích');

    return (
      <EmptySearchAnimation
        title={isSearching ? 'Không tìm thấy phòng phù hợp' : 'Chưa có phòng yêu thích'}
        subtitle={isSearching ? 'Thử thay đổi từ khóa tìm kiếm khác' : 'Hãy thêm phòng vào danh sách yêu thích'}
      />
    );
  }, [title]);

  // Handle end reached for loading more data (optimized)
  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoading && displayedData.length > 0) {
      loadMore();
    }
  }, [hasMore, isLoading, loadMore, displayedData.length]);

  return (
    <View style={styles.container}>
      {/* Header với title */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {title}
          {totalItems > 0 && displayedData.length < totalItems && (
            <Text style={styles.countText}>
              {` (${displayedData.length}/${totalItems})`}
            </Text>
          )}
        </Text>
      </View>

      {/* Danh sách kết quả với lazy loading - optimized */}
      <FlatList
        data={displayedData}
        renderItem={AnimatedFavoriteRoomCard}
        keyExtractor={(item, index) => item._id || `room-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          displayedData.length === 0 && styles.emptyListContainer,
        ]}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyComponent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.2}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={8}
        initialNumToRender={5}
        updateCellsBatchingPeriod={100}
      />
    </View>
  );
});

// Memoized component để tránh re-render không cần thiết
FavoriteSearchResults.displayName = 'FavoriteSearchResults';

export default FavoriteSearchResults;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(16),
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    flex: 1,
  },
  countText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
  },
  listContainer: {
    paddingTop: responsiveSpacing(8),
    paddingBottom: responsiveSpacing(100), // Để tránh bị che bởi tab bar
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  separator: {
    height: responsiveSpacing(8),
  },
  loadingFooter: {
    paddingVertical: responsiveSpacing(20),
    alignItems: 'center',
  },
  loadingText: {
    marginTop: responsiveSpacing(8),
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
  },
  endMessage: {
    paddingVertical: responsiveSpacing(20),
    alignItems: 'center',
  },
  endText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
  },
  animatedCard: {
    marginBottom: responsiveSpacing(4),
  },
});
