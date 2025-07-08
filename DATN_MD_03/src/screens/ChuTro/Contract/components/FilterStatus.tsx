import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, scale, verticalScale} from '../../../../utils/responsive';

interface FilterOption {
  value: string | null;
  label: string;
}

const filterOptions: FilterOption[] = [
  {value: null, label: 'Tất cả'},
  {value: 'draft', label: 'Bản nháp'},
  {value: 'pending_signature', label: 'Chờ ký'},
  {value: 'pending_approval', label: 'Chờ phê duyệt'},
  {value: 'active', label: 'Đang hoạt động'},
  {value: 'expired', label: 'Hết hạn'},
  {value: 'terminated', label: 'Đã chấm dứt'},
];

interface FilterStatusProps {
  selectedStatus: string | null;
  onSelectStatus: (status: string | null) => void;
}

const FilterStatus = ({selectedStatus, onSelectStatus}: FilterStatusProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}>
      {filterOptions.map(option => (
        <TouchableOpacity
          key={option.label}
          style={[
            styles.filterOption,
            selectedStatus === option.value && styles.selectedOption,
          ]}
          onPress={() => onSelectStatus(option.value)}>
          <Text
            style={[
              styles.optionText,
              selectedStatus === option.value && styles.selectedOptionText,
            ]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
  },
  contentContainer: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
  },
  filterOption: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(6),
    borderRadius: 16,
    backgroundColor: Colors.lightGray,
    marginRight: scale(8),
  },
  selectedOption: {
    backgroundColor: Colors.limeGreen,
  },
  optionText: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(14),
    color: Colors.textGray,
  },
  selectedOptionText: {
    color: Colors.black,
    fontFamily: Fonts.Roboto_Bold,
  },
});

export default FilterStatus; 