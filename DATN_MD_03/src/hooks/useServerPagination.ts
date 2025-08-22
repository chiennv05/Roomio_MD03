import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchRooms, loadMoreRooms, searchRoomsAction, loadMoreSearchResults } from '../store/slices/roomSlice';
import { RoomFilters } from '../types/Room';

interface UseServerPaginationOptions {
  pageSize?: number;
  filters?: RoomFilters;
  searchQuery?: string;
  isSearchMode?: boolean;
}

interface UseServerPaginationReturn {
  rooms: any[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  loadMore: () => void;
  refresh: () => void;
  reset: () => void;
}

/**
 * Custom hook for server-side pagination
 * Hook tùy chỉnh cho phân trang từ server
 */
export const useServerPagination = ({
  pageSize = 20,
  filters = {},
  searchQuery = '',
  isSearchMode = false,
}: UseServerPaginationOptions): UseServerPaginationReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    rooms,
    searchResults,
    loading,
    searchLoading,
    error,
    searchError,
    pagination,
    searchPagination,
  } = useSelector((state: RootState) => state.room);

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Determine which data source to use
  const currentRooms = isSearchMode ? searchResults : rooms;
  const currentLoading = isSearchMode ? searchLoading : loading;
  const currentError = isSearchMode ? searchError : error;

  // Calculate pagination info
  const activePagination = isSearchMode ? searchPagination : pagination;
  const currentPage = activePagination?.page || 1;
  const totalPages = activePagination?.totalPages || 1;
  const totalItems = activePagination?.total || 0;
  const hasMore = activePagination?.hasNextPage || false;

  // Load more data
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || currentLoading) {return;}

    setIsLoadingMore(true);
    try {
      if (isSearchMode && searchQuery.trim()) {
        // For search, use loadMoreSearchResults
        await dispatch(loadMoreSearchResults({
          searchQuery: searchQuery.trim(),
          filters: { ...filters, limit: pageSize },
        }));
      } else {
        // For normal rooms, use loadMoreRooms
        await dispatch(loadMoreRooms({ ...filters, limit: pageSize }));
      }
    } catch (err) {
      console.error('Load more failed:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    hasMore,
    isLoadingMore,
    currentLoading,
    isSearchMode,
    searchQuery,
    filters,
    pageSize,
    dispatch,
  ]);

  // Refresh data (reload from first page)
  const refresh = useCallback(() => {
    if (isSearchMode && searchQuery.trim()) {
      dispatch(searchRoomsAction({
        searchQuery: searchQuery.trim(),
        filters: { ...filters, page: 1, limit: pageSize },
      }));
    } else {
      dispatch(fetchRooms({ ...filters, page: 1, limit: pageSize }));
    }
  }, [isSearchMode, searchQuery, filters, pageSize, dispatch]);

  // Reset pagination
  const reset = useCallback(() => {
    setIsLoadingMore(false);
  }, []);

  // Auto-load data when dependencies change
  useEffect(() => {
    if (isSearchMode && searchQuery.trim()) {
      dispatch(searchRoomsAction({
        searchQuery: searchQuery.trim(),
        filters: { ...filters, page: 1, limit: pageSize },
      }));
    } else if (!isSearchMode) {
      dispatch(fetchRooms({ ...filters, page: 1, limit: pageSize }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSearchMode, searchQuery, dispatch, pageSize]); // filters excluded to avoid infinite loops

  return {
    rooms: currentRooms || [],
    loading: currentLoading || isLoadingMore,
    error: currentError,
    hasMore,
    currentPage,
    totalPages,
    totalItems,
    loadMore,
    refresh,
    reset,
  };
};
