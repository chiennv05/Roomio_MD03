import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchRoomDetail, clearRoomDetail, fetchRelatedRooms, clearRelatedRooms } from '../../store/slices/roomSlice';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors } from '../../theme/color';
import { responsiveSpacing, responsiveFont } from '../../utils/responsive';
import { RootStackParamList } from '../../types/route';
import { Fonts } from '../../theme/fonts';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import { LoadingOverlay, LoginPromptModal } from '../../components';


// Import các components
import Header from './components/Header';
import ImageCarousel from './components/ImageCarousel';
import RoomInfo from './components/RoomInfo';
import ServiceFees from './components/ServiceFees';
import Amenities from './components/Amenities';
import OwnerInfo from './components/OwnerInfo';
import Description from './components/Description';
import RelatedPosts from './components/RelatedPosts';
import ItemButtonConfirm from '../LoginAndRegister/components/ItemButtonConfirm';
import SupportRequestModal from './components/SupportRequestModal';
import BookingScheduleModal from './components/BookingScheduleModal';
import { Icons } from '../../assets/icons';

// Type cho route params
type DetailRoomRouteProp = RouteProp<RootStackParamList, 'DetailRoom'>;
type DetailRoomNavigationProp = StackNavigationProp<RootStackParamList, 'DetailRoom'>;

