import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, scale, verticalScale} from '../../../../utils/responsive';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({currentPage, totalPages, onPageChange}: PaginationProps) => {
  // Không hiển thị pagination nếu chỉ có 1 trang
  if (totalPages <= 1) {
    return null;
  }

  // Tạo mảng các số trang để hiển thị
  const renderPageNumbers = () => {
    const pageNumbers = [];
    
    // Luôn hiển thị trang đầu tiên
    pageNumbers.push(1);

    // Hiển thị các trang xung quanh trang hiện tại
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!pageNumbers.includes(i)) {
        pageNumbers.push(i);
      }
    }

    // Luôn hiển thị trang cuối cùng nếu có nhiều hơn 1 trang
    if (totalPages > 1 && !pageNumbers.includes(totalPages)) {
      pageNumbers.push(totalPages);
    }

    // Sắp xếp lại và thêm dấu "..." nếu cần
    pageNumbers.sort((a, b) => a - b);
    const result = [];

    for (let i = 0; i < pageNumbers.length; i++) {
      if (i > 0 && pageNumbers[i] > pageNumbers[i - 1] + 1) {
        result.push('...');
      }
      result.push(pageNumbers[i]);
    }

    return result;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.pageButton, currentPage === 1 && styles.disabledButton]}
        onPress={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}>
        <Text style={[styles.pageButtonText, currentPage === 1 && styles.disabledText]}>
          Trước
        </Text>
      </TouchableOpacity>

      <View style={styles.pageNumbersContainer}>
        {renderPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <Text key={`ellipsis-${index}`} style={styles.ellipsis}>
                {page}
              </Text>
            );
          }
          
          const pageNumber = page as number;
          return (
            <TouchableOpacity
              key={`page-${pageNumber}`}
              style={[
                styles.pageNumberButton,
                currentPage === pageNumber && styles.activePage,
              ]}
              onPress={() => onPageChange(pageNumber)}>
              <Text
                style={[
                  styles.pageNumberText,
                  currentPage === pageNumber && styles.activePageText,
                ]}>
                {pageNumber}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[
          styles.pageButton,
          currentPage === totalPages && styles.disabledButton,
        ]}
        onPress={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}>
        <Text
          style={[
            styles.pageButtonText,
            currentPage === totalPages && styles.disabledText,
          ]}>
          Sau
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  pageButton: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
  },
  pageButtonText: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(14),
    color: Colors.black,
  },
  disabledButton: {
    backgroundColor: Colors.gray200,
  },
  disabledText: {
    color: Colors.textGray,
  },
  pageNumbersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageNumberButton: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: scale(4),
    backgroundColor: Colors.lightGray,
  },
  pageNumberText: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(14),
    color: Colors.black,
  },
  activePage: {
    backgroundColor: Colors.limeGreen,
  },
  activePageText: {
    fontFamily: Fonts.Roboto_Bold,
  },
  ellipsis: {
    marginHorizontal: scale(4),
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(14),
    color: Colors.textGray,
  },
});

export default Pagination; 