import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchFavoriteRooms } from '../../store/slices/roomSlice';
import { Colors } from '../../theme/color';
import { filterRoomsBySearch } from '../../utils/validate';

// Import reusable components from SearchScreen
import SearchBar from '../SearchScreen/components/SearchBar';
import FavoriteSearchResults from './components/FavoriteSearchResults';
import EmptyFavorite from './components/EmptyFavorite';

const FavoriteScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  
  // Get data from Redux store
  const { 
    favoriteRooms, 
  } = useSelector((state: RootState) => state.room);
  
  // Get user info for authentication
  const { user } = useSelector((state: RootState) => state.auth);

  // Animation states
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(100), []);
  const scaleAnim = useMemo(() => new Animated.Value(1.05), []);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce search query to improve performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 800); // 800ms delay để tránh request liên tục

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load favorite rooms when component mounts or user changes
  useEffect(() => {
    if (user?.auth_token) {
      dispatch(fetchFavoriteRooms(user.auth_token));
    }
  }, [dispatch, user?.auth_token]);

  // Reload favorites when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.auth_token) {
        dispatch(fetchFavoriteRooms(user.auth_token));
      }
    }, [dispatch, user?.auth_token])
  );

  // Filter favorite rooms by search query
  const filteredFavoriteRooms = useMemo(() => {
    if (!favoriteRooms || !Array.isArray(favoriteRooms)) return [];
    
    // Apply search filter with debounced query
    const searchFiltered = filterRoomsBySearch(favoriteRooms, debouncedSearchQuery);
    
    return searchFiltered;
  }, [favoriteRooms, debouncedSearchQuery]);

  // Animation khi vào màn hình - slide up từ dưới
  const animateIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  // Reset và chạy animation khi screen focus
  useFocusEffect(
    useCallback(() => {
      // Reset animation values để tạo hiệu ứng slide up từ dưới
      fadeAnim.setValue(0);
      slideAnim.setValue(100);
      scaleAnim.setValue(1.05);
      
      // Start animation
      const timer = setTimeout(() => {
        animateIn();
      }, 0);

      return () => clearTimeout(timer);
    }, [fadeAnim, slideAnim, scaleAnim, animateIn])
  );

  // Hàm xử lý tìm kiếm
  const handleSearch = useCallback(() => {
    // Real-time search is handled by filteredFavoriteRooms useMemo
    if (debouncedSearchQuery.trim()) {
      console.log(`🔍 User searched favorites for: "${debouncedSearchQuery}"`);
    }
  }, [debouncedSearchQuery]);

  // Hàm xử lý thay đổi text - Real-time filtering
  const handleSearchTextChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  // Hàm xử lý nhấn vào room card
  const handleRoomPress = useCallback((roomId: string) => {
    // Navigate to DetailRoom screen in the stack navigator
    (navigation as any).navigate('DetailRoom', { roomId });
  }, [navigation]);

  // Memoized title with search results count
  const favoriteTitle = useMemo(() => {
    if (debouncedSearchQuery.trim()) {
      return `Tìm kiếm trong yêu thích (${filteredFavoriteRooms.length})`;
    }
    return `Phòng yêu thích (${filteredFavoriteRooms.length})`;
  }, [debouncedSearchQuery, filteredFavoriteRooms.length]);

  // Check if user is logged in
  const isLoggedIn = !!user?.auth_token;

  // Handle login navigation
  const handleLoginPress = useCallback(() => {
    (navigation as any).navigate('Login');
  }, [navigation]);

  // Show empty state only for non-logged users
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroud} />
        <EmptyFavorite 
          isLoggedIn={isLoggedIn}
          onLoginPress={handleLoginPress}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroud} />
      
      <Animated.View 
        style={[
          styles.animatedContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
          }
        ]}
      >
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearchTextChange}
          onSearchPress={handleSearch}
          placeholder="Tìm trong danh sách yêu thích..."
        />
   
        {/* Favorite Results */}
        <FavoriteSearchResults
          title={favoriteTitle}
          rooms={filteredFavoriteRooms}
          onRoomPress={handleRoomPress}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

export default FavoriteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  animatedContainer: {
    flex: 1,
  },
});
