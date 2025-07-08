import {StyleSheet, View, ScrollView} from 'react-native';
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
    return <LoadingState />;
  }

  if (error || !selectedRoom) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  return (
    <View style={styles.container}>
      <Header onGoBack={() => navigation.goBack()} onEdit={handleNavigateToUpdate} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  scrollView: {
    flex: 1,
  },
});
