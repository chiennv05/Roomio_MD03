import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '../store';
import { fetchFilterOptions, clearFilterError } from '../store/slices/filterSlice';

export const useFilter = () => {
  const dispatch = useDispatch<AppDispatch>();
  const filterState = useSelector((state: RootState) => state.filter);

  const loadFilterOptions = useCallback(() => {
    dispatch(fetchFilterOptions());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearFilterError());
  }, [dispatch]);

  return {
    ...filterState,
    loadFilterOptions,
    clearError,
  };
}; 