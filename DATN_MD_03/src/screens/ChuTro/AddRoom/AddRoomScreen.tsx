import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../../../store';
import {Colors} from '../../../theme/color';
import {ItemInput, UIHeader} from '../MyRoom/components';
import {Icons} from '../../../assets/icons';
import {
  moderateScale,
  responsiveFont,
  responsiveSpacing,
  SCREEN,
  verticalScale,
} from '../../../utils/responsive';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';
import {createLandlordRoom} from '../../../store/slices/landlordRoomsSlice';
import ItemTitle from './components/ItemTitle ';
import ItemImage from './components/ItemImage';
import ItemService from './components/ItemService';
import {FlatList} from 'react-native';
import {furnitureOptions} from './utils/furnitureOptions';
import ItemOptions from './components/ItemOptions';
import {amenitiesOptions} from './utils/amenitiesOptions';
import {OptionItem} from '../../../types/Options';
import ItemButtonConfirm from '../../LoginAndRegister/components/ItemButtonConfirm';
import ImagePicker from 'react-native-image-crop-picker';
import {
  deleteRoomPhoto,
  ImageFile,
  uploadRoomPhotos,
} from '../../../store/services/uploadService';
import {ImageUploadResult} from '../../../types/ImageUploadResult';
import ModalLoading from './components/ModalLoading';
import {formatPhotoUrls} from './utils/fomatImageUrl';
import {ItemSeviceOptions, SeviceOptions} from './utils/seviceOptions';
import {
  CustomService,
  Room,
  ServicePriceConfig,
  ServicePrices,
} from '../../../types';
import ModalService from './components/ModalService';
import {validateRoomForm} from './utils/validateFromData';
import LocationModal, {SelectedAddressNew} from './components/LocationModal';
import {useCustomAlert} from '../../../hooks/useCustomAlrert';
import {CustomAlertModal} from '../../../components';
import {
  clearFormDataFromStorage,
  getFormDataFromStorage,
  saveFormDataToStorage,
} from './utils/asyncStorageUtils';

type AddRoomNavigationProp = StackNavigationProp<RootStackParamList>;

