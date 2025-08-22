import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {
  responsiveFont,
  responsiveSpacing,
  scale,
} from '../../../utils/responsive';

interface FilterOption {
  key: string;
  label: string;
}

interface FilterTabsRowProps {
  statusOptions: FilterOption[];
  categoryOptions: FilterOption[];
  selectedStatus: string;
  selectedCategory: string;
  onSelectStatus: (value: string) => void;
  onSelectCategory: (value: string) => void;
}

const FilterTabsRow: React.FC<FilterTabsRowProps> = ({
  statusOptions,
  categoryOptions,
  selectedStatus,
  selectedCategory,
  onSelectStatus,
  onSelectCategory,
}) => {
  // Combine all options into one array with type indicator
  const allOptions = [
    ...statusOptions.map(option => ({...option, type: 'status'})),
    ...categoryOptions.slice(1).map(option => ({...option, type: 'category'})), // Skip "Tất cả" for category
  ];

  const handleOptionPress = (option: any) => {
    if (option.type === 'status') {
      onSelectStatus(option.key);
    } else {
      onSelectCategory(option.key);
    }
  };

  const isSelected = (option: any) => {
    if (option.type === 'status') {
      return option.key === selectedStatus;
    } else {
      return option.key === selectedCategory;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {allOptions.map((option, index) => {
          const selected = isSelected(option);
          return (
            <TouchableOpacity
              key={`${option.type}-${option.key}`}
              style={[
                styles.tab,
                selected && styles.selectedTab,
                index === 0 && styles.firstTab,
                index === allOptions.length - 1 && styles.lastTab,
              ]}
              onPress={() => handleOptionPress(option)}
              activeOpacity={0.7}>
              <Text
                style={[styles.tabText, selected && styles.selectedTabText]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: responsiveSpacing(8), // Giảm padding vertical
    paddingHorizontal: responsiveSpacing(8), // Thêm lại padding ngang nhỏ
  },
  scrollContent: {
    paddingHorizontal: responsiveSpacing(4),
  },
  tab: {
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(8),
    marginHorizontal: responsiveSpacing(4),
    borderRadius: scale(20),
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  selectedTab: {
    backgroundColor: Colors.limeGreen,
    borderColor: Colors.limeGreen,
  },
  firstTab: {
    marginLeft: 0,
  },
  lastTab: {
    marginRight: 0,
  },
  tabText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    textAlign: 'center',
  },
  selectedTabText: {
    color: Colors.black,
    fontFamily: Fonts.Roboto_Bold,
  },
});

export default FilterTabsRow;
