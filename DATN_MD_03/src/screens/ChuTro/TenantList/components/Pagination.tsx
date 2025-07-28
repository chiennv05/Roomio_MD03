import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, scale, verticalScale} from '../../../../utils/responsive';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  hasPrevPage,
  hasNextPage,
  onPageChange,
}) => {
  return (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={[styles.pageButton, !hasPrevPage && styles.disabledButton]}
        onPress={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage}>
        <Text style={styles.pageButtonText}>Trước</Text>
      </TouchableOpacity>
      
      <Text style={styles.pageText}>
        Trang {currentPage}/{totalPages}
      </Text>
      
      <TouchableOpacity
        style={[styles.pageButton, !hasNextPage && styles.disabledButton]}
        onPress={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}>
        <Text style={styles.pageButtonText}>Tiếp</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(20),
    paddingBottom: verticalScale(10),
  },
  pageButton: {
    backgroundColor: Colors.darkGreen,
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(8),
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: Colors.gray,
    opacity: 0.7,
  },
  pageButtonText: {
    color: Colors.white,
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(14),
  },
  pageText: {
    marginHorizontal: scale(15),
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(14),
    color: Colors.black,
  },
});

export default Pagination; 