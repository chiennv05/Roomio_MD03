import {Alert} from 'react-native';
import {AppDispatch} from '../../../../store';
import {
  generateContractPDF,
  uploadContractImages,
} from '../../../../store/slices/contractSlice';
import {ImageFile} from '../../../../store/services/uploadService';
import ImagePicker from 'react-native-image-crop-picker';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../../types/route';

// Xử lý xem PDF
export const handleViewPDF = async (
  contract: any,
  contractId: string,
  dispatch: AppDispatch,
  navigation: StackNavigationProp<RootStackParamList>,
) => {
  if (contract.status === 'draft') {
    try {
      Alert.alert('Thông báo', 'Đang tạo file PDF hợp đồng...');

      const response = await dispatch(generateContractPDF(contractId)).unwrap();
      console.log('PDF generation response:', JSON.stringify(response));

      if (response.success) {
        navigation.navigate('PdfViewer', {pdfUrl: response.data.pdfUrl});
      } else {
        Alert.alert('Thông báo', 'Không thể tạo file PDF hợp đồng.');
      }
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      Alert.alert(
        'Lỗi',
        error?.message || 'Đã xảy ra lỗi khi tạo file PDF hợp đồng.',
      );
    }
  } else {
    if (contract.contractPdfUrl) {
      console.log('PDF URL:', contract.contractPdfUrl);
      navigation.navigate('PdfViewer', {pdfUrl: contract.contractPdfUrl});
    } else {
      Alert.alert('Thông báo', 'Hợp đồng chưa có file PDF.');
    }
  }
};

// Xử lý upload ảnh từ camera
export const handleCameraUpload = async (
  contractId: string,
  dispatch: AppDispatch,
) => {
  try {
    const image = await ImagePicker.openCamera({
      width: 1000,
      height: 1000,
      cropping: true,
      includeBase64: false,
      includeExif: false,
    });

    console.log('Selected image from camera:', {
      path: image.path,
      mime: image.mime,
      size: image.size,
    });

    if (!image.path || !image.mime) {
      Alert.alert('Lỗi', 'Không thể lấy thông tin ảnh');
      return;
    }

    const imageFile: ImageFile = {
      path: image.path,
      mime: image.mime,
      filename: image.path.split('/').pop() || `camera_${Date.now()}.jpg`,
    };

    console.log('Image file prepared:', imageFile);
    await uploadImages(contractId, [imageFile], dispatch);
  } catch (e: any) {
    console.error('Camera error:', e);
    if (e.code !== 'E_PICKER_CANCELLED') {
      Alert.alert('Lỗi', 'Không thể truy cập máy ảnh');
    }
  }
};

// Xử lý upload ảnh từ thư viện
export const handleGalleryUpload = async (
  contractId: string,
  dispatch: AppDispatch,
) => {
  try {
    const selectedImages = await ImagePicker.openPicker({
      multiple: true,
      maxFiles: 3,
      mediaType: 'photo',
      includeBase64: false,
      includeExif: false,
    });

    console.log('Selected images from gallery:', selectedImages);

    const imageArray = Array.isArray(selectedImages)
      ? selectedImages
      : [selectedImages];

    const imageFiles: ImageFile[] = imageArray.map(img => ({
      path: img.path,
      mime: img.mime,
      filename: img.path.split('/').pop() || `gallery_${Date.now()}.jpg`,
    }));

    console.log('Image files prepared:', imageFiles);
    await uploadImages(contractId, imageFiles, dispatch);
  } catch (e: any) {
    console.error('Gallery error:', e);
    if (e.code !== 'E_PICKER_CANCELLED') {
      Alert.alert('Lỗi', 'Không thể truy cập thư viện');
    }
  }
};

// Hàm upload ảnh chung
const uploadImages = async (
  contractId: string,
  imageFiles: ImageFile[],
  dispatch: AppDispatch,
) => {
  try {
    console.log('Uploading images with payload:', {
      contractId,
      images: imageFiles,
    });

    const result = await dispatch(
      uploadContractImages({
        contractId,
        images: imageFiles,
      }),
    ).unwrap();

    console.log('Upload result:', result);

    Alert.alert(
      'Thành công',
      result.message ||
        'Upload ảnh hợp đồng thành công. Hợp đồng đang chờ admin phê duyệt.',
    );
  } catch (error: any) {
    console.error('Upload error:', error);
    Alert.alert('Lỗi', error);
  }
};

// Xử lý chọn ảnh để upload
export const handlePickImages = (
  selectedContract: any,
  contractId: string,
  dispatch: AppDispatch,
) => {
  // Kiểm tra status trước khi cho phép chọn ảnh
  if (!selectedContract || selectedContract.status !== 'pending_signature') {
    Alert.alert('Thông báo', 'Chỉ có thể upload ảnh khi hợp đồng đang chờ ký');
    return;
  }

  console.log('Current contract status:', selectedContract.status);
  console.log(
    'Can upload images:',
    selectedContract.status === 'pending_signature',
  );

  Alert.alert('Chọn ảnh', 'Bạn muốn chọn ảnh từ đâu?', [
    {
      text: 'Máy ảnh',
      onPress: () => handleCameraUpload(contractId, dispatch),
    },
    {
      text: 'Thư viện',
      onPress: () => handleGalleryUpload(contractId, dispatch),
    },
    {text: 'Hủy', style: 'cancel'},
  ]);
};

// Xử lý xem ảnh đã ký
export const handleViewImage = (index: number) => {
  Alert.alert(
    'Thông báo',
    'Tính năng xem ảnh toàn màn hình sẽ được thực hiện sau',
  );
};
