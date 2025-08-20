import React, {useEffect, useRef, useState, useMemo, useCallback} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {useRoute, RouteProp, useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, AppDispatch} from '../../store';
import {
  fetchRoomDetail,
  clearRoomDetail,
  fetchRelatedRooms,
  clearRelatedRooms,
  setRelatedRooms,
  toggleFavorite,
} from '../../store/slices/roomSlice';
import {StackNavigationProp} from '@react-navigation/stack';
import {Colors} from '../../theme/color';
import {responsiveSpacing, responsiveFont} from '../../utils/responsive';
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
    title: undefined as string | undefined,
    type: 'error' as 'error' | 'success' | 'warning' | 'info',
  });
  const [alertButtons, setAlertButtons] = useState<
    Array<{text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive'}> | undefined
  >(undefined);

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

  // Lấy thông tin user để check role
  const {user} = useSelector((state: RootState) => state.auth);

  // Memoized computed values
  const roomDetailData = useMemo(() => {
    if (!roomDetail) {return null;}

    return {
      name: roomDetail.description || 'Phòng trọ',
      price: `${roomDetail.rentPrice?.toLocaleString('vi-VN') || '0'}`,
      address: roomDetail.location?.addressText || 'Địa chỉ chưa cập nhật',
      roomCode: roomDetail.roomNumber || 'N/A',
      area: roomDetail.area || 0,
      maxOccupancy: roomDetail.maxOccupancy || 1,
      photos: roomDetail.photos || [],
      servicePrices: roomDetail.location?.servicePrices || {},
      servicePriceConfig: roomDetail.location?.servicePriceConfig || {},
      customServices: roomDetail.location?.customServices || [],
      amenities: roomDetail.amenities || [],
      furniture: roomDetail.furniture || [],
      ownerName: roomDetail.owner?.fullName || 'Chủ trọ',
      ownerPhone: `Có ${roomDetail.owner?.stats?.totalRooms || 0} bài đăng`,
      ownerAvatar: roomDetail.owner?.avatar || '',
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
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('UITab'); // hoặc navigation.navigate('Home')
    }
  }, [navigation]);

  const showAlert = useCallback(
    (
      message: string,
      type: 'error' | 'success' | 'warning' | 'info' = 'error',
      title?: string,
      buttons?: Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>,
    ) => {
      const defaultTitle =
        title || (type === 'success' ? 'Thành công' : type === 'error' ? 'Lỗi' : 'Thông báo');
      setAlertModal({
        visible: true,
        message,
        title: defaultTitle,
        type,
      });
      if (buttons && buttons.length > 0) {
        setAlertButtons(buttons);
      } else {
        setAlertButtons([
          {
            text: 'OK',
            onPress: () => setAlertModal(prev => ({...prev, visible: false})),
            style: 'default',
          },
        ]);
      }
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
  }, [user, roomId, dispatch]);

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
    // Guest không được phép báo cáo phòng – hiển thị modal yêu cầu đăng nhập
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    supportModalRef.current?.expand();
  }, [user]);

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

  const handleMapPress = useCallback(() => {
    if (roomDetail?.location?.coordinates?.coordinates) {
      const [longitude, latitude] = roomDetail.location.coordinates.coordinates;
      navigation.navigate('MapScreen', {
        latitude,
        longitude,
        address: roomDetail.location.addressText,
        roomDetail: roomDetail,
        isSelectMode: false,
      });
    }
  }, [navigation, roomDetail]);

  const handleRoomPress = useCallback(
    (selectedRoomId: string) => {
      navigation.navigate('DetailRoom', {roomId: selectedRoomId});
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

  // Lấy danh sách rooms từ HomeScreen để tìm phòng liên quan
  const { rooms: homeRooms } = useSelector((state: RootState) => state.room);

  // Logic thông minh: Ưu tiên khu vực, sau đó đến giá gần nhau
  useEffect(() => {
    if (
      roomDetailData?.currentRoomId &&
      roomDetailData.currentRoomId === roomId &&
      !hasLoadedRelated &&
      homeRooms.length > 0
    ) {
      // Lọc ra tất cả phòng khác (loại bỏ phòng hiện tại)
      const otherRooms = homeRooms.filter(room => room._id !== roomId);

      if (otherRooms.length > 0) {
        const currentPrice = roomDetailData.price ?
          parseInt(roomDetailData.price.replace(/[^\d]/g, ''), 10) : 0;
        const currentDistrict = roomDetailData.district;

        // 1. Ưu tiên cao nhất: Phòng cùng khu vực (district)
        const sameDistrictRooms = otherRooms.filter(room =>
          room.location?.district === currentDistrict
        );

        // 2. Ưu tiên thứ hai: Phòng có giá gần giá hiện tại (trong khoảng ±30%)
        const priceRange = currentPrice * 0.3; // 30% khoảng giá
        const similarPriceRooms = otherRooms.filter(room => {
          const roomPrice = room.rentPrice || 0;
          return Math.abs(roomPrice - currentPrice) <= priceRange;
        });

        // 3. Sắp xếp phòng cùng khu vực theo giá gần nhất
        const sortedSameDistrict = sameDistrictRooms.sort((a, b) => {
          const priceA = a.rentPrice || 0;
          const priceB = b.rentPrice || 0;
          return Math.abs(priceA - currentPrice) - Math.abs(priceB - currentPrice);
        });

        // 4. Sắp xếp phòng giá tương tự theo khoảng cách giá
        const sortedSimilarPrice = similarPriceRooms
          .filter(room => room.location?.district !== currentDistrict) // Loại bỏ phòng đã có trong cùng khu vực
          .sort((a, b) => {
            const priceA = a.rentPrice || 0;
            const priceB = b.rentPrice || 0;
            return Math.abs(priceA - currentPrice) - Math.abs(priceB - currentPrice);
          });

        // 5. Kết hợp theo thứ tự ưu tiên và lấy tối đa 5 phòng
        const relatedRoomsFromHome = [
          ...sortedSameDistrict,           // Ưu tiên 1: Cùng khu vực
          ...sortedSimilarPrice,           // Ưu tiên 2: Giá tương tự
          ...otherRooms.filter(room =>     // Ưu tiên 3: Phòng còn lại
            room.location?.district !== currentDistrict &&
            !similarPriceRooms.includes(room)
          ),
        ].slice(0, 5);

        console.log('🏠 Smart Related Rooms Debug:');
        console.log('- Current room:', roomDetailData.name);
        console.log('- Current district:', currentDistrict);
        console.log('- Current price:', currentPrice.toLocaleString('vi-VN'));
        console.log('- Same district rooms:', sortedSameDistrict.length);
        console.log('- Similar price rooms:', sortedSimilarPrice.length);
        console.log('- Final related rooms:', relatedRoomsFromHome.length);
        console.log('- Related rooms details:', relatedRoomsFromHome.map(room => ({
          district: room.location?.district,
          price: room.rentPrice?.toLocaleString('vi-VN'),
          name: room.description?.substring(0, 30) + '...',
        })));

        // Cập nhật vào Redux store
        dispatch(setRelatedRooms(relatedRoomsFromHome));
        setHasLoadedRelated(true);
      } else {
        // Nếu không có phòng nào khác trong HomeScreen, fallback về API
        dispatch(
          fetchRelatedRooms({
            roomId,
            district: roomDetailData.district,
            province: roomDetailData.province,
            limit: 5,
          }),
        );
        setHasLoadedRelated(true);
      }
    }
  }, [
    dispatch,
    roomId,
    roomDetailData?.currentRoomId,
    roomDetailData?.district,
    roomDetailData?.province,
    roomDetailData?.price,
    roomDetailData?.name,
    hasLoadedRelated,
    homeRooms,
  ]);

  // Memoized error component
  const ErrorComponent = useMemo(() => {
    if (!hasError) {return null;}

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
        showAlert('Bạn cần viết nội dung yêu cầu', 'warning');
        return;
      }
      try {
        const response = await rentRequets(roomId, user?.auth_token, message);
        if (response.success) {
          showAlert(
            response.message || 'Đã gửi yêu cầu thuê phòng thành công',
            'success',
            'Thành công'
          );
          bookingModalRef.current?.close();
        } else {
          console.log(response.message);
          showAlert('Gửi yêu cầu thất bại', 'error', 'Thất bại');
          bookingModalRef.current?.close();
        }
      } catch (error) {
        console.log('Erro', error);
      }
    },
    [user?.auth_token, roomId, showAlert],
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
    if (roomDetailData || isLoading || hasError) {return null;}

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
    if (!roomDetailData) {return null;}

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
                // name={}
                name={''}
                price={roomDetailData.price}
                address={roomDetailData.address}
                roomCode={roomDetailData.roomCode}
                area={roomDetailData.area}
                maxOccupancy={roomDetailData.maxOccupancy}
                deposit={1}
                onMapPress={handleMapPress}
              />

              <View style={styles.divider} />
              <ServiceFees
                servicePrices={roomDetailData.servicePrices}
                servicePriceConfig={roomDetailData.servicePriceConfig}
                customServices={roomDetailData.customServices}
              />

              <View style={styles.divider} />
              <Amenities
                amenities={roomDetailData.amenities}
                furniture={roomDetailData.furniture}
              />

              <View style={styles.divider} />
              <OwnerInfo
                avatar={roomDetailData.ownerAvatar}
                name={roomDetailData.ownerName}
                phone={roomDetailData.ownerPhone}
              />

              <View style={styles.divider} />
              <Description text={roomDetailData.description} />

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
          <SupportRequestModal
            ref={supportModalRef}
            roomId={roomId}
            roomInfo={{
              name: roomDetailData?.name,
              address: roomDetailData?.address,
              ownerName: roomDetailData?.ownerName,
              roomCode: roomDetailData?.roomCode,
            }}
          />

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
            title={alertModal.title}
            message={alertModal.message}
            type={alertModal.type}
            onClose={hideAlert}
            buttons={alertButtons}
          />
        </View>
      </GestureHandlerRootView>
    );
  }, [
    roomDetailData,
    roomId,
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
    alertModal.title,
    alertButtons,
    hideAlert,
    supportModalRef,
    bookingModalRef,
    hanldeRentRequest,
    handlUpdateProfile,
    handleCloseAleartProfile,
    showModalProfile,
    messageProfile,
    handleMapPress,
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
});
