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
    // Only include category options if they exist and have more than just "Tất cả"
    ...(categoryOptions.length > 1 ? categoryOptions.slice(1).map(option => ({...option, type: 'category'})) : []),
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
          const isGoiDangKy = option.key === 'goiDangKy';
          return (
            <TouchableOpacity
              key={`${option.type}-${option.key}`}
              style={[
                styles.tab,
                selected && (isGoiDangKy ? styles.selectedTabBlack : styles.selectedTab),
                index === 0 && styles.firstTab,
                index === allOptions.length - 1 && styles.lastTab,
              ]}
              onPress={() => handleOptionPress(option)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.tabText, 
                  selected && (isGoiDangKy ? styles.selectedTabTextWhite : styles.selectedTabText)
                ]}>
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
    paddingVertical: responsiveSpacing(12),
    paddingHorizontal: responsiveSpacing(16),
    backgroundColor: Colors.backgroud,
  },
  scrollContent: {
    paddingHorizontal: responsiveSpacing(0),
  },
  tab: {
    paddingHorizontal: responsiveSpacing(28),
    paddingVertical: responsiveSpacing(12),
    marginHorizontal: responsiveSpacing(4),
    borderRadius: scale(50),
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.divider,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  selectedTab: {
    backgroundColor: Colors.limeGreen,
    borderColor: Colors.limeGreen,
    elevation: 3,
    shadowOpacity: 0.9,
    borderRadius: scale(50),
    color: Colors.black,
  },
  selectedTabBlack: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
    elevation: 3,
    shadowOpacity: 0.15,
    borderRadius: scale(50),
  },
  firstTab: {
    marginLeft: 0,
  },
  lastTab: {
    marginRight: 0,
  },
  tabText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Medium,
    color: Colors.black,
    textAlign: 'center',
  },
  selectedTabText: {
    color: Colors.black,
    fontFamily: Fonts.Roboto_Bold,
  },
  selectedTabTextWhite: {
    color: Colors.white,
    fontFamily: Fonts.Roboto_Bold,
  },
});

export default React.memo(FilterTabsRow);
