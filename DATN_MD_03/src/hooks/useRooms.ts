import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '../store';
import { fetchRooms, loadMoreRooms, clearRoomError, resetRooms } from '../store/slices/roomSlice';
import { RoomFilters } from '../types/Room';

export const useRooms = () => {
  const dispatch = useDispatch<AppDispatch>();
  const roomState = useSelector((state: RootState) => state.room);

  const loadRooms = useCallback((filters: RoomFilters = {}) => {
    dispatch(fetchRooms(filters));
  }, [dispatch]);

  const loadMore = useCallback((filters: RoomFilters = {}) => {
    dispatch(loadMoreRooms(filters));
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearRoomError());
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch(resetRooms());
  }, [dispatch]);

  return {
    ...roomState,
    loadRooms,
    loadMore,
    clearError,
    reset,
  };
}; 