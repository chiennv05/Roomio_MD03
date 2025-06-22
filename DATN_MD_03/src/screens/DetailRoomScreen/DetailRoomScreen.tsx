import React, { useEffect } from 'react';
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


// Import các components
import Header from './components/Header';
import ImageCarousel from './components/ImageCarousel';
import RoomInfo from './components/RoomInfo';
import ServiceFees from './components/ServiceFees';
import Amenities from './components/Amenities';
import OwnerInfo from './components/OwnerInfo';
import Description from './components/Description';
import RelatedPosts from './components/RelatedPosts';

// Type cho route params
type DetailRoomRouteProp = RouteProp<RootStackParamList, 'DetailRoom'>;
type DetailRoomNavigationProp = StackNavigationProp<RootStackParamList, 'DetailRoom'>;

const DetailRoomScreen: React.FC = () => {
  const route = useRoute<DetailRoomRouteProp>();
  const navigation = useNavigation<DetailRoomNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { roomId } = route.params;
  
  // Debug log để kiểm tra roomId
  console.log('🏠 DetailRoomScreen Debug:');
  console.log('Route params:', route.params);
  console.log('RoomId received:', roomId);
  
  // Lấy data từ Redux store
  const { 
    roomDetail, 
    roomDetailLoading, 
    roomDetailError,
    relatedRooms,
    relatedRoomsLoading,
    relatedRoomsError 
  } = useSelector((state: RootState) => state.room);

  // Load chi tiết phòng khi component mount hoặc roomId thay đổi
  useEffect(() => {
    console.log('🔄 useEffect triggered with roomId:', roomId);
    
    if (roomId) {
      // Clear data trước khi load mới để tránh hiển thị data cũ
      dispatch(clearRoomDetail());
      dispatch(clearRelatedRooms());
      
      console.log('📡 Dispatching fetchRoomDetail for roomId:', roomId);
      // Load data mới
      dispatch(fetchRoomDetail(roomId));
    } else {
      console.log('❌ No roomId provided in route params');
    }
  }, [dispatch, roomId]); // Chỉ dependency là roomId

  // Load related rooms sau khi có roomDetail
  useEffect(() => {
    if (roomDetail && roomId) {
      const district = roomDetail.location?.district;
      const province = roomDetail.location?.province;
      
      console.log('🔗 Loading related rooms for:', {
        roomId,
        district,
        province
      });
      
      dispatch(fetchRelatedRooms({
        roomId,
        district,
        province,
        limit: 6
      }));
    }
  }, [dispatch, roomDetail, roomId]);

  // Cleanup chỉ khi component thực sự unmount
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      console.log('🧹 Cleaning up data on beforeRemove');
      dispatch(clearRoomDetail());
      dispatch(clearRelatedRooms());
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch, navigation]);

  // Focus listener để reload data khi quay lại
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('👀 Screen focused, roomId:', roomId);
      
      // Nếu không có data hoặc data không match với roomId hiện tại
      if (!roomDetail || roomDetail._id !== roomId) {
        console.log('🔄 Reloading data on focus');
        if (roomId) {
          dispatch(fetchRoomDetail(roomId));
        }
      }
    });

    return unsubscribe;
  }, [navigation, roomId, roomDetail, dispatch]);

  // Hiển thị loading
  if (roomDetailLoading) {
    console.log('⏳ Showing loading state');
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
    console.log('❌ Showing error state:', roomDetailError);
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <Text style={styles.errorText}>Có lỗi xảy ra: {roomDetailError}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            if (roomId) {
              console.log('🔄 Retrying fetchRoomDetail for roomId:', roomId);
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
    console.log('❌ No room detail data available');
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <Text style={styles.errorText}>Không tìm thấy thông tin phòng</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            if (roomId) {
              console.log('🔄 Retrying fetchRoomDetail for roomId:', roomId);
              dispatch(fetchRoomDetail(roomId));
            }
          }}
        >
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Debug log để kiểm tra data
  console.log('✅ Room Detail loaded successfully:');
  console.log('Room ID:', roomDetail._id);
  console.log('Room Name:', roomDetail.description);
  console.log('Amenities:', roomDetail.amenities);
  console.log('Furniture:', roomDetail.furniture);
  console.log('Service Prices:', roomDetail.location?.servicePrices);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Header />
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
            onRoomPress={(roomId) => navigation.push('DetailRoom', { roomId })}
          />
          
          {relatedRoomsError && (
            <Text style={styles.errorText}>
              Không thể tải phòng liên quan: {relatedRoomsError}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
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
    paddingTop: responsiveSpacing(6) 
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
});
