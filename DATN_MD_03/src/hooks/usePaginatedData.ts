import { useState, useMemo, useCallback } from 'react';

interface UsePaginatedDataOptions {
  data: any[];
  pageSize?: number;
  initialPageCount?: number;
}

interface UsePaginatedDataReturn {
  displayedData: any[];
  hasMore: boolean;
  isLoading: boolean;
  loadMore: () => void;
  reset: () => void;
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

/**
 * Custom hook for paginated data with lazy loading
 * Hook tùy chỉnh cho dữ liệu phân trang với lazy loading
 */
export const usePaginatedData = ({
  data = [],
  pageSize = 10,
  initialPageCount = 1
}: UsePaginatedDataOptions): UsePaginatedDataReturn => {
  const [currentPage, setCurrentPage] = useState(initialPageCount);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(data.length / pageSize);
  }, [data.length, pageSize]);

  // Get displayed data based on current page
  const displayedData = useMemo(() => {
    const endIndex = currentPage * pageSize;
    return data.slice(0, endIndex);
  }, [data, currentPage, pageSize]);

  // Check if there's more data to load
  const hasMore = useMemo(() => {
    return currentPage < totalPages;
  }, [currentPage, totalPages]);

  // Load more data
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setIsLoading(true);
      
      // Simulate loading delay for smooth UX
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsLoading(false);
      }, 300);
    }
  }, [hasMore, isLoading]);

  // Reset pagination
  const reset = useCallback(() => {
    setCurrentPage(initialPageCount);
    setIsLoading(false);
  }, [initialPageCount]);

  return {
    displayedData,
    hasMore,
    isLoading,
    loadMore,
    reset,
    totalItems: data.length,
    currentPage,
    totalPages
  };
}; 