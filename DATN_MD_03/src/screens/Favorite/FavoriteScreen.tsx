import React, { useMemo, useCallback, useEffect, useRef } from 'react';
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
  
  // Refs để tránh tạo lại animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const scaleAnim = useRef(new Animated.Value(1.05)).current;
  const hasAnimated = useRef(false);
  const lastUserId = useRef<string | null>(null);

  // Get data from Redux store với shallow equal
  const favoriteRooms = useSelector((state: RootState) => state.room.favoriteRooms);
  
  // Get user info for authentication
  const user = useSelector((state: RootState) => state.auth.user);
  const authToken = user?.auth_token;
  const userId = user?._id;


  // Load favorite rooms chỉ khi cần thiết
  useEffect(() => {
    if (authToken && (!lastUserId.current || lastUserId.current !== userId)) {
      lastUserId.current = userId || null;
      dispatch(fetchFavoriteRooms(authToken));
    }
  }, [dispatch, authToken, userId]);

  // Reload favorites khi focus (chỉ nếu đã có data trước đó)
  useFocusEffect(
    useCallback(() => {
      if (authToken && favoriteRooms && favoriteRooms.length >= 0) {
        // Chỉ fetch lại nếu đã có data (để refresh)
        dispatch(fetchFavoriteRooms(authToken));
      }
    }, [dispatch, authToken, favoriteRooms])
  );

  // Danh sách hiển thị: toàn bộ phòng yêu thích (memoized)
  const roomsToRender = useMemo(() => {
    if (!favoriteRooms || !Array.isArray(favoriteRooms)) return [];
    return favoriteRooms;
  }, [favoriteRooms]);

  // Animation chỉ chạy lần đầu
  const animateIn = useCallback(() => {
    if (hasAnimated.current) return;
    
    hasAnimated.current = true;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 50,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  // Chỉ animate lần đầu khi mount
  useEffect(() => {
    const timer = setTimeout(() => {
      animateIn();
    }, 100);

    return () => clearTimeout(timer);
  }, [animateIn]);

  // Không còn tìm kiếm, bỏ handler

  // Hàm xử lý nhấn vào room card (memoized)
  const handleRoomPress = useCallback((roomId: string) => {
    (navigation as any).navigate('DetailRoom', { roomId });
  }, [navigation]);

  // Handle login navigation (memoized)
  const handleLoginPress = useCallback(() => {
    (navigation as any).navigate('Login');
  }, [navigation]);

  // Computed values
  const isLoggedIn = !!authToken;
  const favoriteTitle = 'Phòng yêu thích';

  // Early return cho trường hợp chưa đăng nhập
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroud} />
        <EmptyFavorite
          isLoggedIn={false}
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
