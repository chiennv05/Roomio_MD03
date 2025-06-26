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
  responsiveSpacing 
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

const FavoriteSearchResults: React.FC<FavoriteSearchResultsProps> = ({
  title,
  rooms,
  onRoomPress,
}) => {
  // Animation for room cards
  const animatedValues = useRef<Map<string, Animated.Value>>(new Map()).current;
  const viewableItems = useRef<Set<string>>(new Set()).current;

  // Use pagination hook with 8 items per page for better performance
  const {
    displayedData,
    hasMore,
    isLoading,
    loadMore,
    reset,
    totalItems,
    currentPage
  } = usePaginatedData({
    data: rooms,
    pageSize: 8, // Show 8 rooms initially, then load 8 more each time
    initialPageCount: 1
  });

  // Reset pagination when rooms data changes (new search)
  useEffect(() => {
    reset();
  }, [rooms, reset]);

  // Initialize animation value for a room
  const getAnimatedValue = useCallback((roomId: string) => {
    if (!animatedValues.has(roomId)) {
      animatedValues.set(roomId, new Animated.Value(0));
    }
    return animatedValues.get(roomId)!;
  }, [animatedValues]);

  // Handle viewability change for room cards
  const onViewableItemsChanged = useCallback(({ viewableItems: visibleItems }: { viewableItems: ViewToken[] }) => {
    visibleItems.forEach(({ item, isViewable }) => {
      if (item && item._id) {
        const animValue = getAnimatedValue(item._id);
        
        if (isViewable && !viewableItems.has(item._id)) {
          viewableItems.add(item._id);
          
          // Animate in with stagger effect
          Animated.timing(animValue, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start();
        } else if (!isViewable && viewableItems.has(item._id)) {
          viewableItems.delete(item._id);
          
          // Optional: animate out when not viewable
          Animated.timing(animValue, {
            toValue: 0,
            duration: 300,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }).start();
        }
      }
    });
  }, [getAnimatedValue, viewableItems]);

  // Viewability config
  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 20, // Trigger when 20% of item is visible
    minimumViewTime: 100, // Minimum time in ms before triggering
  }), []);

  // Animated Room Card Component
  const AnimatedFavoriteRoomCard = useCallback(({ item }: { item: Room }) => {
    const animValue = getAnimatedValue(item._id || '');
    
    const translateY = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0], // Slide up from 50px below
    });

    const opacity = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const scale = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1], // Scale from 80% to 100%
    });

    return (
      <Animated.View
        style={[
          styles.animatedCard,
          {
            opacity,
            transform: [
              { translateY },
              { scale },
            ],
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

  // Empty component with Lottie animation
  const renderEmptyComponent = () => {
    // Check if this is a search result or general favorite list
    const isSearching = title.includes('Tìm kiếm trong yêu thích');
    
    return (
      <EmptySearchAnimation
        title={isSearching ? "Không tìm thấy phòng phù hợp" : "Chưa có phòng yêu thích"}
        subtitle={isSearching ? "Thử thay đổi từ khóa tìm kiếm khác" : "Hãy thêm phòng vào danh sách yêu thích"}
      />
    );
  };

  // Handle end reached for loading more data
  const handleEndReached = () => {
    if (hasMore && !isLoading) {
      console.log(`🔄 Loading page ${currentPage + 1}...`);
      loadMore();
    }
  };

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

      {/* Danh sách kết quả với lazy loading */}
      <FlatList
        data={displayedData}
        renderItem={AnimatedFavoriteRoomCard}
        keyExtractor={(item, index) => item._id || `room-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          displayedData.length === 0 && styles.emptyListContainer
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyComponent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1} // Trigger when 10% from bottom
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        removeClippedSubviews={true} // Optimize for large lists
        maxToRenderPerBatch={8} // Render 8 items per batch
        windowSize={10} // Keep 10 screens worth of content
        initialNumToRender={8} // Render 8 items initially
        getItemLayout={(data, index) => ({
          length: 120, // Approximate height of FavoriteRoomCard
          offset: 120 * index,
          index,
        })}
      />
    </View>
  );
};

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