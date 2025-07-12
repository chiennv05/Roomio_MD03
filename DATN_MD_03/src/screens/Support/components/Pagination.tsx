import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than max pages to show
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);

      // Calculate range around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push(-1); // -1 represents ellipsis
      }

      // Add pages around current page
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push(-2); // -2 represents ellipsis
      }

      // Always include last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <View style={styles.container}>
      {/* Previous page button */}
      <TouchableOpacity
        style={[styles.arrowButton, currentPage === 1 && styles.disabledButton]}
        onPress={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}>
        <Icon
          name="chevron-left"
          size={24}
          color={currentPage === 1 ? '#CCCCCC' : '#333'}
        />
      </TouchableOpacity>

      {/* Page numbers */}
      <View style={styles.pageNumbersContainer}>
        {getPageNumbers().map((pageNum, index) => {
          if (pageNum < 0) {
            // Render ellipsis
            return (
              <Text key={`ellipsis-${index}`} style={styles.ellipsis}>
                ...
              </Text>
            );
          }
          return (
            <TouchableOpacity
              key={`page-${pageNum}`}
              style={[
                styles.pageButton,
                pageNum === currentPage && styles.currentPageButton,
              ]}
              onPress={() => onPageChange(pageNum)}
              disabled={pageNum === currentPage}>
              <Text
                style={[
                  styles.pageText,
                  pageNum === currentPage && styles.currentPageText,
                ]}>
                {pageNum}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Next page button */}
      <TouchableOpacity
        style={[
          styles.arrowButton,
          currentPage === totalPages && styles.disabledButton,
        ]}
        onPress={() =>
          currentPage < totalPages && onPageChange(currentPage + 1)
        }
        disabled={currentPage === totalPages}>
        <Icon
          name="chevron-right"
          size={24}
          color={currentPage === totalPages ? '#CCCCCC' : '#333'}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  arrowButton: {
    padding: 8,
    borderRadius: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  pageNumbersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  pageButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  currentPageButton: {
    backgroundColor: '#2196F3',
  },
  pageText: {
    fontSize: 14,
    color: '#333',
  },
  currentPageText: {
    color: 'white',
    fontWeight: 'bold',
  },
  ellipsis: {
    fontSize: 16,
    marginHorizontal: 4,
    color: '#555',
  },
});

export default Pagination;
