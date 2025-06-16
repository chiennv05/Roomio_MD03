import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
//   Dimensions,
} from 'react-native';
import RegionModal from './RegionModal';
import PriceRangeModal from './PriceRangeModal';
import AreaModal from './AreaModal';
import CheckboxModal from './CheckboxModal';
import { District } from '../../../types/Address';
import { FURNITURE_ITEMS, AMENITY_ITEMS } from '../data/filterData';

// const SCREEN = Dimensions.get('window');

interface FilterTabsProps {
  filters: string[];
  selectedIndices: number[];
  onSelect: (index: number) => void;
  onClearAll?: () => void;
  onRegionSelect?: (regions: District[]) => void;
  selectedRegions?: District[];
  onPriceRangeSelect?: (minPrice: number, maxPrice: number) => void;
  onAreaSelect?: (minArea: number, maxArea: number) => void;
  selectedPriceRange?: { min: number; max: number };
  selectedAreaRange?: { min: number; max: number };
  onFurnitureSelect?: (items: string[]) => void;
  onAmenitySelect?: (items: string[]) => void;
  selectedFurniture?: string[];
  selectedAmenities?: string[];
}

const FilterTabs: React.FC<FilterTabsProps> = ({
  filters,
  selectedIndices,
  onSelect,
  onClearAll,
  onRegionSelect,
  selectedRegions = [],
  onPriceRangeSelect,
  onAreaSelect,
  selectedPriceRange,
  selectedAreaRange,
  onFurnitureSelect,
  onAmenitySelect,
  selectedFurniture = [],
  selectedAmenities = [],
}) => {
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showFurnitureModal, setShowFurnitureModal] = useState(false);
  const [showAmenityModal, setShowAmenityModal] = useState(false);

  const handleFilterPress = (index: number) => {
    switch (index) {
      case 0: // Khu vực
        setShowRegionModal(true);
        break;
      case 1: // Khoảng giá
        setShowPriceModal(true);
        break;
      case 2: // Diện tích
        setShowAreaModal(true);
        break;
      case 3: // Nội thất
        setShowFurnitureModal(true);
        break;
      case 4: // Tiện nghi
        setShowAmenityModal(true);
        break;
      default:
        onSelect(index);
    }
  };

  const handleRegionConfirm = (regions: any[]) => {
    onRegionSelect?.(regions);
    setShowRegionModal(false);
  };

  const handlePriceConfirm = (minPrice: number, maxPrice: number) => {
    onPriceRangeSelect?.(minPrice, maxPrice);
    setShowPriceModal(false);
  };

  const handleAreaConfirm = (minArea: number, maxArea: number) => {
    onAreaSelect?.(minArea, maxArea);
    setShowAreaModal(false);
  };

  const handleFurnitureConfirm = (items: string[]) => {
    onFurnitureSelect?.(items);
    setShowFurnitureModal(false);
  };

  const handleAmenityConfirm = (items: string[]) => {
    onAmenitySelect?.(items);
    setShowAmenityModal(false);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      const millions = price / 1000000;
      return millions % 1 === 0 ? `${millions}tr` : `${millions.toFixed(1)}tr`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}k`;
    } else {
      return price.toString();
    }
  };

  const getDisplayText = (item: string, index: number) => {
    if (index === 1 && selectedPriceRange) { // Khoảng giá
      return `${formatPrice(selectedPriceRange.min)} - ${formatPrice(selectedPriceRange.max)}`;
    }
    if (index === 2 && selectedAreaRange) { // Diện tích
      return `${selectedAreaRange.min}m² - ${selectedAreaRange.max}m²`;
    }
    if (index === 3 && selectedFurniture.length > 0) { // Nội thất
      return selectedFurniture.length === 1 
        ? FURNITURE_ITEMS.find(f => f.id === selectedFurniture[0])?.label || item
        : `${selectedFurniture.length} mục`;
    }
    if (index === 4 && selectedAmenities.length > 0) { // Tiện nghi
      return selectedAmenities.length === 1 
        ? AMENITY_ITEMS.find(a => a.id === selectedAmenities[0])?.label || item
        : `${selectedAmenities.length} mục`;
    }
    return item;
  };
  return (
    <View style={styles.wrapper}>
      <ScrollView 
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Clear All Button */}
        {(selectedIndices.length > 0 || selectedRegions.length > 0 || selectedPriceRange || selectedAreaRange || selectedFurniture.length > 0 || selectedAmenities.length > 0) && (
          <TouchableOpacity
            onPress={onClearAll}
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
        
        {filters.map((item, index) => {
          const isSelected = selectedIndices.includes(index) || 
                           (index === 0 && selectedRegions.length > 0) ||
                           (index === 1 && selectedPriceRange) ||
                           (index === 2 && selectedAreaRange) ||
                           (index === 3 && selectedFurniture.length > 0) ||
                           (index === 4 && selectedAmenities.length > 0);
          
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleFilterPress(index)}
              style={[
                styles.tab,
                isSelected ? styles.tabSelected : styles.tabUnselected,
              ]}
            >
              <Text style={styles.tabText}>
                {getDisplayText(item, index)}
              </Text>
              <Text style={styles.arrowText}>
                ▼
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      <RegionModal
        visible={showRegionModal}
        onClose={() => setShowRegionModal(false)}
        onConfirm={handleRegionConfirm}
        selectedRegions={selectedRegions}
      />
      
      <PriceRangeModal
        visible={showPriceModal}
        onClose={() => setShowPriceModal(false)}
        onConfirm={handlePriceConfirm}
        selectedMinPrice={selectedPriceRange?.min}
        selectedMaxPrice={selectedPriceRange?.max}
      />
      
      <AreaModal
        visible={showAreaModal}
        onClose={() => setShowAreaModal(false)}
        onConfirm={handleAreaConfirm}
        selectedMinArea={selectedAreaRange?.min}
        selectedMaxArea={selectedAreaRange?.max}
      />
      
      <CheckboxModal
        visible={showFurnitureModal}
        onClose={() => setShowFurnitureModal(false)}
        onConfirm={handleFurnitureConfirm}
        title="Nội thất"
        subtitle="Lọc tìm kiếm theo nội thất bạn chọn"
        items={FURNITURE_ITEMS}
        selectedItems={selectedFurniture}
      />
      
      <CheckboxModal
        visible={showAmenityModal}
        onClose={() => setShowAmenityModal(false)}
        onConfirm={handleAmenityConfirm}
        title="Tiện nghi"
        subtitle="Lọc tìm kiếm theo tiện nghi bạn chọn"
        items={AMENITY_ITEMS}
        selectedItems={selectedAmenities}
      />
    </View>
  );
};

export default FilterTabs;

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  clearText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  tabSelected: {
    backgroundColor: '#BAFD00',
  },
  tabUnselected: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tabText: {
    marginRight: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  arrowText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
