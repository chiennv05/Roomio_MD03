import React, { useMemo, useCallback, useEffect } from 'react';
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
// Bỏ thanh tìm kiếm, chỉ giữ danh sách yêu thích
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

  // Danh sách hiển thị: toàn bộ phòng yêu thích
  const roomsToRender = useMemo(() => {
    if (!favoriteRooms || !Array.isArray(favoriteRooms)) {return [];}
    return favoriteRooms;
  }, [favoriteRooms]);

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

  // Không còn tìm kiếm, bỏ handler

  // Hàm xử lý nhấn vào room card
  const handleRoomPress = useCallback((roomId: string) => {
    // Navigate to DetailRoom screen in the stack navigator
    (navigation as any).navigate('DetailRoom', { roomId });
  }, [navigation]);

  // Tiêu đề đơn giản cho danh sách yêu thích
  const favoriteTitle = useMemo(() => 'Phòng yêu thích', []);

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
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        {/* Favorite Results */}
        <FavoriteSearchResults
          title={favoriteTitle}
          rooms={roomsToRender}
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
    backgroundColor: Colors.white,
  },
  animatedContainer: {
    flex: 1,
  },
});
