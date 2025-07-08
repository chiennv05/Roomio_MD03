import {Alert, ScrollView, StyleSheet, Text, View, SafeAreaView, StatusBar} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../../../store';
import {Colors} from '../../../theme/color';
import {ItemInput, UIHeader} from '../MyRoom/components';
import {Icons} from '../../../assets/icons';
import {
  moderateScale,
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

type AddRoomNavigationProp = StackNavigationProp<RootStackParamList>;

export default function AddRoomScreen() {
  const navigation = useNavigation<AddRoomNavigationProp>();
  const route = useRoute();
  const dispatch = useDispatch<AppDispatch>();
  const [roomNumber, setRoomNumber] = useState('');
  const [area, setArea] = useState<number | ''>();
  const [addressText, setAddressText] = useState('');
  const [description, setDescription] = useState('');
  const [maxOccupancy, setMaxOccupancy] = useState<number | ''>();
  const [amenities, setAmenities] = useState<string[]>([]);
  const [furniture, setFurniture] = useState<string[]>([]);
  const [image, setImage] = useState<ImageUploadResult[]>([]);
  const [rentPrice, setRentPrice] = useState<number | ''>();
  const [imageArr, setImageArr] = useState<string[]>([]);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  // modal
  const [isUploading, setIsUploading] = useState(false);
  const [visibleImage, setVisibleImage] = useState(false);
  const [selectImage, setSelectImage] = useState<string>('');
  // service
  const [serviceOptionList, setServiceOptionList] =
    useState<ItemSeviceOptions[]>(SeviceOptions);

  const [modalVisibleService, setModalVisibleService] = useState(false);
  const [servicePrices, setServicePrices] = useState<ServicePrices>({
    electricity: 0,
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
    const params = (route as any).params;
    if (!params?.location) return;

    const {address, latitude, longitude} = params.location;
    if (address) setAddressText(address);
    if (latitude && longitude) {
      setCoordinates([longitude, latitude]);
    }
  }, [route]);

  // thêm ảnh
  const onUpload = async (images: ImageFile[]) => {
    try {
      setIsUploading(true);
      setVisibleImage(true);
      const result = await uploadRoomPhotos(images);
      console.log('Kết quả upload:', result);
      // Kiểm tra kết quả trả về có đúng định dạng không
      if (!result || !result.data || !result.data.photos) {
        console.error('Kết quả API không đúng định dạng mong đợi:', result);
        Alert.alert('Lỗi', 'Không thể tải ảnh lên, vui lòng thử lại sau');
        return;
      }
      const uploaded = result.data.photos as ImageUploadResult[];
      console.log('Uploaded photos:', uploaded);

      // Cập nhật state
      setImage(prev => {
        const newImages = [...prev, ...uploaded];
        console.log('New images state:', newImages);
        // Cập nhật imageArr sau khi cập nhật image
        const formattedPhotos = formatPhotoUrls(newImages);
        setImageArr(formattedPhotos);
        return newImages;
      });
    } catch (e) {
      console.error('Lỗi upload:', e);
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
            } catch (error) {
              console.log('Xoá ảnh thất bại');
            }
          },
        },
      ],
      {cancelable: true},
    );
  };
  // Hàm chọn ảnh từ thư viện hoặc máy ảnh
  const pickImages = () => {
    Alert.alert(
      'Chọn ảnh', 
      'Bạn muốn chọn ảnh từ đâu?', 
      [
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
              console.log('Ảnh từ máy ảnh:', image);
              // Kiểm tra dữ liệu trước khi tạo ImageFile
              if (!image.path || !image.mime) {
                Alert.alert('Lỗi', 'Không thể lấy thông tin ảnh');
                return;
              }
              const imageFile: ImageFile = {
                path: image.path,
                mime: image.mime,
                filename: image.path.split('/').pop() || `camera_${Date.now()}.jpg`,
              };
              console.log('ImageFile được tạo:', imageFile);
              onUpload([imageFile]);
            })
            .catch(e => {
              console.log('Lỗi camera:', e);
              if (e.code !== 'E_PICKER_CANCELLED') {
                Alert.alert('Thông báo', 'Không thể truy cập máy ảnh, vui lòng kiểm tra quyền truy cập');
              }
            });
          },
        },
        {
          text: 'Thư viện', 
          onPress: () => {
            ImagePicker.openPicker({
              multiple: true,
              maxFiles: 3,  // Giảm xuống 3 ảnh để giảm lỗi
              mediaType: 'photo',
              includeBase64: false,
              includeExif: false,
            })
            .then(images => {
              console.log('Ảnh từ thư viện:', images);
              // Đảm bảo images là một mảng
              if (!Array.isArray(images)) {
                images = [images];
              }
              const imageFiles: ImageFile[] = images.map(img => {
                // Kiểm tra từng thuộc tính
                if (!img.path || !img.mime) {
                  console.error('Ảnh không hợp lệ:', img);
                  throw new Error('Ảnh không hợp lệ');
                }
                return {
                  path: img.path,
                  mime: img.mime,
                  filename: img.path.split('/').pop() || `gallery_${Date.now()}.jpg`,
                };
              });
              console.log('Mảng ImageFile được tạo:', imageFiles);
              if (imageFiles.length > 0) {
                onUpload(imageFiles);
              } else {
                Alert.alert('Thông báo', 'Không có ảnh nào được chọn');
              }
            })
            .catch(e => {
              console.log('Lỗi thư viện:', e);
              if (e.code !== 'E_PICKER_CANCELLED') {
                Alert.alert('Thông báo', 'Không thể truy cập thư viện, vui lòng kiểm tra quyền truy cập');
              }
            });
          }
        },
        {text: 'Hủy', style: 'cancel'}
      ]
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
    console.log('bắt buộc');
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
    if (!item) return;
    console.log(item);

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

      setServiceOptionList(prev =>
        prev.map(i => (i.id === itemWithId.id ? {...i, ...itemWithId} : i)),
      );
    } else {
      console.log(isNew);
      if (isNew) {
        // ✅ Thêm mới nếu tạo từ template 'khac'
        setServiceOptionList(prev => [...prev, itemWithId]);
      } else {
        // ✅ Cập nhật nếu đã tồn tại
        setServiceOptionList(prev =>
          prev.map(i => (i.id === itemWithId.id ? {...i, ...itemWithId} : i)),
        );
      }

      // Cập nhật custom service
      const customService: CustomService = {
        name: itemWithId.label,
        price: itemWithId.price ?? 0,
        priceType: itemWithId.priceType ?? 'perRoom',
        description: itemWithId.description ?? '',
      };

      setCustomServices(prev => {
        // Tìm dịch vụ hiện có theo tên
        const existingIndex = prev.findIndex(i => i.name === customService.name);
        if (existingIndex >= 0) {
          // Nếu đã tồn tại, thay thế
          const updated = [...prev];
          updated[existingIndex] = customService;
          return updated;
        } else {
          // Nếu chưa có, thêm mới
          return [...prev, customService];
        }
      });
    }

    setModalVisibleService(false);
    setItemServiceEdit(undefined);
  };

  const handleCancelModal = () => {
    setModalVisibleService(false);
  };

  const handleCreatePost = async () => {
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
        servicePrices: servicePrices,
        servicePriceConfig: servicePriceConfig,
      },
      customServices: customServices,
      amenities: amenities,
      furniture: furniture,
    };

    try {
      const res = await dispatch(createLandlordRoom(room));
      console.log('Payload gửi:', JSON.stringify(room, null, 2));
      if (createLandlordRoom.fulfilled.match(res)) {
        Alert.alert('Thành công', 'Tạo phòng trọ thành công!');
        clearForm();
        navigation.goBack();
      } else if (createLandlordRoom.rejected.match(res)) {
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

  const onPressOnpenMap = () => {
    navigation.navigate('MapScreen', {
      isSelectMode: true,
      onSelectLocation: (location: any) => {
        setAddressText(location.address);
        setCoordinates([location.longitude, location.latitude]);
      },
    });
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
            placeholder="Địa chỉ chi tiết"
            value={addressText}
            onChangeText={setAddressText}
            iconRight={Icons.IconMap}
            onPressIcon={onPressOnpenMap}
            editable={true}
            height={verticalScale(60)}
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
              value={rentPrice?.toString() || ''}
              onChangeText={text => {
                const value = text.replace(/[^0-9]/g, '');
                setRentPrice(value === '' ? '' : parseInt(value, 10));
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
          <ItemTitle title="Hình ảnh" icon={Icons.IconAdd} onPress={pickImages} />
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
              onPress={handleCreatePost}
              title="Tạo bài đăng"
              icon={Icons.IconAdd}
              onPressIcon={() => {}}
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
    marginVertical: 10,
  },
});