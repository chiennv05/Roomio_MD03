import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  SafeAreaView,
  Text,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {Colors} from '../../../theme/color';
import {UIHeader, ItemInput} from '../MyRoom/components';
import {Icons} from '../../../assets/icons';
import {
  moderateScale,
  responsiveSpacing,
  SCREEN,
  verticalScale,
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
import {FlatList} from 'react-native';
import {furnitureOptions} from '../AddRoom/utils/furnitureOptions';
import {amenitiesOptions} from '../AddRoom/utils/amenitiesOptions';
import {OptionItem} from '../../../types/Options';
import ItemTitle from '../AddRoom/components/ItemTitle ';
import ItemImage from '../AddRoom/components/ItemImage';
import ItemService from '../AddRoom/components/ItemService';
import ItemOptions from '../AddRoom/components/ItemOptions';
import ModalLoading from '../AddRoom/components/ModalLoading';
import ModalService from '../AddRoom/components/ModalService';
import LocationModal from '../AddRoom/components/LocationModal';
import {CustomService} from '../../../types';

import {SelectedAddress} from '../../../types/Address';
import ImagePicker from 'react-native-image-crop-picker';
import {
  deleteRoomPhoto,
  ImageFile,
  uploadRoomPhotos,
} from '../../../store/services/uploadService';
import {ImageUploadResult} from '../../../types/ImageUploadResult';
import {formatPhotoUrls} from '../AddRoom/utils/fomatImageUrl';
import {ItemSeviceOptions} from '../AddRoom/utils/seviceOptions';

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
  console.log('item room', item);
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

  // Additional states for UI
  const [displayRentPrice, setDisplayRentPrice] = useState(
    rentPrice ? rentPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '',
  );
  const [visibleLocationModal, setVisibleLocationModal] = useState(false);
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState(item.location?.province || '');
  const [district, setDistrict] = useState(item.location?.district || '');
  const [ward, setWard] = useState(item.location?.ward || '');
  const [street, setStreet] = useState(item.location?.street || '');
  const [houseNo, setHouseNo] = useState(item.location?.houseNo || '');

  // Modal states
  const [isUploading, setIsUploading] = useState(false);
  const [visibleImage, setVisibleImage] = useState(false);
  const [selectImage, setSelectImage] = useState<string>('');
  const [modalVisibleService, setModalVisibleService] = useState(false);
  const [itemServiceEdit, setItemServiceEdit] = useState<
    ItemSeviceOptions | undefined
  >();

  useEffect(() => {
    if (rentPrice) {
      const formatted = rentPrice
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      setDisplayRentPrice(formatted);
    } else {
      setDisplayRentPrice('');
    }
  }, [rentPrice]);
  // Image handling functions
  const onUpload = async (images: ImageFile[]) => {
    try {
      setIsUploading(true);
      setVisibleImage(true);
      const result = await uploadRoomPhotos(images);

      if (!result || !result.data || !result.data.photos) {
        Alert.alert('Lỗi', 'Không thể tải ảnh lên, vui lòng thử lại sau');
        return;
      }

      const uploaded = result.data.photos as ImageUploadResult[];

      setImage(prev => {
        const newImages = [...prev, ...uploaded];
        const formattedPhotos = formatPhotoUrls(newImages);
        setImageArr(formattedPhotos);
        return newImages;
      });
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể tải ảnh lên: ' + (e as Error).message);
    } finally {
      setVisibleImage(false);
      setIsUploading(false);
    }
  };

  const onDeleteImage = (fileName: string) => {
    Alert.alert(
      'Xác nhận xoá',
      'Bạn có chắc chắn muốn xoá ảnh này không?',
      [
        {
          text: 'Huỷ',
          style: 'cancel',
        },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRoomPhoto(fileName);
              setImage(prev => prev.filter(img => img.fileName !== fileName));
              setImageArr(prev =>
                prev.filter(img => {
                  const lastSegment = img.split('/').pop();
                  return lastSegment !== fileName;
                }),
              );
            } catch (error) {
              console.log('Xoá ảnh thất bại');
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  const pickImages = () => {
    const remainingSlots = 15 - image.length;
    if (remainingSlots <= 0) {
      Alert.alert('Thông báo', 'Bạn đã chọn tối đa 15 ảnh.');
      return;
    }

    Alert.alert('Chọn ảnh', 'Bạn muốn chọn ảnh từ đâu?', [
      {
        text: 'Máy ảnh',
        onPress: () => {
          ImagePicker.openCamera({
            width: 1000,
            height: 1000,
            cropping: true,
            includeBase64: false,
            includeExif: false,
          })
            .then(image => {
              const imageFile: ImageFile = {
                path: image.path,
                mime: image.mime,
                filename:
                  image.path.split('/').pop() || `camera_${Date.now()}.jpg`,
              };
              onUpload([imageFile]);
            })
            .catch(e => {
              if (e.code !== 'E_PICKER_CANCELLED') {
                Alert.alert('Thông báo', 'Không thể truy cập máy ảnh');
              }
            });
        },
      },
      {
        text: 'Thư viện',
        onPress: () => {
          ImagePicker.openPicker({
            multiple: true,
            maxFiles: Math.min(15, remainingSlots),
            mediaType: 'photo',
            includeBase64: false,
            includeExif: false,
          })
            .then(images => {
              if (!Array.isArray(images)) {
                images = [images];
              }

              const imageFiles: ImageFile[] = images.map(img => ({
                path: img.path,
                mime: img.mime,
                filename:
                  img.path.split('/').pop() || `gallery_${Date.now()}.jpg`,
              }));

              if (imageFiles.length > 0) {
                onUpload(imageFiles);
              }
            })
            .catch(e => {
              if (e.code !== 'E_PICKER_CANCELLED') {
                Alert.alert('Thông báo', 'Không thể truy cập thư viện');
              }
            });
        },
      },
      {text: 'Hủy', style: 'cancel'},
    ]);
  };

  const onclickItemImage = (filename: string) => {
    setSelectImage(filename);
    setVisibleImage(true);
  };

  // Service handling
  const handleClickItem = (item: ItemSeviceOptions) => {
    setItemServiceEdit(item);
    setModalVisibleService(true);
  };

  const handleSaveModal = (item: ItemSeviceOptions) => {
    if (!item) return;

    // *** SỬA: Logic xác định item mới đúng hơn ***
    const existingItem = serviceOptionList.find(
      service => service.id === item.id,
    );
    const isEditingExisting = existingItem !== undefined;

    // Item chỉ được coi là mới khi:
    // 1. Đang chỉnh sửa template "khác" (value === 'khac')
    // 2. Hoặc không có ID (item mới hoàn toàn)
    const isCreatingNew = item.value === 'khac' || !isEditingExisting;

    const itemWithId: ItemSeviceOptions = {
      ...item,
      id: isCreatingNew
        ? serviceOptionList.length > 0
          ? Math.max(...serviceOptionList.map(i => i.id ?? 0)) + 1
          : 1
        : item.id!,
    };

    if (itemWithId.category === 'required') {
      // Xử lý dịch vụ bắt buộc (điện, nước)
      if (itemWithId.value === 'electricity') {
        setServicePrices(prev => ({
          ...prev,
          electricity: itemWithId.price ?? 0,
        }));
        setServicePriceConfig(prev => ({
          ...prev,
          electricity: itemWithId.priceType ?? 'perRoom',
        }));
      } else if (itemWithId.value === 'water') {
        setServicePrices(prev => ({...prev, water: itemWithId.price ?? 0}));
        setServicePriceConfig(prev => ({
          ...prev,
          water: itemWithId.priceType ?? 'perRoom',
        }));
      }

      // Cập nhật item trong serviceOptionList
      setServiceOptionList(prev =>
        prev.map(i => (i.id === itemWithId.id ? {...i, ...itemWithId} : i)),
      );
    } else {
      // Xử lý dịch vụ tùy chọn
      const customService: CustomService = {
        name: itemWithId.label,
        price: itemWithId.price ?? 0,
        priceType: itemWithId.priceType ?? 'perRoom',
        description: itemWithId.description ?? '',
      };

      if (isCreatingNew) {
        // Thêm mới
        setServiceOptionList(prev => [...prev, itemWithId]);
        setCustomServices(prev => [...prev, customService]);
      } else {
        // Cập nhật item có sẵn
        setServiceOptionList(prev =>
          prev.map(i => (i.id === itemWithId.id ? {...i, ...itemWithId} : i)),
        );

        // Cập nhật customServices dựa trên name cũ của item
        setCustomServices(prev => {
          const oldItemName = existingItem?.label || itemWithId.label;
          const existingIndex = prev.findIndex(i => i.name === oldItemName);

          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = customService;
            return updated;
          } else {
            return [...prev, customService];
          }
        });
      }
    }

    setModalVisibleService(false);
    setItemServiceEdit(undefined);
  };

  // Thêm hàm xử lý xóa dịch vụ
  const handleDeleteService = (item: ItemSeviceOptions) => {
    if (!item) return;

    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa dịch vụ "${item.label}" không?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            // Xóa khỏi serviceOptionList
            setServiceOptionList(prev => prev.filter(i => i.id !== item.id));

            // Xóa khỏi customServices nếu là dịch vụ tùy chọn
            if (item.category === 'optional') {
              setCustomServices(prev =>
                prev.filter(i => i.name !== item.label),
              );
            }

            // Đóng modal
            setModalVisibleService(false);
            setItemServiceEdit(undefined);
          },
        },
      ],
    );
  };

  // Options handling
  const handleClickItemOptionAmenities = useCallback(
    (items: OptionItem) => {
      setAmenities(prev =>
        prev.includes(items.value)
          ? prev.filter(i => i !== items.value)
          : [...prev, items.value],
      );
    },
    [setAmenities],
  );

  const handleClickItemOptionFurniture = useCallback(
    (items: OptionItem) => {
      setFurniture(prev =>
        prev.includes(items.value)
          ? prev.filter(i => i !== items.value)
          : [...prev, items.value],
      );
    },
    [setFurniture],
  );

  const renderAmenityItem = useCallback(
    ({item}: {item: OptionItem}) => (
      <ItemOptions
        item={item}
        onPress={handleClickItemOptionAmenities}
        selected={amenities.includes(item.value)}
      />
    ),
    [amenities, handleClickItemOptionAmenities],
  );

  const renderFurnitureItem = useCallback(
    ({item}: {item: OptionItem}) => (
      <ItemOptions
        item={item}
        onPress={handleClickItemOptionFurniture}
        selected={furniture.includes(item.value)}
      />
    ),
    [furniture, handleClickItemOptionFurniture],
  );

  // Location handling
  const handleOpenLocationModal = () => {
    setVisibleLocationModal(true);
  };

  const handleSelectLocation = (item: SelectedAddress) => {
    const fullProvinceName = item.province?.name || '';
    const districtName = item.district?.name || '';
    const wardName = item.ward?.name || '';
    const provinceName = fullProvinceName.replace(/^Tỉnh\s|^Thành phố\s/i, '');

    const fullAddress = [provinceName, districtName, wardName]
      .filter(Boolean)
      .join(', ');
    setAddress(fullAddress);

    setProvince(provinceName);
    setDistrict(districtName);
    setWard(wardName);
    setVisibleLocationModal(false);
  };

  const onPressOpenMap = () => {
    navigation.navigate('MapScreen', {
      latitude: coordinates ? coordinates[1] : undefined,
      longitude: coordinates ? coordinates[0] : undefined,
      address: addressText,
      isSelectMode: true,
      onSelectLocation: (location: any) => {
        setAddressText(location.address);
        setCoordinates([location.longitude, location.latitude]);
      },
    });
  };

  // Update room handler
  const handleUpdateRoom = async () => {
    const result = validateRoomForm({
      roomNumber,
      area,
      addressText,
      houseNo,
      street,
      ward,
      district,
      province,
      maxOccupancy,
      imageArr,
      serviceOptionList,
      description,
      rentPrice,
    });

    if (!result.valid) {
      Alert.alert('Lỗi', result.message);
      return;
    }

    if (!coordinates) {
      Alert.alert('Thiếu tọa độ', 'Vui lòng chọn vị trí trên bản đồ.');
      return;
    }

    // *** SỬA CHÍNH: Đảm bảo servicePrices được cập nhật đúng ***
    const finalServicePrices = {
      electricity: servicePrices.electricity || 0,
      water: servicePrices.water || 0,
    };

    console.log('Current servicePrices before update:', servicePrices);
    console.log('Final service prices:', finalServicePrices);
    console.log('Current customServices:', customServices);

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
        servicePrices: finalServicePrices, // *** SỬA: Dùng finalServicePrices ***
        servicePriceConfig: servicePriceConfig,
        customServices: customServices, // *** SỬA: Thêm customServices vào location ***
      },
      customServices: customServices, // Giữ lại cho backward compatibility
      amenities: amenities,
      furniture: furniture,
    };

    console.log('Updated room object:', JSON.stringify(updatedRoom, null, 2));

    try {
      const res = await dispatch(
        updateLandlordRoom({roomId: item._id || '', room: updatedRoom}),
      );

      if (updateLandlordRoom.fulfilled.match(res)) {
        Alert.alert('Thành công', 'Cập nhật phòng trọ thành công!');
        navigation.goBack();
      } else if (updateLandlordRoom.rejected.match(res)) {
        console.log('Update failed, payload:', res.payload);
        const message =
          typeof res.payload === 'string'
            ? res.payload
            : 'Có lỗi xảy ra khi cập nhật phòng';
        Alert.alert('Thất bại', message);
      }
    } catch (err) {
      console.error('Update room catch error:', err);
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
    }
  };

  // Modal handlers
  const onCloseVisible = () => {
    setVisibleImage(false);
    setSelectImage('');
  };

  const handleCancelModal = () => {
    setModalVisibleService(false);
  };

  const onClose = () => {
    setVisibleLocationModal(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.white}
        translucent={true}
      />
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
          <ItemTitle title="Thông tin bài đăng" />

          <View style={styles.containerInputRow}>
            <ItemInput
              placeholder="Số phòng"
              value={roomNumber}
              onChangeText={setRoomNumber}
              editable={true}
              width={SCREEN.width * 0.43}
            />
            <ItemInput
              placeholder="Diện tích"
              value={area?.toString() || ''}
              onChangeText={text => {
                const value = text.replace(/[^0-9]/g, '');
                setArea(value === '' ? '' : parseInt(value, 10));
              }}
              editable={true}
              keyboardType="numeric"
              width={SCREEN.width * 0.43}
            />
          </View>

          <ItemInput
            placeholder="Địa chỉ"
            value={
              address ||
              `${province}, ${district}, ${ward}`.replace(/^,\s*|,\s*$/g, '')
            }
            onChangeText={setAddress}
            editable={false}
            onPress={handleOpenLocationModal}
            height={verticalScale(50)}
          />

          <ItemInput
            placeholder="Đường (VD: Nguyễn Trãi)"
            value={street}
            onChangeText={setStreet}
            editable={true}
          />

          <ItemInput
            placeholder="Số nhà (VD: 123)"
            value={houseNo}
            onChangeText={setHouseNo}
            editable={true}
          />

          <ItemInput
            placeholder="Địa chỉ chi tiết"
            value={addressText}
            onChangeText={setAddressText}
            iconRight={Icons.IconMap}
            onPressIcon={onPressOpenMap}
            editable={true}
            height={verticalScale(50)}
          />

          <View style={styles.containerInputRow}>
            <ItemInput
              placeholder="Số người"
              value={maxOccupancy?.toString() || ''}
              onChangeText={text => {
                const value = text.replace(/[^0-9]/g, '');
                setMaxOccupancy(value === '' ? '' : parseInt(value, 10));
              }}
              editable={true}
              keyboardType="numeric"
              width={SCREEN.width * 0.43}
            />
            <ItemInput
              placeholder="Giá tiền"
              value={displayRentPrice}
              onChangeText={text => {
                const numeric = text.replace(/[^0-9]/g, '');
                setRentPrice(numeric === '' ? '' : parseInt(numeric, 10));
                const formatted = numeric.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                setDisplayRentPrice(formatted);
              }}
              editable={true}
              keyboardType="numeric"
              width={SCREEN.width * 0.43}
            />
          </View>

          <ItemInput
            placeholder="Mô tả"
            value={description}
            onChangeText={setDescription}
            editable={true}
            height={moderateScale(100)}
            borderRadius={10}
          />

          <ItemTitle
            title="Hình ảnh"
            icon={Icons.IconAdd}
            onPress={pickImages}
          />
          <View style={styles.containerImage}>
            {image.length === 0 ? (
              <Text>Chưa có ảnh nào được chọn</Text>
            ) : (
              <FlatList
                data={image}
                numColumns={3}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                keyExtractor={item => item.id}
                renderItem={({item, index}) => (
                  <ItemImage
                    key={index}
                    item={item}
                    onDeleteImage={onDeleteImage}
                    onClickItem={onclickItemImage}
                  />
                )}
              />
            )}
          </View>

          <ItemTitle title="Phí dịch vụ" />
          <View style={styles.containerImage}>
            <FlatList
              data={serviceOptionList}
              keyExtractor={(_, index) => index.toString()}
              numColumns={3}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              renderItem={({item}) => (
                <ItemService
                  status={item.status}
                  item={item}
                  onPress={handleClickItem}
                />
              )}
            />
          </View>

          <ItemTitle title="Tiện nghi" />
          <FlatList
            numColumns={2}
            scrollEnabled={false}
            data={amenitiesOptions}
            showsVerticalScrollIndicator={false}
            keyExtractor={item => item.value}
            renderItem={renderAmenityItem}
          />

          <ItemTitle title="Nội thất" />
          <FlatList
            numColumns={2}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            data={furnitureOptions}
            keyExtractor={item => item.value}
            renderItem={renderFurnitureItem}
          />

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

      <ModalLoading
        visible={visibleImage}
        loading={isUploading}
        image={selectImage}
        onPressVisible={onCloseVisible}
      />

      <ModalService
        visible={modalVisibleService}
        handleSave={handleSaveModal}
        item={itemServiceEdit}
        handleCancel={handleCancelModal}
        handleDelete={handleDeleteService} // Thêm prop này
      />

      <LocationModal
        visible={visibleLocationModal}
        onClose={onClose}
        onSelect={handleSelectLocation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: StatusBar.currentHeight || 0,
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center',
  },
  content: {
    width: SCREEN.width * 0.9,
    paddingTop: 10,
  },
  containerInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  containerImage: {
    width: SCREEN.width * 0.9,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  containerButton: {
    marginBottom: responsiveSpacing(50),
    marginTop: responsiveSpacing(20),
  },
});