const DetailRoomScreen: React.FC = () => {
  const route = useRoute<DetailRoomRouteProp>();
  const navigation = useNavigation<DetailRoomNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const supportModalRef = useRef<BottomSheet>(null);
  const bookingModalRef = useRef<BottomSheet>(null);
  const [hasLoadedRelated, setHasLoadedRelated] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  const { roomId } = route.params;
  
  
  // Lấy data từ Redux store
  const { 
    roomDetail, 
    roomDetailLoading, 
    roomDetailError,
    relatedRooms,
    relatedRoomsLoading,
    relatedRoomsError 
  } = useSelector((state: RootState) => state.room);
  
  // Lấy thông tin user để check role
  const { user } = useSelector((state: RootState) => state.auth);

  // Memoized computed values
  const roomDetailData = useMemo(() => {
    if (!roomDetail) return null;
    
    return {
      name: roomDetail.description || "Phòng trọ",
      price: `${roomDetail.rentPrice?.toLocaleString('vi-VN') || '0'}`,
      address: roomDetail.location?.addressText || "Địa chỉ chưa cập nhật",
      roomCode: roomDetail.roomNumber || "N/A",
      area: roomDetail.area || 0,
      photos: roomDetail.photos || [],
      servicePrices: roomDetail.location?.servicePrices || {},
      amenities: roomDetail.amenities || [],
      furniture: roomDetail.furniture || [],
      ownerName: roomDetail.owner?.fullName || "Chủ trọ",
      ownerPhone: roomDetail.owner?.phone || "Chưa có SĐT",
      description: roomDetail.description || "Mô tả phòng trọ...",
      currentRoomId: roomDetail._id,
      district: roomDetail.location?.district,
      province: roomDetail.location?.province,
    };
  }, [roomDetail]);

  // Memoized loading state
  const isLoading = useMemo(() => roomDetailLoading, [roomDetailLoading]);

  // Memoized error state
  const hasError = useMemo(() => !!roomDetailError, [roomDetailError]);

  // Kiểm tra có hiển thị button đặt phòng không
  const shouldShowBookingButton = useMemo(() => {
    // Ẩn button nếu user là chủ trọ
    if (user && user.role === 'chuTro') {
      return false;
    }
    // Hiển thị button cho Guest và người thuê
    return true;
  }, [user]);

  // Memoized navigation callbacks
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleFavoritePress = useCallback(() => {
    // TODO: Implement favorite functionality
    console.log('Favorite pressed');
  }, []);

  const handleSharePress = useCallback(() => {
    // TODO: Implement share functionality
    console.log('Share pressed');
  }, []);

  const handleBookingPress = useCallback(() => {
    // Kiểm tra role của user
    if (!user) {
      // Guest - hiển thị custom modal hỏi đăng nhập
      setShowLoginPrompt(true);
    } else if (user.role === 'chuTro') {
      // Chủ trọ - không được đặt phòng (button sẽ bị ẩn, đây là backup)
      Alert.alert('Thông báo', 'Chủ trọ không thể đặt phòng.');
    } else {
      // Người thuê - cho phép đặt phòng
      bookingModalRef.current?.expand();
    }
  }, [user]);

  const handleSupportPress = useCallback(() => {
    supportModalRef.current?.expand();
  }, []);

  const handleCloseLoginPrompt = useCallback(() => {
    setShowLoginPrompt(false);
  }, []);

  const handleNavigateToLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  const handleRoomPress = useCallback((roomId: string) => {
    navigation.navigate('DetailRoom', { roomId });
  }, [navigation]);

  const handleRetry = useCallback(() => {
    if (roomId) {
      dispatch(fetchRoomDetail(roomId));
    }
  }, [dispatch, roomId]);

  // Single useEffect với logic thông minh
  useEffect(() => {
    console.log("lan 1")
    
    
    // 1. Load room detail khi có roomId
    if (roomId) {
      dispatch(clearRoomDetail());
      dispatch(clearRelatedRooms());
      dispatch(fetchRoomDetail(roomId));
      setHasLoadedRelated(false); // Reset flag
    }

    // 2. Setup focus listener
    const unsubscribe = navigation.addListener('focus', () => {
      if (roomId) {
        // console.log('🔄 Focus: Reloading room data');
        dispatch(fetchRoomDetail(roomId));
        setHasLoadedRelated(false);
      }
    });

    // 3. Cleanup function
    return () => {
      unsubscribe();
      dispatch(clearRoomDetail());
      dispatch(clearRelatedRooms());
    };
  }, [dispatch, navigation, roomId]);

  // Riêng useEffect cho related rooms để tránh loop
  useEffect(() => {
   
    if (roomDetailData?.currentRoomId && 
      roomDetailData.currentRoomId === roomId && 
      roomDetailData.district && 
      roomDetailData.province && 
      !hasLoadedRelated) {
      console.log("lan 2")
      // console.log("🔗 Loading related rooms");
      dispatch(fetchRelatedRooms({
        roomId,
        district: roomDetailData.district,
        province: roomDetailData.province,
        limit: 6
      }));
      setHasLoadedRelated(true);
    }
  }, [dispatch, roomId, roomDetailData?.currentRoomId, roomDetailData?.district, roomDetailData?.province, hasLoadedRelated]);



  // Memoized error component
  const ErrorComponent = useMemo(() => {
    if (!hasError) return null;
    
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <Text style={styles.errorText}>Có lỗi xảy ra: {roomDetailError}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={handleRetry}
        >
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }, [hasError, roomDetailError, handleRetry]);

  // Memoized no data component
  const NoDataComponent = useMemo(() => {
    if (roomDetailData || isLoading || hasError) return null;
    
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <Text style={styles.errorText}>Không tìm thấy thông tin phòng</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={handleRetry}
        >
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }, [roomDetailData, isLoading, hasError, handleRetry]);

  // Memoized main content
  const MainContent = useMemo(() => {
    if (!roomDetailData) return null;

    return (
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          <Header 
            onGoBack={handleGoBack}
            onFavoritePress={handleFavoritePress}
            onSharePress={handleSharePress}
          />
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <ImageCarousel images={roomDetailData.photos} />
            <View style={styles.content}>
              <RoomInfo
                name={roomDetailData.name}
                price={roomDetailData.price}
                address={roomDetailData.address}
                roomCode={roomDetailData.roomCode}
                area={roomDetailData.area}
              />
              
              <View style={styles.divider} />
              <ServiceFees servicePrices={roomDetailData.servicePrices} />
              
              <View style={styles.divider} />
              <Amenities 
                amenities={roomDetailData.amenities}
                furniture={roomDetailData.furniture}
              />
              
              <View style={styles.divider} />
              <OwnerInfo
                avatar="https://randomuser.me/api/portraits/men/41.jpg"
                name={roomDetailData.ownerName}
                phone={roomDetailData.ownerPhone}
              />
              
              <View style={styles.divider} />
              <Description text={roomDetailData.description} />
              
              <TouchableOpacity style={styles.termsButton}>
                <View style={styles.termsIcon}>
                  <Image source={{ uri: Icons.IconDieuKhoan }} 
                  style={styles.termsIconImage} />
                </View>
                <Text style={styles.termsText}>Xem điều khoản và điều kiện</Text>
                <Image source={{ uri: Icons.IconArrowRight }} 
                style={styles.termsArrowRight} />
              </TouchableOpacity>
              
              <View style={styles.divider} />
              <RelatedPosts 
                relatedRooms={relatedRooms}
                loading={relatedRoomsLoading}
                onRoomPress={handleRoomPress}
              />
              
              {relatedRoomsError && (
                <Text style={styles.errorText}>
                  Không thể tải phòng liên quan: {relatedRoomsError}
                </Text>
              )}
            </View>
          </ScrollView>
          
          {/* Button đè lên ScrollView */}
          {shouldShowBookingButton && (
            <View style={styles.floatingButtonContainer}>
              <ItemButtonConfirm
                title="Liên hệ đặt phòng"
                icon={Icons.IconReport}
                onPress={handleBookingPress}
                onPressIcon={handleSupportPress}
              />
            </View>
          )}
          
          {/* Support Request Modal */}
          <SupportRequestModal ref={supportModalRef} />
          
          {/* Booking Schedule Modal */}
          <BookingScheduleModal ref={bookingModalRef} />
          
          {/* Login Prompt Modal */}
          <LoginPromptModal
            visible={showLoginPrompt}
            onClose={handleCloseLoginPrompt}
            onLogin={handleNavigateToLogin}
          />
        </View>
      </GestureHandlerRootView>
    );
  }, [
    roomDetailData, 
    handleGoBack, 
    handleFavoritePress, 
    handleSharePress, 
    relatedRooms, 
    relatedRoomsLoading, 
    relatedRoomsError, 
    handleRoomPress, 
    handleBookingPress, 
    handleSupportPress,
    shouldShowBookingButton,
    showLoginPrompt,
    handleCloseLoginPrompt,
    handleNavigateToLogin
  ]);

  // Hiển thị lỗi
  if (hasError) {
    return ErrorComponent;
  }

  // Nếu không có data và không loading
  if (!roomDetailData && !isLoading) {
    return NoDataComponent;
  }

  return (
    <>
      {MainContent}
      <LoadingOverlay 
        visible={isLoading}
        message="Đang tìm thông tin phòng..."
        size="large"
        transparent={false}
      />
    </>
  );
};

