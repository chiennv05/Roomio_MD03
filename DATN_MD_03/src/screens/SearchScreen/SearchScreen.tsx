import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { searchRoomsAction, fetchRooms } from '../../store/slices/roomSlice';
import { Colors } from '../../theme/color';
import { RootStackParamList } from '../../types/route';
import { Icons } from '../../assets/icons';

// Import components
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import FilterOverlay from './components/FilterOverlay';

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HomeScreen'>;

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { searchResults, searchLoading, searchError, rooms, loading } = useSelector((state: RootState) => state.room);

  // Animation states
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(100), []);
  const scaleAnim = useMemo(() => new Animated.Value(1.05), []);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isFilterOverlayVisible, setIsFilterOverlayVisible] = useState(false);

  // Debounce search query to improve performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 800); // 3s delay để tránh request liên tục

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search rooms when search query changes or load all rooms when no search query
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      dispatch(searchRoomsAction({
        searchQuery: debouncedSearchQuery,
        filters: {}
      }));
    } else {
      // Load all rooms when no search query
      dispatch(fetchRooms({}));
    }
  }, [dispatch, debouncedSearchQuery]);

  // Use search results when searching, otherwise use all rooms
  const filteredRooms = useMemo(() => {
    if (debouncedSearchQuery.trim()) {
      return searchResults || [];
    }
    return rooms || [];
  }, [searchResults, rooms, debouncedSearchQuery]);

  // Animation khi vào màn hình - slide up từ dưới
  const animateIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  // Reset và chạy animation khi screen focus
  useFocusEffect(
    useCallback(() => {
      // Reset animation values để tạo hiệu ứng slide up từ dưới
      fadeAnim.setValue(0);
      slideAnim.setValue(100); // Bắt đầu từ vị trí dưới
      scaleAnim.setValue(1.05); // Bắt đầu từ scale lớn hơn
      
      // Load all rooms when first entering screen if no search query
      if (!debouncedSearchQuery.trim() && rooms.length === 0) {
        dispatch(fetchRooms({}));
      }
      
      // Start animation ngay lập tức để liền mạch với HomeScreen
      const timer = setTimeout(() => {
        animateIn();
      }, 0); // Không delay để animation liền mạch

      return () => clearTimeout(timer);
    }, [fadeAnim, slideAnim, scaleAnim, animateIn, debouncedSearchQuery, rooms.length, dispatch])
  );

  // Filter options data - Memoized
  const filterOptions = useMemo(() => [
    {
      id: 'tim-o-ghep',
      label: 'Tìm ở ghép',
      icon: Icons.IconChanGaGoi || '',
      isSelected: selectedFilters.includes('tim-o-ghep')
    },
    {
      id: 'tim-phong-lan-can',
      label: 'Tìm phòng lân cận',
      icon: Icons.IconLocation || '',
      isSelected: selectedFilters.includes('tim-phong-lan-can')
    },
    {
      id: 'van-chuyen',
      label: 'Vận chuyển',
      icon: Icons.IconGuiXe || '',
      isSelected: selectedFilters.includes('van-chuyen')
    },
    {
      id: 'noi-that-gia-re',
      label: 'Nội thất giá rẻ',
      icon: Icons.IconSofa || '',
      isSelected: selectedFilters.includes('noi-that-gia-re')
    },
  ], [selectedFilters]);

  // Hàm xử lý tìm kiếm - Real-time search
  const handleSearch = useCallback(() => {
    // Real-time search is handled by filteredRooms useMemo
    // This function can be used for additional actions like analytics
    if (debouncedSearchQuery.trim()) {
      console.log(`🔍 User searched for: "${debouncedSearchQuery}"`);
    }
  }, [debouncedSearchQuery]);

  // Hàm xử lý thay đổi text - Real-time filtering
  const handleSearchTextChange = useCallback((text: string) => {
    setSearchQuery(text);
    // Filtering happens automatically via filteredRooms useMemo
  }, []);

  // Hàm xử lý chọn filter
  const handleFilterSelect = useCallback((filterId: string) => {
    setSelectedFilters(prev => {
      if (prev.includes(filterId)) {
        return prev.filter(id => id !== filterId);
      } else {
        return [...prev, filterId];
      }
    });
  }, []);

  // Hàm xử lý nhấn vào room card
  const handleRoomPress = useCallback((roomId: string) => {
    navigation.navigate('DetailRoom', { roomId });
  }, [navigation]);

  // Hàm xử lý toggle filter overlay
  const handleFilterPress = useCallback(() => {
    console.log('Filter button pressed, current state:', isFilterOverlayVisible);
    setIsFilterOverlayVisible(!isFilterOverlayVisible);
  }, [isFilterOverlayVisible]);

  // Hàm đóng filter overlay
  const handleCloseFilter = useCallback(() => {
    console.log('Closing filter overlay');
    setIsFilterOverlayVisible(false);
  }, []);

  // Memoized title with search results count
  const searchTitle = useMemo(() => {
    if (debouncedSearchQuery.trim()) {
      if (searchLoading) {
        return 'Đang tìm kiếm...';
      }
      if (searchError) {
        return 'Lỗi tìm kiếm';
      }
      return `Kết quả tìm kiếm "${debouncedSearchQuery}" (${filteredRooms.length})`;
    }
    if (loading) {
      return 'Đang tải phòng...';
    }
    return `Tất cả phòng trọ (${filteredRooms.length})`;
  }, [debouncedSearchQuery, filteredRooms.length, searchLoading, searchError, loading]);

  // Log performance info
  // useEffect(() => {
  //   if (filteredRooms.length > 0) {
  //     console.log(`📊 Performance Info:`);
  //     console.log(`   Total rooms: ${filteredRooms.length}`);
  //     console.log(`   Pagination enabled: 8 items per page`);
  //     console.log(`   Initial render: 8 items`);
  //     console.log(`   Memory optimization: ✅`);
  //   }
  // }, [filteredRooms.length]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroud} />
      
      <Animated.View 
        style={[
          styles.animatedContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
          }
        ]}
      >
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearchTextChange}
          onSearchPress={handleSearch}
          placeholder="Tìm theo địa chỉ, mô tả phòng..."
        />
   
        {/* Search Results */}
        <SearchResults
          title={searchTitle}
          rooms={filteredRooms}
          onRoomPress={handleRoomPress}
          onFilterPress={handleFilterPress}
          isFilterActive={isFilterOverlayVisible}
        />
      </Animated.View>

      {/* Filter Overlay */}
      <FilterOverlay
        visible={isFilterOverlayVisible}
        onClose={handleCloseFilter}
        filters={filterOptions}
        onFilterPress={handleFilterSelect}
      />
    </SafeAreaView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  animatedContainer: {
    flex: 1,
  },
});
