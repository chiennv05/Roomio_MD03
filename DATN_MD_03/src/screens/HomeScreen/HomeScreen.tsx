import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Text,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Header from './components/Header';
import FilterTabs from './components/FilterTabs';
import RoomCard from './components/RoomCard';
import { Room, RoomFilters } from '../../types/Room';
import { District } from '../../types/Address';
import { useRooms } from '../../hooks';
import { Colors } from '../../theme/color';
import { responsiveSpacing, responsiveFont } from '../../utils/responsive';
import { RootStackParamList } from '../../types/route';
import { Fonts } from '../../theme/fonts';
import { validateRoomByFilters } from '../../utils/roomUtils';

// Type cho navigation
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DetailRoom'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  // Animation states
  const fadeAnim = useMemo(() => new Animated.Value(1), []);
  const scaleAnim = useMemo(() => new Animated.Value(1), []);
  const overlayAnim = useMemo(() => new Animated.Value(0), []); // Animation cho overlay
  
  // Memoize static data
  const filters = useMemo(() => ['Khu vực', 'Khoảng giá', 'Diện tích', 'Nội thất', 'Tiện nghi'], []);
  
  const [selectedFilters, setSelectedFilters] = useState<number[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<District[]>([]);
  const [priceRange, setPriceRange] = useState<{min: number, max: number} | null>(null);
  const [areaRange, setAreaRange] = useState<{min: number, max: number} | null>(null);
  const [selectedFurniture, setSelectedFurniture] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);

  // Toggle để kiểm soát client-side filtering (có thể tắt nếu backend đã fix)
  const useClientSideFiltering = true;

  const { rooms, loading, pagination, loadRooms, loadMore } = useRooms();

  // Reset animation when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
      overlayAnim.setValue(0);
      setShowSearchOverlay(false);
    }, [fadeAnim, scaleAnim, overlayAnim])
  );

  // Navigation với animation
  const handleSearchPress = useCallback(() => {
    setShowSearchOverlay(true);
    
    // Tạo animation mượt mà khi chuyển màn - đẩy xuống và mờ dần
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navigate sau khi animation hoàn thành
      navigation.navigate('Search' as any);
      
      // Reset animation về trạng thái ban đầu sau một chút
      setTimeout(() => {
        fadeAnim.setValue(1);
        scaleAnim.setValue(1);
        overlayAnim.setValue(0);
        setShowSearchOverlay(false);
      }, 100);
    });
  }, [navigation, fadeAnim, scaleAnim, overlayAnim]);

  const handleNotificationPress = useCallback(() => {
    // TODO: Implement notification functionality
    console.log('Notification pressed');
  }, []);

  // Memoize regions array for filtering
  const regionsToFilter = useMemo(() => {
    return selectedRegions.map(region => region.name);
  }, [selectedRegions]);

  // Memoize hasNoFilters check
  const hasNoFilters = useMemo(() => {
    return selectedAmenities.length === 0 && 
           selectedFurniture.length === 0 && 
           selectedRegions.length === 0 && 
           !priceRange && 
           !areaRange;
  }, [selectedAmenities.length, selectedFurniture.length, selectedRegions.length, priceRange, areaRange]);

  // Memoize hasActiveFilters check
  const hasActiveFilters = useMemo(() => {
    return selectedAmenities.length > 0 || 
           selectedFurniture.length > 0 || 
           selectedRegions.length > 0 || 
           !!priceRange || 
           !!areaRange;
  }, [selectedAmenities.length, selectedFurniture.length, selectedRegions.length, priceRange, areaRange]);

  // Filter rooms ở phía client để đảm bảo logic AND đúng
  const filteredRooms = useMemo(() => {
    // Nếu tắt client-side filtering, trả về rooms từ API
    if (!useClientSideFiltering) {
      return rooms;
    }

    // Nếu không có filter nào, trả về tất cả
    if (hasNoFilters) {
      return rooms;
    }

    const filtered = rooms.filter(room => {
      const isValid = validateRoomByFilters(
        room, 
        selectedAmenities, 
        selectedFurniture, 
        regionsToFilter,
        priceRange || undefined,
        areaRange || undefined
      );
      
      return isValid;
    });

    // Log tổng kết filter để debug
    console.log(`🔍 Client Filter Summary:`);
    console.log(`   📊 Total rooms from API: ${rooms.length}`);
    console.log(`   📊 Filtered rooms: ${filtered.length}`);
    console.log(`   🔍 Selected regions: [${regionsToFilter.join(', ')}]`);
    console.log(`   🔍 Selected amenities: [${selectedAmenities.join(', ')}]`);
    console.log(`   🔍 Selected furniture: [${selectedFurniture.join(', ')}]`);
    if (priceRange) console.log(`   🔍 Price range: ${priceRange.min.toLocaleString()} - ${priceRange.max.toLocaleString()}đ`);
    if (areaRange) console.log(`   🔍 Area range: ${areaRange.min} - ${areaRange.max}m²`);

    return filtered;
  }, [rooms, selectedAmenities, selectedFurniture, regionsToFilter, priceRange, areaRange, useClientSideFiltering, hasNoFilters]);

  // Build filters object - Memoized
  const buildFilters = useMemo((): RoomFilters => {
    const filters: RoomFilters = {};
    
    if (priceRange) {
      filters.minPrice = priceRange.min;
      filters.maxPrice = priceRange.max;
    }
    
    if (areaRange) {
      filters.minArea = areaRange.min;
      filters.maxArea = areaRange.max;
    }
    
    if (selectedFurniture.length > 0) {
      filters.furniture = selectedFurniture;
    }
    
    if (selectedAmenities.length > 0) {
      filters.amenities = selectedAmenities;
    }
    
    if (selectedRegions.length > 0) {
      // Use districts array for filtering
      filters.districts = selectedRegions.map(region => region.name);
    }
    
    return filters;
  }, [priceRange, areaRange, selectedFurniture, selectedAmenities, selectedRegions]);

  // Load data when component mounts or filters change
  useEffect(() => {
    loadRooms(buildFilters);
  }, [buildFilters, loadRooms]);

  // Memoized callbacks
  const handleFilterSelect = useCallback((index: number) => {
    setSelectedFilters(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedFilters([]);
    setSelectedRegions([]);
    setPriceRange(null);
    setAreaRange(null);
    setSelectedFurniture([]);
    setSelectedAmenities([]);
  }, []);

  const handleRegionSelect = useCallback((regions: District[]) => {
    setSelectedRegions(regions);
  }, []);

  const handlePriceRangeSelect = useCallback((minPrice: number, maxPrice: number) => {
    setPriceRange({ min: minPrice, max: maxPrice });
  }, []);

  const handleAreaSelect = useCallback((minArea: number, maxArea: number) => {
    setAreaRange({ min: minArea, max: maxArea });
  }, []);

  const handleFurnitureSelect = useCallback((items: string[]) => {
    setSelectedFurniture(items);
  }, []);

  const handleAmenitySelect = useCallback((items: string[]) => {
    setSelectedAmenities(items);
  }, []);

  const handleRefresh = useCallback(() => {
    loadRooms(buildFilters);
  }, [buildFilters, loadRooms]);

  const handleLoadMore = useCallback(() => {
    if (pagination?.hasNextPage && !loading) {
      loadMore(buildFilters);
    }
  }, [pagination?.hasNextPage, loading, buildFilters, loadMore]);

  // Hàm xử lý khi nhấn vào room card
  const handleRoomPress = useCallback((roomId: string) => {
    console.log('Navigating to DetailRoom with roomId:', roomId);
    navigation.navigate('DetailRoom', { roomId });
  }, [navigation]);

  // Memoized render functions
  const renderRoomCard = useCallback(({ item }: { item: Room }) => (
    <RoomCard item={item} onPress={handleRoomPress} />
  ), [handleRoomPress]);

  const renderFooter = useCallback(() => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color={Colors.limeGreen} />
      </View>
    );
  }, [loading]);

  const renderEmptyComponent = useCallback(() => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>
          {hasActiveFilters ? 'Không tìm thấy phòng phù hợp' : 'Không có phòng nào'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {hasActiveFilters 
            ? 'Thử thay đổi bộ lọc để tìm kiếm phòng khác' 
            : 'Hiện tại chưa có phòng nào được đăng'
          }
        </Text>
      </View>
    );
  }, [loading, hasActiveFilters]);

  // Memoized RefreshControl
  const refreshControl = useMemo(() => (
    <RefreshControl
      refreshing={loading && filteredRooms.length === 0}
      onRefresh={handleRefresh}
      colors={[Colors.limeGreen]}
    />
  ), [loading, filteredRooms.length, handleRefresh]);

  return (
    <>
      <Animated.View 
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <Header 
          onSearchPress={handleSearchPress}
          onNotificationPress={handleNotificationPress}
        />
        <FilterTabs
          filters={filters}
          selectedIndices={selectedFilters}
          onSelect={handleFilterSelect}
          onClearAll={handleClearAll}
          onRegionSelect={handleRegionSelect}
          selectedRegions={selectedRegions}
          onPriceRangeSelect={handlePriceRangeSelect}
          onAreaSelect={handleAreaSelect}
          selectedPriceRange={priceRange || undefined}
          selectedAreaRange={areaRange || undefined}
          onFurnitureSelect={handleFurnitureSelect}
          onAmenitySelect={handleAmenitySelect}
          selectedFurniture={selectedFurniture}
          selectedAmenities={selectedAmenities}
        />
        <Text style={styles.recommendationTitle}>Đề xuất cho bạn</Text>
        <FlatList
          data={filteredRooms}
          renderItem={renderRoomCard}
          keyExtractor={(item, index) => item._id || index.toString()}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.listContainer}
        />
      </Animated.View>
      
      {/* Overlay để tạo hiệu ứng transition mượt mà */}
      {showSearchOverlay && (
        <Animated.View 
          style={[
            styles.searchOverlay,
            {
              opacity: overlayAnim,
            }
          ]}
          pointerEvents="none"
        />
      )}
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  listContainer: {
    paddingTop: responsiveSpacing(12),
    paddingBottom: responsiveSpacing(20),
  },
  footer: {
    paddingVertical: responsiveSpacing(20),
    alignItems: 'center',
  },
  recommendationTitle: {
    fontSize: responsiveFont(27),
    fontWeight: '600',
    fontFamily: Fonts.Roboto_Bold,
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(12),
    color: '#17190F',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(32),
    paddingVertical: responsiveSpacing(64),
  },
  emptyTitle: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: responsiveSpacing(8),
  },
  emptySubtitle: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: responsiveFont(20),
  },
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000,
  },
});