export default DetailRoomScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  content: { 
    padding: responsiveSpacing(16), 
    paddingTop: responsiveSpacing(6),
    paddingBottom: responsiveSpacing(100), // Thêm padding để tránh bị che bởi button
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: responsiveSpacing(8),
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: responsiveSpacing(20),
  },
  errorText: {
    fontSize: 16,
    color: Colors.textGray,
    textAlign: 'center',
  },
  termsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.limeGreenLight,
    paddingVertical: responsiveSpacing(16),
    paddingHorizontal: responsiveSpacing(16),
    borderRadius: 8,
    marginVertical: responsiveSpacing(16),
    borderWidth: 1,
    borderColor: Colors.darkGreen,
  },
  termsIcon: {
    width: 24,
    height: 24,
    marginRight: responsiveSpacing(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsIconText: {
    fontSize: 16,
  },
  termsText: { 
    flex: 1,
    color: Colors.darkGreen, 
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(14),
  },
  termsArrow: {
    color: Colors.limeGreen,
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
  },
  retryButton: {
    backgroundColor: Colors.limeGreen,
    padding: responsiveSpacing(16),
    borderRadius: 8,
    marginTop: responsiveSpacing(16),
  },
  retryText: {
    color: Colors.white,
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    textAlign: 'center',
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: responsiveSpacing(20),
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(20),
  },
  termsIconImage: {
    width: 24,
    height: 24,
  },
  termsArrowRight:{
    width: 12,
    height: 24
  }
});
