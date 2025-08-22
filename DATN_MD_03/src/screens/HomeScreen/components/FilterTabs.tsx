import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
//   Dimensions,
} from 'react-native';
import RegionModal from './RegionModal';
import PriceRangeModal from './PriceRangeModal';
import AreaModal from './AreaModal';
import CheckboxModal from './CheckboxModal';
import { District } from '../../../types/Address';
import { useFilter } from '../../../hooks';
import {
  responsiveFont,
  responsiveIcon,
  responsiveSpacing,
} from '../../../utils/responsive';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';
import { Icons } from '../../../assets/icons';

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
  const { furniture, amenities, loading, loadFilterOptions } = useFilter();

  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showFurnitureModal, setShowFurnitureModal] = useState(false);
  const [showAmenityModal, setShowAmenityModal] = useState(false);

  // Memoize the condition to avoid unnecessary re-evaluations
  const shouldLoadOptions = useMemo(() => {
    return furniture.length === 0 && amenities.length === 0 && !loading;
  }, [furniture.length, amenities.length, loading]);

  useEffect(() => {
    if (shouldLoadOptions) {
      loadFilterOptions();
    }
  }, [shouldLoadOptions, loadFilterOptions]);

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
    if (index === 1 && selectedPriceRange &&
        (selectedPriceRange.min !== 0 || selectedPriceRange.max !== 20000000)) { // Khoảng giá
      return `${formatPrice(selectedPriceRange.min)} - ${formatPrice(selectedPriceRange.max)}`;
    }
    if (index === 2 && selectedAreaRange &&
        (selectedAreaRange.min !== 20 || selectedAreaRange.max !== 70)) { // Diện tích
      return `${selectedAreaRange.min}m² - ${selectedAreaRange.max}m²`;
    }
    if (index === 3 && selectedFurniture.length > 0) { // Nội thất
      return selectedFurniture.length === 1
        ? furniture.find(f => f.value === selectedFurniture[0])?.label || item
        : `${selectedFurniture.length} mục`;
    }
    if (index === 4 && selectedAmenities.length > 0) { // Tiện nghi
      return selectedAmenities.length === 1
        ? amenities.find(a => a.value === selectedAmenities[0])?.label || item
        : `${selectedAmenities.length} mục`;
    }
    return item;
  };
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Clear All Button */}
        {(selectedIndices.length > 0 ||
          selectedRegions.length > 0 ||
          (selectedPriceRange && (selectedPriceRange.min !== 0 || selectedPriceRange.max !== 20000000)) ||
          (selectedAreaRange && (selectedAreaRange.min !== 20 || selectedAreaRange.max !== 70)) ||
          selectedFurniture.length > 0 ||
          selectedAmenities.length > 0) && (
          <TouchableOpacity
            onPress={onClearAll}
            style={styles.clearButton}
          >
            <Image
              source={{ uri: Icons.IconRemoveFilter }}
              style={styles.clearIcon}
            />
          </TouchableOpacity>
        )}

        {filters.map((item, index) => {
          // Check if price range is different from default
          const isPriceActive = selectedPriceRange &&
            (selectedPriceRange.min !== 0 || selectedPriceRange.max !== 20000000);

          // Check if area range is different from default
          const isAreaActive = selectedAreaRange &&
            (selectedAreaRange.min !== 20 || selectedAreaRange.max !== 70);

          const isSelected = selectedIndices.includes(index) ||
                           (index === 0 && selectedRegions.length > 0) ||
                           (index === 1 && isPriceActive) ||
                           (index === 2 && isAreaActive) ||
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
              <Image
                source={{ uri: Icons.IconArrowDown2 }}
                style={styles.arrowIcon}
              />
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
        items={furniture.map(item => ({ id: item.value, label: item.label }))}
        selectedItems={selectedFurniture}
      />

      <CheckboxModal
        visible={showAmenityModal}
        onClose={() => setShowAmenityModal(false)}
        onConfirm={handleAmenityConfirm}
        title="Tiện nghi"
        subtitle="Lọc tìm kiếm theo tiện nghi bạn chọn"
        items={amenities.map(item => ({ id: item.value, label: item.label }))}
        selectedItems={selectedAmenities}
      />
    </View>
  );
};

export default FilterTabs;

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: responsiveSpacing(16),
    marginTop: responsiveSpacing(12),
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: responsiveSpacing(16), // Add padding for last item
  },
  clearButton: {
    width: responsiveIcon(32),
    height: responsiveIcon(32),
    borderRadius: responsiveIcon(16),
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: responsiveSpacing(8),
  },
  clearIcon: {
    width: responsiveIcon(16),
    height: responsiveIcon(16),
    tintColor: '#666',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(8),
    borderRadius: responsiveIcon(50),
    marginRight: responsiveSpacing(8),
    minWidth: 106, // Fixed width for consistency
    height: 46,    // Fixed height from Figma
  },
  tabSelected: {
    backgroundColor: Colors.limeGreen,
  },
  tabUnselected: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tabText: {
    marginRight: responsiveSpacing(4),
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
  },
  arrowIcon: {
    width: responsiveIcon(9),
    height: responsiveIcon(5),
    tintColor: Colors.black,
  },
  locationText: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Bold,
  },
});
