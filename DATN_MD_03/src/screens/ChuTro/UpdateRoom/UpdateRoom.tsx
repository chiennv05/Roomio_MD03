import {Alert, ScrollView, StyleSheet, View} from 'react-native';
import React from 'react';
import {Colors} from '../../../theme/color';
import {UIHeader} from '../MyRoom/components';
import {Icons} from '../../../assets/icons';
import {
  moderateScale,
  responsiveSpacing,
  SCREEN,
} from '../../../utils/responsive';
import ItemButtonConfirm from '../../LoginAndRegister/components/ItemButtonConfirm';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../../../store';
import {updateLandlordRoom} from '../../../store/slices/landlordRoomsSlice';
import {validateRoomForm} from '../AddRoom/utils/validateFromData';
import {Room} from '../../../types';
import {useRoomData} from './hooks';
import {
  FormRoom,
  ImageSection,
  ServiceSection,
  AmenitiesAndFurnitureSection,
} from './components';

type UpdateRoomRouteProp = {
  params: {
    item: Room;
  };
};

export default function UpdateRoom() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<any>() as UpdateRoomRouteProp;
  const {item} = route.params;
  const dispatch = useDispatch<AppDispatch>();

  // Sử dụng hook useRoomData để quản lý state
  const {
    roomNumber,
    setRoomNumber,
    area,
    setArea,
    addressText,
    setAddressText,
    description,
    setDescription,
    maxOccupancy,
    setMaxOccupancy,
    amenities,
    setAmenities,
    furniture,
    setFurniture,
    image,
    setImage,
    rentPrice,
    setRentPrice,
    imageArr,
    setImageArr,
    coordinates,
    setCoordinates,
    servicePrices,
    setServicePrices,
    servicePriceConfig,
    setServicePriceConfig,
    customServices,
    setCustomServices,
    serviceOptionList,
    setServiceOptionList,
  } = useRoomData(item);

  const handleUpdateRoom = async () => {
    const result = validateRoomForm({
      roomNumber,
      area,
      addressText,
      maxOccupancy,
      imageArr,
      serviceOptionList,
    });

    if (!result.valid) {
      Alert.alert('Lỗi', result.message);
      return;
    }

    if (!coordinates) {
      Alert.alert('Thiếu tọa độ', 'Vui lòng chọn vị trí trên bản đồ.');
      return;
    }

    // Phân tích địa chỉ để lấy thông tin chi tiết
    const addressParts = addressText.split(',').map(part => part.trim());
    let province = 'Hà Nội';
    let district = '';
    let ward = '';
    let street = '';
    let houseNo = '';

    // Nếu có đủ thông tin, phân tích từ địa chỉ đã nhập
    if (addressParts.length >= 3) {
      houseNo = addressParts[0]; // Số nhà
      street = addressParts[1]; // Tên đường
      ward = addressParts[2]; // Phường/xã
      
      if (addressParts.length >= 4) {
        district = addressParts[3]; // Quận/huyện
      }
      
      if (addressParts.length >= 5) {
        province = addressParts[4]; // Tỉnh/thành
      }
    }

    const updatedRoom: Room = {
      roomNumber: roomNumber,
      area: Number(area),
      rentPrice: Number(rentPrice),
      maxOccupancy: Number(maxOccupancy),
      description: description,
      photos: imageArr,
      location: {
        addressText: addressText,
        province: province,
        district: district,
        ward: ward,
        street: street,
        houseNo: houseNo,
        coordinates: {
          type: 'Point',
          coordinates: coordinates,
        },
        servicePrices: servicePrices,
        servicePriceConfig: servicePriceConfig,
      },
      customServices: customServices,
      amenities: amenities,
      furniture: furniture,
    };

    try {
      const res = await dispatch(updateLandlordRoom({roomId: item._id || '', room: updatedRoom}));
      console.log('Payload gửi:', JSON.stringify(updatedRoom, null, 2));
      if (updateLandlordRoom.fulfilled.match(res)) {
        Alert.alert('Thành công', 'Cập nhật phòng trọ thành công!');
        navigation.goBack();
      } else if (updateLandlordRoom.rejected.match(res)) {
        const message =
          typeof res.payload === 'object' &&
          res.payload !== null &&
          'message' in res.payload
            ? (res.payload as any).message
            : 'Có lỗi xảy ra';
        Alert.alert('Thất bại', message);
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
    }
  };

  const onPressOpenMap = () => {
    navigation.navigate('MapScreen', {
      latitude: coordinates ? coordinates[1] : undefined,
      longitude: coordinates ? coordinates[0] : undefined,
      address: addressText,
    });
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}>
      <UIHeader
        title="Cập nhật phòng"
        onPressLeft={() => navigation.goBack()}
        iconLeft={Icons.IconArrowLeft}
      />
      <View style={styles.content}>
        {/* Form thông tin phòng */}
        <FormRoom
          roomNumber={roomNumber}
          setRoomNumber={setRoomNumber}
          area={area}
          setArea={setArea}
          addressText={addressText}
          setAddressText={setAddressText}
          description={description}
          setDescription={setDescription}
          maxOccupancy={maxOccupancy}
          setMaxOccupancy={setMaxOccupancy}
          rentPrice={rentPrice}
          setRentPrice={setRentPrice}
          onPressOpenMap={onPressOpenMap}
          height={moderateScale(100)}
          borderRadius={10}
        />

        {/* Phần hình ảnh */}
        <ImageSection
          image={image}
          setImage={setImage}
          imageArr={imageArr}
          setImageArr={setImageArr}
        />

        {/* Phần dịch vụ */}
        <ServiceSection
          serviceOptionList={serviceOptionList}
          setServiceOptionList={setServiceOptionList}
          servicePrices={servicePrices}
          setServicePrices={setServicePrices}
          servicePriceConfig={servicePriceConfig}
          setServicePriceConfig={setServicePriceConfig}
          customServices={customServices}
          setCustomServices={setCustomServices}
        />

        {/* Phần tiện nghi và nội thất */}
        <AmenitiesAndFurnitureSection
          amenities={amenities}
          setAmenities={setAmenities}
          furniture={furniture}
          setFurniture={setFurniture}
        />

        {/* Nút cập nhật */}
        <View style={styles.containerButton}>
          <ItemButtonConfirm
            onPress={handleUpdateRoom}
            title="Cập nhật phòng"
            icon={Icons.IconEditBlack}
            onPressIcon={() => {}}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingBottom: responsiveSpacing(20),
  },
  contentContainer: {
    flexGrow: 1, // cần thiết để justifyContent hoạt động
    alignItems: 'center',
  },
  content: {
    width: SCREEN.width * 0.9,
    paddingTop: 10,
  },
  containerButton: {
    marginVertical: 10,
  },
});
