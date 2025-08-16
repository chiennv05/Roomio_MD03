import {
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
import LocationModal, {
  SelectedAddressNew,
} from '../AddRoom/components/LocationModal';
import {CustomService} from '../../../types';
import {useCustomAlert} from '../../../hooks/useCustomAlrert';
import CustomAlertModal from '../../../components/CustomAlertModal';
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

  const {
    alertConfig,
    visible,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showConfirm,
  } = useCustomAlert();

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
        showError('Không thể tải ảnh lên, vui lòng thử lại sau', 'Lỗi');
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
      showError('Không thể tải ảnh lên: ' + (e as Error).message, 'Lỗi');
    } finally {
      setVisibleImage(false);
      setIsUploading(false);
    }
  };

  const onDeleteImage = (fileName: string) => {
    showConfirm(
      'Bạn có chắc chắn muốn xoá ảnh này không?',
      async () => {
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
      'Xác nhận xoá',
    );
  };

  const pickImages = () => {
    const remainingSlots = 15 - image.length;
    if (remainingSlots <= 0) {
      showAlert({
        title: 'Thông báo',
        message: 'Bạn đã chọn tối đa 15 ảnh.',
        type: 'info',
        buttons: [{text: 'OK', onPress: hideAlert}],
      });
      return;
    }

    const cameraAction = () => {
      ImagePicker.openCamera({
        width: 1200,
        height: 800,
        cropping: true,
        multiple: false,
        mediaType: 'photo',
      })
        .then((image: any) => {
          if (Array.isArray(image)) {
            const imageFiles: ImageFile[] = image.map((img: any) => ({
              path: img.path,
              mime: img.mime || 'image/jpeg',
              filename: img.path.split('/').pop() || `camera_${Date.now()}.jpg`,
            }));
            onUpload(imageFiles);
          } else {
            const imageFile: ImageFile = {
              path: image.path,
              mime: image.mime || 'image/jpeg',
              filename:
                image.path.split('/').pop() || `camera_${Date.now()}.jpg`,
            };
            onUpload([imageFile]);
          }
        })
        .catch(e => {
          if (e.code !== 'E_PICKER_CANCELLED') {
            showAlert({
              title: 'Thông báo',
              message: 'Không thể truy cập máy ảnh',
              type: 'error',
              buttons: [{text: 'OK', onPress: hideAlert}],
            });
          }
        });
    };

    const galleryAction = () => {
      ImagePicker.openPicker({
        width: 1200,
        height: 800,
        cropping: true,
        multiple: true,
        maxFiles: remainingSlots,
        mediaType: 'photo',
      })
        .then((result: any) => {
          if (Array.isArray(result)) {
            const imageFiles: ImageFile[] = result.map((img: any) => ({
              path: img.path,
              mime: img.mime || 'image/jpeg',
              filename:
                img.path.split('/').pop() || `gallery_${Date.now()}.jpg`,
            }));
            onUpload(imageFiles);
          } else {
            const imageFile: ImageFile = {
              path: result.path,
              mime: result.mime || 'image/jpeg',
              filename:
                result.path.split('/').pop() || `gallery_${Date.now()}.jpg`,
            };
            onUpload([imageFile]);
          }
        })
        .catch(e => {
          if (e.code !== 'E_PICKER_CANCELLED') {
            showAlert({
              title: 'Thông báo',
              message: 'Không thể truy cập thư viện',
              type: 'error',
              buttons: [{text: 'OK', onPress: hideAlert}],
            });
          }
        });
    };

    showAlert({
      title: 'Chọn ảnh',
      message: 'Bạn muốn chọn ảnh từ đâu?',
      type: 'info',
      buttons: [
        {text: 'Máy ảnh', onPress: cameraAction},
        {text: 'Thư viện', onPress: galleryAction},
        {text: 'Hủy', onPress: hideAlert, style: 'cancel'},
      ],
    });
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
    if (!item) {
      return;
    }

    console.log('item', item);

    const isTemplateKhac = item.value === 'khac';
    const isNew = isTemplateKhac || item.id === undefined || item.id === 3;

    const itemWithId: ItemSeviceOptions = {
      ...item,
      id: isNew
        ? serviceOptionList.length > 0
          ? Math.max(...serviceOptionList.map(i => i.id ?? 0)) + 1
          : 1
        : item.id!,
    };

    if (itemWithId.category === 'required') {
      // *** SỬA CHÍNH TẠI ĐÂY ***
      if (itemWithId.value === 'electricity') {
        console.log('Setting electricity price:', itemWithId.price);
        setServicePrices(prev => ({
          ...prev,
          electricity: itemWithId.price ?? 0,
        }));
        setServicePriceConfig(prev => ({
          ...prev,
          electricity: itemWithId.priceType ?? 'perRoom',
        }));
      } else if (itemWithId.value === 'water') {
        console.log('Setting water price:', itemWithId.price);
        setServicePrices(prev => ({...prev, water: itemWithId.price ?? 0}));
        setServicePriceConfig(prev => ({
          ...prev,
          water: itemWithId.priceType ?? 'perRoom',
        }));
      }

      // Cập nhật serviceOptionList để hiển thị giá
      setServiceOptionList(prev =>
        prev.map(i => (i.id === itemWithId.id ? {...i, ...itemWithId} : i)),
      );
    } else {
      // Logic cho custom services...
      if (isNew) {
        setServiceOptionList(prev => [...prev, itemWithId]);
      } else {
        setServiceOptionList(prev =>
          prev.map(i => (i.id === itemWithId.id ? {...i, ...itemWithId} : i)),
        );
      }

      const customService: CustomService = {
        name: itemWithId.label,
        price: itemWithId.price ?? 0,
        priceType: itemWithId.priceType ?? 'perRoom',
        description: itemWithId.description ?? '',
      };

      setCustomServices(prev => {
        const existingIndex = prev.findIndex(
          i => i.name === customService.name,
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = customService;
          return updated;
        } else {
          return [...prev, customService];
        }
      });
    }

    setModalVisibleService(false);
    setItemServiceEdit(undefined);
  };

  // Thêm hàm xử lý xóa dịch vụ
  const handleDeleteService = (item: ItemSeviceOptions) => {
    if (!item) {
      return;
    }

    showConfirm(
      `Bạn có chắc chắn muốn xóa dịch vụ "${item.label}" không?`,
      () => {
        setServiceOptionList(prev =>
          prev.filter(service => service.value !== item.value),
        );
      },
      'Xác nhận xóa',
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

  const handleSelectLocation = (item: SelectedAddressNew) => {
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
    // Validation
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
      showError(result.message || 'Có lỗi xảy ra', 'Lỗi');
      return;
    }

    if (!coordinates) {
      showError('Vui lòng chọn vị trí trên bản đồ.', 'Thiếu tọa độ');
      return;
    }

    // *** SỬA CHÍNH: Đảm bảo servicePrices được cập nhật đúng ***
    const finalServicePrices = {
      electricity: servicePrices.electricity || 0,
      water: servicePrices.water || 0,
    };

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

    try {
      // Ensure we have a valid roomId
      if (!item._id) {
        showError('Không tìm thấy ID phòng trọ', 'Lỗi');
        return;
      }

      const res = await dispatch(
        updateLandlordRoom({
          roomId: item._id as string,
          room: updatedRoom,
        }),
      );

      if (updateLandlordRoom.fulfilled.match(res)) {
        showSuccess('Cập nhật phòng trọ thành công!', 'Thành công');
        navigation.goBack();
      } else if (updateLandlordRoom.rejected.match(res)) {
        const message =
          res.payload && typeof res.payload === 'string'
            ? res.payload
            : 'Có lỗi xảy ra khi cập nhật phòng';
        showError(message, 'Thất bại');
      }
    } catch (err) {
      console.error('Update room catch error:', err);
      showError('Không thể kết nối đến máy chủ', 'Lỗi');
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

      {/* Custom Alert Modal */}
      <CustomAlertModal
        visible={visible}
        title={alertConfig?.title || 'Thông báo'}
        message={alertConfig?.message || ''}
        type={alertConfig?.type || 'info'}
        onClose={hideAlert}
        buttons={alertConfig?.buttons}
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
