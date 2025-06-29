import React, { useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Animated,
  Easing,
  ViewToken,
} from 'react-native';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';
import { 
  responsiveFont, 
  responsiveIcon, 
  responsiveSpacing 
} from '../../../utils/responsive';
import { Room } from '../../../types/Room';
import RoomCard from '../../HomeScreen/components/RoomCard';
import { Icons } from '../../../assets/icons';
import EmptySearchAnimation from '../../../components/EmptySearchAnimation';
import LoadingAnimation from '../../../components/LoadingAnimation';

interface SearchResultsProps {
  title: string;
  rooms: Room[];
  onRoomPress: (roomId: string) => void;
  onFilterPress?: () => void;
  isFilterActive?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  title,
  rooms,
  onRoomPress,
  onFilterPress,
  isFilterActive = false,
  hasMore = false,
  onLoadMore,
  isLoading = false
}) => {
  // Animation for room cards
  const animatedValues = useRef<Map<string, Animated.Value>>(new Map()).current;
  const viewableItems = useRef<Set<string>>(new Set()).current;

  // Use the data directly from server pagination
  const displayedData = rooms;
  const totalItems = rooms.length;

  // No need to reset pagination - handled by server

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
  const AnimatedRoomCard = useCallback(({ item }: { item: Room }) => {
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
        <RoomCard 
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

    if (isLoading && hasMore) {
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
    // Check if this is a search result or general room list
    const isSearching = title.includes('Kết quả tìm kiếm');
    
    return (
      <EmptySearchAnimation
        title={isSearching ? "Không tìm thấy phòng phù hợp" : "Chưa có phòng trọ nào"}
        subtitle={isSearching ? "Thử thay đổi từ khóa tìm kiếm khác" : "Vui lòng thử lại sau"}
      />
    );
  };

  // Handle end reached for loading more data
  const handleEndReached = () => {
    if (hasMore && !isLoading && onLoadMore) {
      console.log(`🔄 Loading more...`);
      onLoadMore();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header với title và filter button */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {title}
          {totalItems > 0 && displayedData.length < totalItems && (
            <Text style={styles.countText}>
              {` (${displayedData.length}/${totalItems})`}
            </Text>
          )}
        </Text>
        {onFilterPress && (
          <TouchableOpacity 
            style={[
              styles.filterButton,
              isFilterActive && styles.activeFilterButton
            ]} 
            onPress={() => {
              onFilterPress();
            }}
          >
            <Image 
              source={{ uri: isFilterActive ? Icons.IconRemoveFilter
                 : Icons.IconFilter }} 
              style={[
                styles.filterIcon,
                isFilterActive && styles.activeFilterIcon
              ]} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Danh sách kết quả với lazy loading */}
      <FlatList
        data={displayedData}
        renderItem={AnimatedRoomCard}
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
          length: 120, // Approximate height of RoomCard
          offset: 120 * index,
          index,
        })}
      />
    </View>
  );
};

export default SearchResults;

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
  filterButton: {
    width: responsiveIcon(44),
    height: responsiveIcon(44),
    backgroundColor: Colors.white,
    borderRadius: responsiveIcon(22),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: Colors.limeGreen,
    borderColor: Colors.limeGreen,
  },
  filterIcon: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
    tintColor: Colors.black,
  },
  activeFilterIcon: {
    tintColor: Colors.white,
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