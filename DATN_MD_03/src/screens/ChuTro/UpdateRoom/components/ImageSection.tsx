import React, {useState} from 'react';
import {Alert, FlatList, StyleSheet, Text, View} from 'react-native';
import ItemTitle from '../../AddRoom/components/ItemTitle ';
import {Icons} from '../../../../assets/icons';
import ItemImage from '../../AddRoom/components/ItemImage';
import ImagePicker from 'react-native-image-crop-picker';
import {
  deleteRoomPhoto,
  ImageFile,
  uploadRoomPhotos,
} from '../../../../store/services/uploadService';
import {formatPhotoUrls} from '../../AddRoom/utils/fomatImageUrl';
import ModalLoading from '../../AddRoom/components/ModalLoading';
import {SCREEN} from '../../../../utils/responsive';

interface ImageSectionProps {
  image: any[];
  setImage: React.Dispatch<React.SetStateAction<any[]>>;
  imageArr: string[];
  setImageArr: React.Dispatch<React.SetStateAction<string[]>>;
}

const ImageSection: React.FC<ImageSectionProps> = ({
  image,
  setImage,
  imageArr,
  setImageArr,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [visibleImage, setVisibleImage] = useState(false);
  const [selectImage, setSelectImage] = useState<string>('');

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
      
      const uploaded = result.data.photos;
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
              // Nếu là ảnh đã tồn tại, chỉ xóa khỏi state
              if (fileName.startsWith('existing-')) {
                const updatedImages = image.filter(img => img.fileName !== fileName);
                setImage(updatedImages);
                const formattedPhotos = formatPhotoUrls(updatedImages);
                setImageArr(formattedPhotos);
              } else {
                // Nếu là ảnh mới upload, gọi API xóa
                await deleteRoomPhoto(fileName);
                setImage(prev => prev.filter(img => img.fileName !== fileName));
                setImageArr(prev => prev.filter(url => !url.includes(fileName)));
              }
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

  const onClickItemImage = (filename: string) => {
    setSelectImage(filename);
    setVisibleImage(true);
  };

  const onCloseVisible = () => {
    setVisibleImage(false);
    setSelectImage('');
  };

  return (
    <>
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
                onClickItem={onClickItemImage}
              />
            )}
          />
        )}
      </View>
      <ModalLoading
        visible={visibleImage}
        loading={isUploading}
        image={selectImage}
        onPressVisible={onCloseVisible}
      />
    </>
  );
};

const styles = StyleSheet.create({
  containerImage: {
    width: SCREEN.width * 0.9,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default ImageSection; 