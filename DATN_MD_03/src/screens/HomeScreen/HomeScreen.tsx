import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  Text,
  Animated,
  Easing,
  FlatList,
  ViewToken,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Header from './components/Header';
import FilterTabs from './components/FilterTabs';
import RoomCard from './components/RoomCard';
import { RoomFilters } from '../../types/Room';
import { District } from '../../types/Address';
import { useRooms } from '../../hooks';
import { Colors } from '../../theme/color';
import { responsiveSpacing, responsiveFont } from '../../utils/responsive';
import { RootStackParamList } from '../../types/route';
import { Fonts } from '../../theme/fonts';
import { validateRoomByFilters, sortRoomsByScore } from '../../utils/roomUtils';
import EmptySearchAnimation from '../../components/EmptySearchAnimation';
import LoadingAnimation from '../../components/LoadingAnimation';
import LoginPromptModal from '../../components/LoginPromptModal';

// Type cho navigation
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DetailRoom'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  // Get user info from Redux store
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Animation states
  const fadeAnim = useMemo(() => new Animated.Value(1), []);
  const scaleAnim = useMemo(() => new Animated.Value(1), []);
  const overlayAnim = useMemo(() => new Animated.Value(0), []); // Animation cho overlay
  
  // Animation for room cards
  const animatedValues = useRef<Map<string, Animated.Value>>(new Map()).current;
  const viewableItems = useRef<Set<string>>(new Set()).current;
  
  // Memoize static data
  const filters = useMemo(() => ['Khu vực', 'Khoảng giá', 'Diện tích', 'Nội thất', 'Tiện nghi'], []);
  
  const [selectedFilters, setSelectedFilters] = useState<number[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<District[]>([]);
  const [priceRange, setPriceRange] = useState<{min: number, max: number} | null>(null);
  const [areaRange, setAreaRange] = useState<{min: number, max: number} | null>(null);
  const [selectedFurniture, setSelectedFurniture] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Xoá modal search, chỉ dùng input trực tiếp

  // Toggle để kiểm soát client-side filtering (có thể tắt nếu backend đã fix)
  const useClientSideFiltering = true;

  const { rooms, loading, loadRooms } = useRooms();

  // Reset animation when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
      overlayAnim.setValue(0);
      setShowSearchOverlay(false);
    }, [fadeAnim, scaleAnim, overlayAnim])
  );

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

  // Navigation với animation
  const handleNotificationPress = useCallback(() => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      navigation.navigate('Notification');
    }
  }, [navigation, user]);

  const handleUserPress = useCallback(() => {
    // Navigate to login screen if user is guest
    if (!user) {
      (navigation as any).navigate('Login');
    } else {
      // User is logged in - could navigate to profile or show user menu
      // TODO: Add user menu or profile navigation
    }
  }, [navigation, user]);

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
      return sortRoomsByScore(rooms);
    }

    // Nếu không có filter nào, trả về tất cả đã sắp xếp
    if (hasNoFilters) {
      return sortRoomsByScore(rooms);
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

    // Sắp xếp kết quả theo điểm số
    return sortRoomsByScore(filtered);
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

  // Khi searchQuery hoặc filter thay đổi, gọi lại loadRooms
  useEffect(() => {
    loadRooms({ ...buildFilters, search: searchQuery });
  }, [buildFilters, loadRooms, searchQuery]);

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

  // Hàm xử lý khi nhấn vào room card
  const handleRoomPress = useCallback((roomId: string) => {
    console.log('Navigating to DetailRoom with roomId:', roomId);
    navigation.navigate('DetailRoom', { roomId });
  }, [navigation]);

  // Animated Room Card Component
  const AnimatedRoomCard = useCallback(({ item }: { item: any }) => {
    const animValue = getAnimatedValue(item._id);
    
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
          onPress={handleRoomPress}
        />
      </Animated.View>
    );
  }, [getAnimatedValue, handleRoomPress]);

  // Memoized RefreshControl
  const refreshControl = useMemo(() => (
    <RefreshControl
      refreshing={loading && filteredRooms.length === 0}
      onRefresh={handleRefresh}
      colors={[Colors.limeGreen]}
    />
  ), [loading, filteredRooms.length, handleRefresh]);

  // Hàm xác nhận search (ấn Enter hoặc nút tìm kiếm)
  const handleSearchSubmit = useCallback(() => {
    // loadRooms sẽ tự động gọi lại qua useEffect khi searchQuery thay đổi
  }, []);

  // Header component for FlatList
  const ListHeaderComponent = useMemo(() => (
    <View>
      <Header 
        searchValue={searchQuery}
        onChangeSearchText={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onNotificationPress={handleNotificationPress}
        onUserPress={handleUserPress}
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
    </View>
  ), [
    searchQuery,
    setSearchQuery,
    handleSearchSubmit,
    handleNotificationPress,
    handleUserPress, 
    filters, 
    selectedFilters, 
    handleFilterSelect, 
    handleClearAll, 
    handleRegionSelect, 
    selectedRegions, 
    handlePriceRangeSelect, 
    handleAreaSelect, 
    priceRange, 
    areaRange, 
    handleFurnitureSelect, 
    handleAmenitySelect, 
    selectedFurniture, 
    selectedAmenities
  ]);

  // Empty component
  const ListEmptyComponent = useMemo(() => (
    !loading ? (
      <EmptySearchAnimation
        title={hasActiveFilters ? 'Không tìm thấy phòng phù hợp' : 'Không có phòng nào'}
        subtitle={hasActiveFilters 
          ? 'Thử thay đổi bộ lọc để tìm kiếm phòng khác' 
          : 'Hiện tại chưa có phòng nào được đăng'
        }
      />
    ) : null
  ), [loading, hasActiveFilters]);

  // Footer component
  const ListFooterComponent = useMemo(() => (
    loading ? (
      <View style={styles.footer}>
        <LoadingAnimation size="medium" color={Colors.limeGreen} />
      </View>
    ) : null
  ), [loading]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Animated.View 
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <FlatList
          data={filteredRooms}
          renderItem={AnimatedRoomCard}
          keyExtractor={(item, index) => item._id || index.toString()}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          contentContainerStyle={styles.scrollContainer}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={ListFooterComponent}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={5}
          windowSize={10}
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

      {showLoginModal && (
        <LoginPromptModal
          visible={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={() => {
            setShowLoginModal(false);
            (navigation as any).navigate('Login');
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: responsiveSpacing(20),
  },
  roomsContainer: {
    paddingTop: responsiveSpacing(8),
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
  animatedCard: {
    marginBottom: responsiveSpacing(4),
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