export default function AddRoomScreen() {
  const navigation = useNavigation<AddRoomNavigationProp>();
  const route = useRoute();
  const dispatch = useDispatch<AppDispatch>();
  const {
    alertConfig,
    visible: alertVisible,
    showSuccess,
    showError,
    showConfirm,
    hideAlert,
  } = useCustomAlert();

  const [roomNumber, setRoomNumber] = useState('');
  const [area, setArea] = useState<number | ''>();
  const [addressText, setAddressText] = useState('');
  const [description, setDescription] = useState('');
  const [maxOccupancy, setMaxOccupancy] = useState<number | ''>();
  const [amenities, setAmenities] = useState<string[]>([]);
  const [furniture, setFurniture] = useState<string[]>([]);
  const [image, setImage] = useState<ImageUploadResult[]>([]);
  const [rentPrice, setRentPrice] = useState<number | ''>();
  const [displayRentPrice, setDisplayRentPrice] = useState('');
  const [imageArr, setImageArr] = useState<string[]>([]);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

  const [visibleLocationModal, setVisibleLocationModal] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [street, setStreet] = useState('');
  const [houseNo, setHouseNo] = useState('');

  // modal
  const [isUploading, setIsUploading] = useState(false);
  const [visibleImage, setVisibleImage] = useState(false);
  const [selectImage, setSelectImage] = useState<string>('');
  // service
  const [serviceOptionList, setServiceOptionList] =
    useState<ItemSeviceOptions[]>(SeviceOptions);

  const [modalVisibleService, setModalVisibleService] = useState(false);
  const [servicePrices, setServicePrices] = useState<ServicePrices>({
    electricity: 0, // Có thể để 0 nhưng cần check khi gửi API
    water: 0,
  });

  const [servicePriceConfig, setServicePriceConfig] =
    useState<ServicePriceConfig>({
      electricity: 'perUsage',
      water: 'perUsage',
    });

  const [customServices, setCustomServices] = useState<CustomService[]>([]);
  const [itemServiceEdit, setItemServiceEdit] = useState<
    ItemSeviceOptions | undefined
  >();

  useEffect(() => {
    const loadFormData = async () => {
      try {
        setIsUploading(true);
        const savedData = await getFormDataFromStorage();

        if (savedData) {
          setRoomNumber(savedData.roomNumber);
          setArea(savedData.area);
          setAddressText(savedData.addressText);
          setDescription(savedData.description);
          setMaxOccupancy(savedData.maxOccupancy);
          setAmenities(savedData.amenities);
          setFurniture(savedData.furniture);
          setImage(savedData.image);
          setRentPrice(savedData.rentPrice);
          setDisplayRentPrice(savedData.displayRentPrice);
          setImageArr(savedData.imageArr);
          setCoordinates(savedData.coordinates);
          setAddress(savedData.address);
          setProvince(savedData.province);
          setDistrict(savedData.district);
          setWard(savedData.ward);
          setStreet(savedData.street);
          setHouseNo(savedData.houseNo);
          setServiceOptionList(savedData.serviceOptionList);
          setServicePrices(savedData.servicePrices);
          setServicePriceConfig(savedData.servicePriceConfig);
          setCustomServices(savedData.customServices);
        }
      } catch (e) {
      } finally {
        setIsUploading(false);
      }
    };
    loadFormData();

    // Load dữ liệu từ params (nếu có)
    const params = (route as any).params;
    if (params?.location) {
      const {address: addressTextParam, latitude, longitude} = params.location;
      if (addressTextParam) {
        setAddressText(addressTextParam);
      }
      if (latitude && longitude) {
        setCoordinates([longitude, latitude]);
      }
    }
  }, [route]);

  // thêm ảnh
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
          hideAlert();
        } catch (error) {
          showError('Xoá ảnh thất bại', 'Lỗi');
        }
      },
      'Xác nhận xoá',
    );
  };

  // Hàm chọn ảnh từ thư viện hoặc máy ảnh
  const pickImages = () => {
    const remainingSlots = 15 - image.length;
    if (remainingSlots <= 0) {
      showError('Bạn đã chọn tối đa 15 ảnh.', 'Thông báo');
      return;
    }

    showConfirm(
      'Bạn muốn chọn ảnh từ đâu?',
      () => {}, // onConfirm để trống vì sẽ dùng customButtons
      'Chọn ảnh',
      [
        {
          text: 'Máy ảnh',
          onPress: () => {
            if (image.length >= 15) {
              showError('Bạn đã chọn tối đa 15 ảnh.', 'Thông báo');
              return;
            }
            ImagePicker.openCamera({
              width: 1000,
              height: 1000,
              cropping: true,
              includeBase64: false,
              includeExif: false,
            })
              .then(imageResult => {
                if (!imageResult.path || !imageResult.mime) {
                  showError('Không thể lấy thông tin ảnh', 'Lỗi');
                  return;
                }
                const imageFile: ImageFile = {
                  path: imageResult.path,
                  mime: imageResult.mime,
                  filename:
                    imageResult.path.split('/').pop() ||
                    `camera_${Date.now()}.jpg`,
                };
                hideAlert();
                onUpload([imageFile]);
              })
              .catch(e => {
                if (e.code !== 'E_PICKER_CANCELLED') {
                  showError(
                    'Không thể truy cập máy ảnh, vui lòng kiểm tra quyền truy cập',
                    'Thông báo',
                  );
                }
              });
          },
          style: 'default',
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

                if (images.length > remainingSlots) {
                  showError(
                    `Bạn chỉ có thể chọn thêm tối đa ${remainingSlots} ảnh.`,
                    'Thông báo',
                  );
                  return;
                }

                const imageFiles: ImageFile[] = images.map(img => {
                  if (!img.path || !img.mime) {
                    throw new Error('Ảnh không hợp lệ');
                  }
                  return {
                    path: img.path,
                    mime: img.mime,
                    filename:
                      img.path.split('/').pop() || `gallery_${Date.now()}.jpg`,
                  };
                });

                if (imageFiles.length > 0) {
                  hideAlert();
                  onUpload(imageFiles);
                } else {
                  showError('Không có ảnh nào được chọn', 'Thông báo');
                }
              })
              .catch(e => {
                if (e.code !== 'E_PICKER_CANCELLED') {
                  showError(
                    'Không thể truy cập thư viện, vui lòng kiểm tra quyền truy cập',
                    'Thông báo',
                  );
                }
              });
          },
          style: 'default',
        },
        {
          text: 'Hủy',
          onPress: hideAlert,
          style: 'cancel',
        },
      ],
    );
  };

  const onclickItemImage = (filename: string) => {
    setSelectImage(filename);
    setVisibleImage(true);
  };
  // dịch vụ
  const handleClickItem = (item: ItemSeviceOptions) => {
    setItemServiceEdit(item);
    setModalVisibleService(true);
  };

  const handleClickItemOptionAmenities = useCallback((item: OptionItem) => {
    setAmenities(prev =>
      prev.includes(item.value)
        ? prev.filter(i => i !== item.value)
        : [...prev, item.value],
    );
  }, []);

  const handleClickItemOptionFurniture = useCallback((item: OptionItem) => {
    setFurniture(prev =>
      prev.includes(item.value)
        ? prev.filter(i => i !== item.value)
        : [...prev, item.value],
    );
  }, []);

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

  // visible
  const onCloseVisibe = () => {
    setVisibleImage(false);
    setSelectImage('');
  };

  //modal add
  const handleSaveModal = (item: ItemSeviceOptions) => {
    if (!item) {
      return;
    }

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
  const handleDeleteService = (item: ItemSeviceOptions) => {
    if (!item) {
      return;
    }

    showConfirm(
      `Bạn có chắc chắn muốn xóa dịch vụ "${item.label}" không?`,
      () => {
        try {
          if (item.category === 'required') {
            if (item.value === 'electricity') {
              setServicePrices(prev => ({
                ...prev,
                electricity: 0,
              }));
              setServicePriceConfig(prev => ({
                ...prev,
                electricity: 'perUsage',
              }));
            } else if (item.value === 'water') {
              setServicePrices(prev => ({
                ...prev,
                water: 0,
              }));
              setServicePriceConfig(prev => ({
                ...prev,
                water: 'perUsage',
              }));
            }

            setServiceOptionList(prev =>
              prev.map(i => {
                if (i.id === item.id) {
                  return {
                    ...i,
                    price: undefined,
                    priceType: undefined,
                    description: undefined,
                    status: false,
                  };
                }
                return i;
              }),
            );
            hideAlert;
          } else {
            setServiceOptionList(prev => prev.filter(i => i.id !== item.id));

            setCustomServices(prev =>
              prev.filter(service => service.name !== item.label),
            );
          }

          setModalVisibleService(false);
          setItemServiceEdit(undefined);
          hideAlert();
        } catch (error) {
          showError('Không thể xóa dịch vụ. Vui lòng thử lại.', 'Lỗi');
        }
      },
      'Xác nhận xóa',
    );
  };
  const handleCancelModal = () => {
    setModalVisibleService(false);
  };

  const handleCreatePost = async () => {
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
      showError(result.message || 'Vui lòng điền đầy đủ thông tin', 'Lỗi');
      return;
    }

    if (!coordinates) {
      showError('Vui lòng chọn vị trí trên bản đồ.', 'Thiếu tọa độ');
      return;
    }

    const finalServicePrices = {
      electricity: servicePrices.electricity || 0,
      water: servicePrices.water || 0,
    };

    const room: Room = {
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
        servicePrices: finalServicePrices,
        servicePriceConfig: servicePriceConfig,
      },
      customServices: customServices,
      amenities: amenities,
      furniture: furniture,
    };

    try {
      const res = await dispatch(createLandlordRoom(room));
      if (createLandlordRoom.fulfilled.match(res)) {
        showSuccess('Tạo phòng trọ thành công!', 'Thành công');
        clearForm();
        await clearFormDataFromStorage();
        navigation.goBack();
      } else if (createLandlordRoom.rejected.match(res)) {
        const message =
          typeof res.payload === 'object' &&
          res.payload !== null &&
          'message' in res.payload
            ? (res.payload as any).message
            : 'Có lỗi xảy ra';
        showError(message, 'Thất bại');
      }
    } catch (err) {
      showError('Không thể kết nối đến máy chủ', 'Lỗi');
    }
  };
  const clearForm = () => {
    setRoomNumber('');
    setArea('');
    setRentPrice('');
    setMaxOccupancy('');
    setDescription('');
    setAddressText('');
    setCoordinates(null);
    setImage([]);
    setImageArr([]);
    setAmenities([]);
    setFurniture([]);
    setServiceOptionList(SeviceOptions);
    setServicePrices({electricity: 0, water: 0});
    setServicePriceConfig({electricity: 'perUsage', water: 'perUsage'});
    setCustomServices([]);
  };

  const handleCancel = () => {
    showConfirm(
      'Bạn có muốn xóa tất cả dữ liệu trong biểu mẫu không?',
      () => {},
      'Xác nhận hủy',
      [
        {
          text: 'Xóa dữ liệu',
          onPress: async () => {
            try {
              await clearFormDataFromStorage();
              image.map(item => deleteRoomPhoto(item.fileName));

              clearForm();
              hideAlert();
            } catch (e) {
              showError('Không thể xóa dữ liệu tạm thời', 'Lỗi');
            }
          },
          style: 'destructive',
        },
        {
          text: 'Hủy',
          onPress: hideAlert,
          style: 'cancel',
        },
      ],
    );
  };

  const onPressOnpenMap = () => {
    navigation.navigate('MapScreen', {
      isSelectMode: true,
      onSelectLocation: (location: any) => {
        setAddressText(location.address);
        setCoordinates([location.longitude, location.latitude]);
      },
    });
  };
  // mở hàm lấy danh sách tỉnh thành
  const handleOpenLocationModal = () => {
    setVisibleLocationModal(true);
  };
  const onClose = () => {
    setVisibleLocationModal(false);
  };
  const handleSelectLocation = (item: SelectedAddressNew) => {
    const fullProvinceName = item.province?.name || '';
    const districtName = item.district?.name || '';
    const wardName = item.ward?.name || '';
    const provinceName = fullProvinceName.replace(/^Tỉnh\s|^Thành phố\s/i, '');
    // Ghép địa chỉ đầy đủ
    const fullAddress = [provinceName, districtName, wardName]
      .filter(Boolean)
      .join(', ');
    setAddress(fullAddress);

    setProvince(provinceName);
    setDistrict(districtName);
    setWard(wardName);
    // Nếu bạn có thêm: setFullAddress(fullAddress); thì lưu luôn chuỗi
    onClose();
  };
  const handleGoBack = () => {
    showConfirm(
      'Bạn có muốn lưu dữ liệu tạm thời trước khi thoát?',
      () => {},
      'Xác nhận hủy',
      [
        {
          text: 'Lưu và Thoát',
          onPress: async () => {
            try {
              await saveFormDataToStorage({
                roomNumber,
                area: Number(area),
                addressText,
                description,
                maxOccupancy: Number(maxOccupancy),
                amenities,
                furniture,
                image,
                rentPrice: Number(rentPrice),
                displayRentPrice,
                imageArr,
                coordinates,
                address,
                province,
                district,
                ward,
                street,
                houseNo,
                serviceOptionList,
                servicePrices,
                servicePriceConfig,
                customServices,
              });
              clearForm();
              hideAlert();
              navigation.goBack();
            } catch (e) {
              showError('Không thể lưu dữ liệu tạm thời', 'Lỗi');
            }
          },
          style: 'default',
        },
        {
          text: 'Thoát mà không lưu',
          onPress: async () => {
            try {
              await clearFormDataFromStorage();
              clearForm();
              hideAlert();
              navigation.goBack();
            } catch (e) {
              showError('Không thể xóa dữ liệu tạm thời', 'Lỗi');
            }
          },
          style: 'destructive',
        },
        {
          text: 'Hủy',
          onPress: hideAlert,
          style: 'cancel',
        },
      ],
    );
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
          title="Tạo bài đăng"
          onPressLeft={handleGoBack}
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
            value={address}
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
            onPressIcon={onPressOnpenMap}
            editable={!!coordinates}
            height={verticalScale(50)}
          />
          {!coordinates ? (
            <Text style={styles.helperText}>
              * Vui lòng nhấn vào biểu tượng bản đồ để chọn vị trí trước
            </Text>
          ) : (
            <Text style={styles.successText}>
              Bạn có thể chỉnh sửa địa chỉ chi tiết
            </Text>
          )}
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
              <Text>
                Chưa có ảnh nào được chọn . Nhấn vào biểu tượng thêm để chọn ảnh
              </Text>
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
              onPress={handleCreatePost}
              title="Tạo bài đăng"
              icon={Icons.IconDelete}
              onPressIcon={handleCancel}
            />
          </View>
        </View>
      </ScrollView>
      <ModalLoading
        visible={visibleImage}
        loading={isUploading}
        image={selectImage}
        onPressVisible={onCloseVisibe}
      />
      <ModalService
        visible={modalVisibleService}
        handleSave={handleSaveModal}
        item={itemServiceEdit}
        handleCancel={handleCancelModal}
        handleDelete={handleDeleteService}
      />
      <LocationModal
        visible={visibleLocationModal}
        onClose={onClose}
        onSelect={handleSelectLocation}
      />
      {alertConfig && (
        <CustomAlertModal
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={hideAlert}
          type={alertConfig.type}
          buttons={alertConfig.buttons}
        />
      )}
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
    flexGrow: 1, // cần thiết để justifyContent hoạt động
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
  helperText: {
    fontSize: responsiveFont(12),
    color: 'gray',
    marginTop: 4,
    marginBottom: 8,
  },
  successText: {
    fontSize: responsiveFont(12),
    color: 'green',
    marginTop: 4,
    marginBottom: 8,
  },
});
