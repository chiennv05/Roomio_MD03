import {StyleSheet, View, ScrollView, StatusBar, Platform} from 'react-native';
import React from 'react';
import {useRoute} from '@react-navigation/native';
import {Colors} from '../../../theme/color';
import {useRoomDetail} from './hooks';
import {
  Header,
  ImageSlider,
  InfoSection,
  AddressSection,
  DescriptionSection,
  AmenitiesSection,
  FurnitureSection,
  ServiceSection,
  PriceHistorySection,
  LoadingState,
  ErrorState,
} from './components';

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

  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.container}>
        <View style={styles.statusBarBackground} />
        <Header
          onGoBack={() => navigation.goBack()}
          onEdit={handleNavigateToUpdate}
        />
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}>
          <ImageSlider photos={selectedRoom.photos || []} />
          <InfoSection room={selectedRoom} formatNumber={formatNumber} />
          <AddressSection addressText={selectedRoom.location?.addressText} />
          <DescriptionSection description={selectedRoom.description} />
          <AmenitiesSection amenities={selectedRoom.amenities} />
          <FurnitureSection furniture={selectedRoom.furniture} />
          <ServiceSection room={selectedRoom} formatNumber={formatNumber} />
          <PriceHistorySection
            priceHistory={selectedRoom.priceHistory}
            formatNumber={formatNumber}
          />
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
});
