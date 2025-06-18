import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Header from './components/Header';
import FilterTabs from './components/FilterTabs';
import RoomCard from './components/RoomCard';
import { Room, RoomFilters } from '../../types/Room';
import { District } from '../../types/Address';
import { useRooms } from '../../hooks';
import { Colors } from '../../theme/color';
import { responsiveSpacing } from '../../utils/responsive';

const HomeScreen: React.FC = () => {
  const filters: string[] = ['Khu vực', 'Khoảng giá', 'Diện tích', 'Nội thất', 'Tiện nghi'];
  const [selectedFilters, setSelectedFilters] = useState<number[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<District[]>([]);
  const [priceRange, setPriceRange] = useState<{min: number, max: number} | null>(null);
  const [areaRange, setAreaRange] = useState<{min: number, max: number} | null>(null);
  const [selectedFurniture, setSelectedFurniture] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const { rooms, loading, pagination, loadRooms, loadMore } = useRooms();

  // Build filters object
  const buildFilters = useCallback((): RoomFilters => {
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

  // Load initial data
  useEffect(() => {
    loadRooms(buildFilters());
  }, [loadRooms, buildFilters]);

  // Reload when filters change
  useEffect(() => {
    loadRooms(buildFilters());
  }, [priceRange, areaRange, selectedFurniture, selectedAmenities, selectedRegions, loadRooms, buildFilters]);

  const handleFilterSelect = (index: number) => {
    setSelectedFilters(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleClearAll = () => {
    setSelectedFilters([]);
    setSelectedRegions([]);
    setPriceRange(null);
    setAreaRange(null);
    setSelectedFurniture([]);
    setSelectedAmenities([]);
  };

  const handleRegionSelect = (regions: District[]) => {
    setSelectedRegions(regions);
  };

  const handlePriceRangeSelect = (minPrice: number, maxPrice: number) => {
    setPriceRange({ min: minPrice, max: maxPrice });
  };

  const handleAreaSelect = (minArea: number, maxArea: number) => {
    setAreaRange({ min: minArea, max: maxArea });
  };

  const handleFurnitureSelect = (items: string[]) => {
    setSelectedFurniture(items);
  };

  const handleAmenitySelect = (items: string[]) => {
    setSelectedAmenities(items);
  };

  const handleRefresh = () => {
    loadRooms(buildFilters());
  };

  const handleLoadMore = () => {
    if (pagination?.hasNextPage && !loading) {
      loadMore(buildFilters());
    }
  };

  const renderRoomCard = ({ item }: { item: Room }) => (
    <RoomCard item={item} />
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color={Colors.limeGreen} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
        selectedPriceRange={priceRange || undefined}
        selectedAreaRange={areaRange || undefined}
        onFurnitureSelect={handleFurnitureSelect}
        onAmenitySelect={handleAmenitySelect}
        selectedFurniture={selectedFurniture}
        selectedAmenities={selectedAmenities}
      />
      <FlatList
        data={rooms}
        renderItem={renderRoomCard}
        keyExtractor={(item, index) => item._id || index.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading && rooms.length === 0}
            onRefresh={handleRefresh}
            colors={[Colors.limeGreen]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContainer}
      />
    </View>
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
});
