import {StyleSheet, View, ScrollView, StatusBar, Platform} from 'react-native';
import React from 'react';
import {useRoute} from '@react-navigation/native';
import {Colors} from '../../../theme/color';
import {useRoomDetail} from './hooks';
import {ErrorState, LoadingState, RoomInfo} from './components';
import HeaderItem from './components/HeaderItem';
import ImageCarousel from '../../DetailRoomScreen/components/ImageCarousel';
import {responsiveSpacing} from '../../../utils/responsive';
import ServiceFees from '../../DetailRoomScreen/components/ServiceFees';
import Amenities from '../../DetailRoomScreen/components/Amenities';
import Description from '../../DetailRoomScreen/components/Description';

type RoomDetailRouteProp = {
  params: {
    id: string;
  };
};

export default function RoomDetail() {
  const route = useRoute<any>() as RoomDetailRouteProp;
  const {id: roomId} = route.params;

  const {
    selectedRoom,
    loading,
    error,
    handleNavigateToUpdate,
    formatNumber,
    handleRetry,
    handleDeleteRoom, // Thêm function này
    navigation,
  } = useRoomDetail(roomId);

  if (loading) {
    return (
      <View style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <LoadingState />
      </View>
    );
  }

  if (error || !selectedRoom) {
    return (
      <View style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <ErrorState error={error} onRetry={handleRetry} />
      </View>
    );
  }
  if (!selectedRoom) {
    return null; // Hoặc có thể hiển thị một thông báo nào đó
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.container}>
        <View style={styles.statusBarBackground} />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}>
          <HeaderItem
            onGoBack={() => navigation.goBack()}
            onUpdate={handleNavigateToUpdate}
            onDelete={handleDeleteRoom} // Thêm prop này
          />
          <ImageCarousel images={selectedRoom.photos || []} />
          <View style={styles.content}>
            <RoomInfo
              // name={}
              name={selectedRoom.roomNumber}
              price={selectedRoom.rentPrice?.toLocaleString('vi-VN') || '0'}
              address={selectedRoom.location?.addressText || ''}
              roomCode={selectedRoom.roomNumber}
              area={selectedRoom.area}
              maxOccupancy={selectedRoom.maxOccupancy}
              deposit={1}
            />

            <View style={styles.divider} />
            <ServiceFees
              servicePrices={selectedRoom.location?.servicePrices || []}
              servicePriceConfig={
                selectedRoom.location?.servicePriceConfig || {}
              }
              customServices={selectedRoom.customServices}
            />

            <View style={styles.divider} />
            <Amenities
              amenities={selectedRoom.amenities || []}
              furniture={selectedRoom.furniture || []}
            />

            <View style={styles.divider} />

            <View style={styles.divider} />
            <Description text={selectedRoom.description} />

            <View style={styles.divider} />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  statusBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StatusBar.currentHeight,
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
});
