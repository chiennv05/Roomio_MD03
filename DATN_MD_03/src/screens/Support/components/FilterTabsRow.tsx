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
  const handleStatusPress = (key: string) => onSelectStatus(key);
  const handleCategoryPress = (key: string) => onSelectCategory(key);

  return (
    <View style={styles.container}>
      {/* Status filters - Beautiful horizontal tabs */}
      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>Trạng thái</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusScrollContent}>
          {statusOptions.map((option, index) => {
            const selected = option.key === selectedStatus;
            return (
              <TouchableOpacity
                key={`status-${option.key}`}
                style={[styles.statusTab, selected && styles.selectedStatusTab]}
                onPress={() => handleStatusPress(option.key)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.statusTabText,
                    selected && styles.selectedStatusTabText,
                  ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Category filters - Beautiful horizontal tabs */}
      <View style={styles.categorySection}>
        <Text style={styles.sectionTitle}>Danh mục</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}>
          {categoryOptions.map((option, index) => {
            const selected = option.key === selectedCategory;
            return (
              <TouchableOpacity
                key={`category-${option.key || 'all'}`}
                style={[
                  styles.categoryTab,
                  selected && styles.selectedCategoryTab,
                ]}
                onPress={() => handleCategoryPress(option.key)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.categoryTabText,
                    selected && styles.selectedCategoryTabText,
                  ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingVertical: responsiveSpacing(20),
  },

  // Status section
  statusSection: {
    marginBottom: responsiveSpacing(24),
  },

  // Category section
  categorySection: {
    marginBottom: responsiveSpacing(8),
  },

  sectionTitle: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(12),
    marginLeft: responsiveSpacing(16),
  },

  statusScrollContent: {
    paddingHorizontal: responsiveSpacing(16),
    paddingRight: responsiveSpacing(32),
  },

  categoryScrollContent: {
    paddingHorizontal: responsiveSpacing(16),
    paddingRight: responsiveSpacing(32),
  },
  // Beautiful Status tabs
  statusTab: {
    paddingHorizontal: responsiveSpacing(20),
    paddingVertical: responsiveSpacing(12),
    marginRight: responsiveSpacing(12),
    borderRadius: scale(25),
    backgroundColor: Colors.lightGray,
    minWidth: scale(70),
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedStatusTab: {
    backgroundColor: Colors.limeGreen,
    shadowColor: Colors.limeGreen,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  statusTabText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Medium,
    color: Colors.unselectedText,
    textAlign: 'center',
  },

  selectedStatusTabText: {
    color: Colors.white,
    fontFamily: Fonts.Roboto_Bold,
  },
  // Beautiful Category tabs
  categoryTab: {
    paddingHorizontal: responsiveSpacing(18),
    paddingVertical: responsiveSpacing(10),
    marginRight: responsiveSpacing(12),
    borderRadius: scale(20),
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.divider,
    minWidth: scale(80),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  selectedCategoryTab: {
    backgroundColor: Colors.limeGreenLight,
    borderColor: Colors.limeGreen,
    borderWidth: 2,
    shadowColor: Colors.limeGreen,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  categoryTabText: {
    fontSize: responsiveFont(13),
    fontFamily: Fonts.Roboto_Medium,
    color: Colors.unselectedText,
    textAlign: 'center',
  },

  selectedCategoryTabText: {
    color: Colors.limeGreen,
    fontFamily: Fonts.Roboto_Bold,
  },
});

export default FilterTabsRow;
