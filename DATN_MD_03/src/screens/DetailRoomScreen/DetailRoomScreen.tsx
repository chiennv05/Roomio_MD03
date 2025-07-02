import React, {useEffect, useRef, useState, useMemo, useCallback} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import {useRoute, RouteProp, useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, AppDispatch} from '../../store';
import {
  fetchRoomDetail,
  clearRoomDetail,
  fetchRelatedRooms,
  clearRelatedRooms,
  toggleFavorite,
} from '../../store/slices/roomSlice';
import {StackNavigationProp} from '@react-navigation/stack';
import {Colors} from '../../theme/color';
import {
  responsiveSpacing,
  responsiveFont,
  responsiveIcon,
} from '../../utils/responsive';
import {RootStackParamList} from '../../types/route';
import {Fonts} from '../../theme/fonts';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import {
  LoadingOverlay,
  LoginPromptModal,
  CustomAlertModal,
} from '../../components';
import ShareModal from '../../components/ShareModal';

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
import {Icons} from '../../assets/icons';
import {rentRequets} from '../../store/services/roomService';
import {checkProfileUser} from '../../store/services/authService';
import ModalAleartProfile from '../../components/ModalAleartProfile';

// Type cho route params
type DetailRoomRouteProp = RouteProp<RootStackParamList, 'DetailRoom'>;
type DetailRoomNavigationProp = StackNavigationProp<
  RootStackParamList,
  'DetailRoom'
>;

