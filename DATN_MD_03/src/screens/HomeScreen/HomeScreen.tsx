import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
//   Dimensions,
} from 'react-native';
import Header from './components/Header';
import FilterTabs from './components/FilterTabs';
import RoomCard from './components/RoomCard';
import { Room } from './types/Room';
import { District } from '../../types/Address';

// const SCREEN = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const filters: string[] = ['Khu vực', 'Khoảng giá', 'Diện tích', 'Nội thất', 'Tiện nghi'];
  const [selectedFilters, setSelectedFilters] = useState<number[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<District[]>([]);
  const [_priceRange, setPriceRange] = useState<{min: number, max: number} | null>(null);
  const [_areaRange, setAreaRange] = useState<{min: number, max: number} | null>(null);
  const [selectedFurniture, setSelectedFurniture] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

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

  const roomList: Room[] = [
    {
      image: 'https://i.pinimg.com/736x/42/15/82/421582d44e6e0d9e2d4cf003de47c14e.jpg',
      images: [
        'https://i.pinimg.com/736x/42/15/82/421582d44e6e0d9e2d4cf003de47c14e.jpg',
        'https://i.pinimg.com/736x/91/ce/ed/91ceeda91de0a647d22083015d241584.jpg',
        'https://i.pinimg.com/736x/91/ce/ed/91ceeda91de0a647d22083015d241584.jpg',
      ],
      price: '4.000.000 đồng',
      title: 'Phòng trọ kiểu hiện đại Louis city hoàng mai',
      detail: '9 tháng thuê | 25m2 | Có 4 phòng',
    },
    {
      image: 'https://i.pinimg.com/736x/91/ce/ed/91ceeda91de0a647d22083015d241584.jpg',
      images: [
        'https://i.pinimg.com/736x/91/ce/ed/91ceeda91de0a647d22083015d241584.jpg',
        'https://i.pinimg.com/736x/42/15/82/421582d44e6e0d9e2d4cf003de47c14e.jpg',
      ],
      price: '4.000.000 đồng',
      title: 'Phòng trọ hiện đại view ban công Louis city',
      detail: '6 tháng thuê | 28m2 | Có 3 phòng',
    },
  ];

  return (
    <ScrollView style={styles.container}>
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
      <View style={styles.section}>
        {roomList.map((room, idx) => (
          <RoomCard key={idx} item={room} />
        ))}
      </View>
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
});
