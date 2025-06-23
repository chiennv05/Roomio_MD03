import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  StatusBar,
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
   
    const currentRoomId = roomDetail?._id;
    const district = roomDetail?.location?.district;
    const province = roomDetail?.location?.province;
    
    if (currentRoomId && 
      currentRoomId === roomId && 
      district && 
      province && 
      !hasLoadedRelated) {
      console.log("lan 2")
      // console.log("🔗 Loading related rooms");
      dispatch(fetchRelatedRooms({
        roomId,
        district,
        province,
        limit: 6
      }));
      setHasLoadedRelated(true);
    }
  }, [dispatch, roomId, roomDetail?._id, roomDetail?.location?.district, roomDetail?.location?.province, hasLoadedRelated]);

  // Hiển thị loading
  if (roomDetailLoading) {
    
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <ActivityIndicator size="large" color={Colors.darkGreen} />
        <Text style={styles.loadingText}>Đang tải thông tin phòng...</Text>
      </View>
    );
  }

  // Hiển thị lỗi
  if (roomDetailError) {
    
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <Text style={styles.errorText}>Có lỗi xảy ra: {roomDetailError}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            if (roomId) {
              
              dispatch(fetchRoomDetail(roomId));
            }
          }}
        >
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Nếu không có data
  if (!roomDetail) {
    
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <Text style={styles.errorText}>Không tìm thấy thông tin phòng</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            if (roomId) {
              
              dispatch(fetchRoomDetail(roomId));
            }
          }}
        >
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // // Debug log để kiểm tra data
  // console.log('✅ Room Detail loaded successfully:');
  // console.log('Room ID:', roomDetail._id);
  // console.log('Room Name:', roomDetail.description);
  // console.log('Amenities:', roomDetail.amenities);
  // console.log('Furniture:', roomDetail.furniture);
  // console.log('Service Prices:', roomDetail.location?.servicePrices);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <Header 
          onGoBack={() => navigation.goBack()}
          onFavoritePress={() => {
            // TODO: Implement favorite functionality
            console.log('Favorite pressed');
          }}
          onSharePress={() => {
            // TODO: Implement share functionality
            console.log('Share pressed');
          }}
        />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <ImageCarousel images={roomDetail.photos || []} />
          <View style={styles.content}>
            <RoomInfo
              name={roomDetail.description || "Phòng trọ"}
              price={`${roomDetail.rentPrice?.toLocaleString('vi-VN') || '0'}`}
              address={roomDetail.location?.addressText || "Địa chỉ chưa cập nhật"}
              roomCode={roomDetail.roomNumber || "N/A"}
              area={roomDetail.area || 0}
            />
            
            <View style={styles.divider} />
            <ServiceFees servicePrices={roomDetail.location.servicePrices || {}} />
            
            <View style={styles.divider} />
            <Amenities 
              amenities={roomDetail.amenities || []}
              furniture={roomDetail.furniture || []}
            />
            
            <View style={styles.divider} />
            <OwnerInfo
              avatar="https://randomuser.me/api/portraits/men/41.jpg"
              name={roomDetail.owner?.fullName || "Chủ trọ"}
              phone={roomDetail.owner?.phone || "Chưa có SĐT"}
            />
            
            <View style={styles.divider} />
            <Description text={roomDetail.description || "Mô tả phòng trọ..."} />
            
            <TouchableOpacity style={styles.termsButton}>
              <View style={styles.termsIcon}>
                <Text style={styles.termsIconText}>📋</Text>
              </View>
              <Text style={styles.termsText}>Xem điều khoản và điều kiện</Text>
              <Text style={styles.termsArrow}>›</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            <RelatedPosts 
              relatedRooms={relatedRooms}
              loading={relatedRoomsLoading}
              onRoomPress={(roomId) => navigation.navigate('DetailRoom', { roomId })}
            />
            
            {relatedRoomsError && (
              <Text style={styles.errorText}>
                Không thể tải phòng liên quan: {relatedRoomsError}
              </Text>
            )}
          </View>
        </ScrollView>
        
        {/* Button đè lên ScrollView */}
        <View style={styles.floatingButtonContainer}>
          <ItemButtonConfirm
            title="Liên hệ đặt phòng"
            icon={Icons.IconReport}
            onPress={() => bookingModalRef.current?.expand()}
            onPressIcon={() => supportModalRef.current?.expand()}
          />
        </View>
        
        {/* Support Request Modal */}
        <SupportRequestModal ref={supportModalRef} />
        
        {/* Booking Schedule Modal */}
        <BookingScheduleModal ref={bookingModalRef} />
      </View>
    </GestureHandlerRootView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingText: {
    marginTop: responsiveSpacing(16),
    fontSize: 16,
    color: Colors.textGray,
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
    color: Colors.darkGreen,
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
});
