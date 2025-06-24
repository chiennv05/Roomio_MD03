import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
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
import { usePaginatedData } from '../../../hooks/usePaginatedData';
import EmptySearchAnimation from '../../../components/EmptySearchAnimation';
import LoadingAnimation from '../../../components/LoadingAnimation';

interface SearchResultsProps {
  title: string;
  rooms: Room[];
  onRoomPress: (roomId: string) => void;
  onFilterPress?: () => void;
  isFilterActive?: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  title,
  rooms,
  onRoomPress,
  onFilterPress,
  isFilterActive = false
}) => {
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

  const renderRoomItem = ({ item }: { item: Room }) => (
    <RoomCard item={item} onPress={onRoomPress} />
  );

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
  const renderEmptyComponent = () => (
    <EmptySearchAnimation
      title="Không tìm thấy phòng phù hợp"
      subtitle="Thử thay đổi từ khóa tìm kiếm khác"
    />
  );

  // Handle end reached for loading more data
  const handleEndReached = () => {
    if (hasMore && !isLoading) {
      console.log(`🔄 Loading page ${currentPage + 1}...`);
      loadMore();
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
        renderItem={renderRoomItem}
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

}); 