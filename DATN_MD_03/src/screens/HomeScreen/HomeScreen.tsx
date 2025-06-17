import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Text,
  RefreshControl,
} from 'react-native';
import Header from './components/Header';
import FilterTabs from './components/FilterTabs';
import RoomCard from './components/RoomCard';
import { District } from '../../types/Address';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchRooms, resetRooms } from '../../store/slices/roomSlice';
import { convertApiRoomToRoom, RoomCardData } from '../../utils/roomUtils';
import { RoomFilters } from '../../types/Room';

// const SCREEN = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { rooms, loading, error } = useAppSelector(state => state.rooms);
  
  const filters: string[] = ['Khu vực', 'Khoảng giá', 'Diện tích', 'Nội thất', 'Tiện nghi'];
  const [selectedFilters, setSelectedFilters] = useState<number[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<District[]>([]);
  const [_priceRange, setPriceRange] = useState<{min: number, max: number} | null>(null);
  const [_areaRange, setAreaRange] = useState<{min: number, max: number} | null>(null);
  const [selectedFurniture, setSelectedFurniture] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const handleFilterSelect = (index: number) => {
    setSelectedFilters(prev => {
      if (prev.includes(index)) {
        // Remove if already selected
        return prev.filter(i => i !== index);
      } else {
        // Add if not selected
        return [...prev, index];
      }
    });
  };

  // Load initial data
  useEffect(() => {
    dispatch(fetchRooms({}));
  }, [dispatch]);

  // Apply filters when they change
  useEffect(() => {
    const filters: RoomFilters = {};
    
    if (_priceRange) {
      filters.minPrice = _priceRange.min;
      filters.maxPrice = _priceRange.max;
    }
    
    if (_areaRange) {
      filters.minArea = _areaRange.min;
      filters.maxArea = _areaRange.max;
    }
    
    if (selectedFurniture.length > 0) {
      filters.furniture = selectedFurniture;
    }
    
    if (selectedAmenities.length > 0) {
      filters.amenities = selectedAmenities;
    }
    
    if (selectedRegions.length > 0) {
      filters.districts = selectedRegions.map(region => region.name);
    }

    // Only fetch if there are actual filters applied
    if (Object.keys(filters).length > 0) {
      dispatch(resetRooms());
      dispatch(fetchRooms(filters));
    }
  }, [_priceRange, _areaRange, selectedFurniture, selectedAmenities, selectedRegions, dispatch]);

  const handleClearAll = () => {
    setSelectedFilters([]);
    setSelectedRegions([]);
    setPriceRange(null);
    setAreaRange(null);
    setSelectedFurniture([]);
    setSelectedAmenities([]);
    
    // Reset to default data
    dispatch(resetRooms());
    dispatch(fetchRooms({}));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchRooms({}));
    setRefreshing(false);
  };

  const handleRegionSelect = (regions: District[]) => {
    setSelectedRegions(regions);
    console.log('Selected regions:', regions);
  };

  const handlePriceRangeSelect = (minPrice: number, maxPrice: number) => {
    setPriceRange({ min: minPrice, max: maxPrice });
    console.log('Selected price range:', minPrice, maxPrice);
  };

  const handleAreaSelect = (minArea: number, maxArea: number) => {
    setAreaRange({ min: minArea, max: maxArea });
    console.log('Selected area range:', minArea, maxArea);
  };

  const handleFurnitureSelect = (items: string[]) => {
    setSelectedFurniture(items);
    console.log('Selected furniture:', items);
  };

  const handleAmenitySelect = (items: string[]) => {
    setSelectedAmenities(items);
    console.log('Selected amenities:', items);
  };

  // Convert API rooms to UI format
  const roomList: RoomCardData[] = rooms.map(convertApiRoomToRoom);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <Header />
      <FilterTabs
        filters={filters}
        selectedIndices={selectedFilters}
        onSelect={handleFilterSelect}
        onClearAll={handleClearAll}
        onRegionSelect={handleRegionSelect}
        selectedRegions={selectedRegions}
        onPriceRangeSelect={handlePriceRangeSelect}
        onAreaSelect={handleAreaSelect}
        selectedPriceRange={_priceRange || undefined}
        selectedAreaRange={_areaRange || undefined}
        onFurnitureSelect={handleFurnitureSelect}
        onAmenitySelect={handleAmenitySelect}
        selectedFurniture={selectedFurniture}
        selectedAmenities={selectedAmenities}
      />
      
      {/* Loading indicator */}
      {loading && roomList.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#BAFD00" />
          <Text style={styles.loadingText}>Đang tải danh sách phòng trọ...</Text>
        </View>
      )}
      
      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Lỗi: {error}</Text>
        </View>
      )}
      
      {/* Room list */}
      <View style={styles.section}>
        {roomList.map((room, idx) => (
          <RoomCard key={`${rooms[idx]?._id || idx}`} item={room} />
        ))}
      </View>
      
      {/* No data message */}
      {!loading && roomList.length === 0 && !error && (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Không tìm thấy phòng trọ nào</Text>
        </View>
      )}
      
      {/* Load more indicator */}
      {loading && roomList.length > 0 && (
        <View style={styles.loadMoreContainer}>
          <ActivityIndicator size="small" color="#BAFD00" />
        </View>
      )}
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#ff4444',
    textAlign: 'center',
  },
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  loadMoreContainer: {
    padding: 20,
    alignItems: 'center',
  },
});