const DetailRoomScreen: React.FC = () => {
  const route = useRoute<DetailRoomRouteProp>();
  const navigation = useNavigation<DetailRoomNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const supportModalRef = useRef<BottomSheet>(null);
  const bookingModalRef = useRef<BottomSheet>(null);
  const [hasLoadedRelated, setHasLoadedRelated] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showModalProfile, setModalProfile] = useState(false);
  const [messageProfile, setMessageProfile] = useState([]);
  const [alertModal, setAlertModal] = useState({
    visible: false,
    message: '',
    type: 'error' as 'error' | 'success' | 'warning' | 'info',
  });

  const {roomId} = route.params;

  // Lấy data từ Redux store
  const {
    roomDetail,
    roomDetailLoading,
    roomDetailError,
    relatedRooms,
    relatedRoomsLoading,
    relatedRoomsError,
    toggleFavoriteLoading,
  } = useSelector((state: RootState) => state.room);
  console.log('roomid', roomId);

  // Lấy thông tin user để check role
  const {user} = useSelector((state: RootState) => state.auth);

  // Memoized computed values
  const roomDetailData = useMemo(() => {
    if (!roomDetail) return null;

    return {
      name: roomDetail.description || 'Phòng trọ',
      price: `${roomDetail.rentPrice?.toLocaleString('vi-VN') || '0'}`,
      address: roomDetail.location?.addressText || 'Địa chỉ chưa cập nhật',
      roomCode: roomDetail.roomNumber || 'N/A',
      area: roomDetail.area || 0,
      photos: roomDetail.photos || [],
      servicePrices: roomDetail.location?.servicePrices || {},
      amenities: roomDetail.amenities || [],
      furniture: roomDetail.furniture || [],
      ownerName: roomDetail.owner?.fullName || 'Chủ trọ',
      ownerPhone: roomDetail.owner?.phone || 'Chưa có SĐT',
      description: roomDetail.description || 'Mô tả phòng trọ...',
      currentRoomId: roomDetail._id,
      district: roomDetail.location?.district,
      province: roomDetail.location?.province,
      isFavorited: roomDetail.isFavorited || false,
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

  const showAlert = useCallback(
    (
      message: string,
      type: 'error' | 'success' | 'warning' | 'info' = 'error',
    ) => {
      setAlertModal({
        visible: true,
        message,
        type,
      });
    },
    [],
  );

  const hideAlert = useCallback(() => {
    setAlertModal(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);

  const handleFavoritePress = useCallback(() => {
    // Kiểm tra role của user
    if (!user) {
      // Guest - hiển thị custom modal hỏi đăng nhập
      setShowLoginPrompt(true);
    } else {
      // Người thuê - cho phép toggle favorite
      if (!user.auth_token) {
        setShowLoginPrompt(true);
        return;
      }
      dispatch(
        toggleFavorite({
          roomId: roomId,
          token: user.auth_token,
        }),
      );
    }
  }, [user, roomId, dispatch, setShowLoginPrompt]);

  const handleSharePress = useCallback(() => {
    setShowShareModal(true);
  }, []);

  const handleBookingPress = useCallback(async () => {
    // Kiểm tra role của user
    if (!user) {
      setShowLoginPrompt(true);
    } else if (user.role === 'chuTro') {
      showAlert('Chủ trọ không thể đặt phòng.', 'warning');
    } else {
      if (!user.auth_token) {
        setShowLoginPrompt(true);
        return;
      }
      try {
        const checkUser = await checkProfileUser(user.auth_token);
        console.log(checkUser);
        if (!checkUser.data.profileComplete) {
          setMessageProfile(checkUser.data?.missingFieldsVietnamese);
          setModalProfile(true);
          return;
        }

        bookingModalRef.current?.expand();
      } catch (error) {}
    }
  }, [user, showAlert]);

  const handleSupportPress = useCallback(() => {
    supportModalRef.current?.expand();
  }, []);

  const handleCloseLoginPrompt = useCallback(() => {
    setShowLoginPrompt(false);
  }, []);

  const handleCloseShareModal = useCallback(() => {
    setShowShareModal(false);
  }, []);

  const handleNavigateToLogin = useCallback(() => {
    navigation.navigate('Login', {
      redirectTo: 'DetailRoom',
      roomId,
    });
  }, [navigation, roomId]);

  const handleRoomPress = useCallback(
    (roomId: string) => {
      navigation.navigate('DetailRoom', {roomId});
    },
    [navigation],
  );

  const handleRetry = useCallback(() => {
    if (roomId) {
      dispatch(
        fetchRoomDetail({
          roomId,
          token: user?.auth_token || undefined,
        }),
      );
    }
  }, [dispatch, roomId, user?.auth_token]);

  // Single useEffect với logic thông minh
  useEffect(() => {
    // 1. Load room detail khi có roomId
    if (roomId) {
      dispatch(clearRoomDetail());
      dispatch(clearRelatedRooms());
      dispatch(
        fetchRoomDetail({
          roomId,
          token: user?.auth_token || undefined,
        }),
      );
      setHasLoadedRelated(false); // Reset flag
    }

    // 2. Setup focus listener
    const unsubscribe = navigation.addListener('focus', () => {
      if (roomId) {
        dispatch(
          fetchRoomDetail({
            roomId,
            token: user?.auth_token || undefined,
          }),
        );
        setHasLoadedRelated(false);
      }
    });

    // 3. Cleanup function
    return () => {
      unsubscribe();
      dispatch(clearRoomDetail());
      dispatch(clearRelatedRooms());
    };
  }, [dispatch, navigation, roomId, user?.auth_token]);

  // Riêng useEffect cho related rooms để tránh loop
  useEffect(() => {
    if (
      roomDetailData?.currentRoomId &&
      roomDetailData.currentRoomId === roomId &&
      roomDetailData.district &&
      roomDetailData.province &&
      !hasLoadedRelated
    ) {
      dispatch(
        fetchRelatedRooms({
          roomId,
          district: roomDetailData.district,
          province: roomDetailData.province,
          limit: 6,
        }),
      );
      setHasLoadedRelated(true);
    }
  }, [
    dispatch,
    roomId,
    roomDetailData?.currentRoomId,
    roomDetailData?.district,
    roomDetailData?.province,
    hasLoadedRelated,
  ]);

  // Memoized error component
  const ErrorComponent = useMemo(() => {
    if (!hasError) return null;

    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <Text style={styles.errorText}>Có lỗi xảy ra: {roomDetailError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }, [hasError, roomDetailError, handleRetry]);

  const hanldeRentRequest = useCallback(
    async (message: string) => {
      if (!user?.auth_token) {
        setShowLoginPrompt(true);
        return;
      }
      if (message.trim().length === 0) {
        Alert.alert('Bạn cần viết nội dung yêu cầu ');
        return;
      }
      try {
        const response = await rentRequets(roomId, user?.auth_token, message);
        if (response.success) {
          Alert.alert('Thành công', response.message);
        } else {
          console.log(response.message);
          Alert.alert('Thất bại', 'Gửi yêu cầu thất bại');
        }
      } catch (error) {
        console.log('Erro', error);
      }
    },
    [user?.auth_token, roomId],
  );

  const handlUpdateProfile = useCallback(() => {
    navigation.navigate('PersonalInformation', {
      redirectTo: 'DetailRoom',
      roomId,
    });
  }, [navigation, roomId]);

  const handleCloseAleartProfile = useCallback(() => {
    setModalProfile(false);
  }, []);

  // Memoized no data component
  const NoDataComponent = useMemo(() => {
    if (roomDetailData || isLoading || hasError) return null;

    // sự kiện liên hệ đặt phòng

    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <Text style={styles.errorText}>Không tìm thấy thông tin phòng</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
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
          <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent
          />
          <Header
            onGoBack={handleGoBack}
            onFavoritePress={handleFavoritePress}
            onSharePress={handleSharePress}
            isFavorited={roomDetailData.isFavorited}
            favoriteLoading={toggleFavoriteLoading}
          />
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}>
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
                name={roomDetailData.ownerName}
                phone={roomDetailData.ownerPhone}
              />

              <View style={styles.divider} />
              <Description text={roomDetailData.description} />

              <TouchableOpacity style={styles.termsButton}>
                <View style={styles.termsIcon}>
                  <Image
                    source={{uri: Icons.IconDieuKhoan}}
                    style={styles.termsIconImage}
                  />
                </View>
                <Text style={styles.termsText}>
                  Xem điều khoản và điều kiện
                </Text>
                <Image
                  source={{uri: Icons.IconArrowRight}}
                  style={styles.termsArrowRight}
                />
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
          <BookingScheduleModal
            ref={bookingModalRef}
            onPess={hanldeRentRequest}
          />

          {/* Modall yêu cầu ngươi dừng cập nhật thông tin   */}
          <ModalAleartProfile
            visible={showModalProfile}
            onClose={handleCloseAleartProfile}
            onUpdateProfile={handlUpdateProfile}
            message={messageProfile}
          />
          {/* Login Prompt Modal */}
          <LoginPromptModal
            visible={showLoginPrompt}
            onClose={handleCloseLoginPrompt}
            onLogin={handleNavigateToLogin}
          />

          {/* Custom Alert Modal */}
          <CustomAlertModal
            visible={alertModal.visible}
            message={alertModal.message}
            type={alertModal.type}
            onClose={hideAlert}
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
    handleNavigateToLogin,
    toggleFavoriteLoading,
    alertModal.visible,
    alertModal.message,
    alertModal.type,
    hideAlert,
    supportModalRef,
    bookingModalRef,
    hanldeRentRequest,
    handlUpdateProfile,
    handleCloseAleartProfile,
    showModalProfile,
    messageProfile,
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
      {/* Share Modal */}
      {roomDetailData && (
        <ShareModal
          visible={showShareModal}
          onClose={handleCloseShareModal}
          roomId={roomId}
          roomName={roomDetailData.name}
          roomPrice={roomDetailData.price}
          roomAddress={roomDetailData.address}
        />
      )}
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
    fontSize: responsiveFont(16),
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
    width: responsiveIcon(24),
    height: responsiveIcon(24),
    marginRight: responsiveSpacing(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsIconText: {
    fontSize: responsiveFont(14),
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
    width: responsiveIcon(24),
    height: responsiveIcon(24),
  },
  termsArrowRight: {
    width: responsiveIcon(12),
    height: responsiveIcon(24),
  },
});
