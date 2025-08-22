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
import {Contract} from '../../../../types';

// Xử lý xem PDF
export const handleViewPDF = async (
  contract: Contract,
  contractId: string,
  dispatch: AppDispatch,
  navigation: StackNavigationProp<RootStackParamList>,
  setGeneratingPDF: (value: boolean) => void,
  customAlert?: {
    showError: (message: string, title?: string) => void;
    showSuccess: (message: string, title?: string) => void;
  },
) => {
  if (contract.status === 'draft') {
    try {
      setGeneratingPDF(true);

      const response = await dispatch(generateContractPDF(contractId)).unwrap();

      if (response.success && response.data?.viewPdfUrl) {
        navigation.navigate('PdfViewer', {pdfUrl: response.data.viewPdfUrl});
      } else {
        if (customAlert) {
          customAlert.showError(
            'Không thể tạo file PDF hợp đồng.',
            'Thông báo',
          );
        } else {
          Alert.alert('Thông báo', 'Không thể tạo file PDF hợp đồng.');
        }
      }
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      if (customAlert) {
        customAlert.showError(
          error?.message || 'Đã xảy ra lỗi khi tạo file PDF hợp đồng.',
          'Lỗi',
        );
      } else {
        Alert.alert(
          'Lỗi',
          error?.message || 'Đã xảy ra lỗi khi tạo file PDF hợp đồng.',
        );
      }
    } finally {
      setGeneratingPDF(false);
    }
  } else {
    if (contract.contractPdfUrl) {
      navigation.navigate('PdfViewer', {pdfUrl: contract.contractPdfUrl});
    } else if (contract.contractPdfUrlFilename) {
      navigation.navigate('PdfViewer', {
        pdfUrl: contract.contractPdfUrlFilename,
      });
    } else {
      if (customAlert) {
        customAlert.showError('Hợp đồng chưa có file PDF.', 'Thông báo');
      } else {
        Alert.alert('Thông báo', 'Hợp đồng chưa có file PDF.');
      }
    }
  }
};

// Xử lý upload ảnh từ camera
export const handleCameraUpload = async (
  contractId: string,
  dispatch: AppDispatch,
  append: boolean,
  customAlert?: {
    showError: (message: string, title?: string) => void;
    showSuccess: (message: string, title?: string) => void;
    hideAlert: () => void;
  },
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
      if (customAlert) {
        customAlert.showError('Không thể lấy thông tin ảnh', 'Lỗi');
      } else {
        Alert.alert('Lỗi', 'Không thể lấy thông tin ảnh');
      }
      return;
    }

    const imageFile: ImageFile = {
      path: image.path,
      mime: image.mime,
      filename: image.path.split('/').pop() || `camera_${Date.now()}.jpg`,
    };

    console.log('Image file prepared:', imageFile);
    await uploadImages(contractId, [imageFile], dispatch, append, customAlert);
  } catch (e: any) {
    console.error('Camera error:', e);
    if (e.code !== 'E_PICKER_CANCELLED') {
      if (customAlert) {
        customAlert.showError('Không thể truy cập máy ảnh', 'Lỗi');
      } else {
        Alert.alert('Lỗi', 'Không thể truy cập máy ảnh');
      }
    }
  }
};

// Xử lý upload ảnh từ thư viện
export const handleGalleryUpload = async (
  contractId: string,
  dispatch: AppDispatch,
  append: boolean,
  customAlert?: {
    showError: (message: string, title?: string) => void;
    showSuccess: (message: string, title?: string) => void;
    hideAlert: () => void;
  },
) => {
  try {
    const selectedImages = await ImagePicker.openPicker({
      multiple: true,
      maxFiles: 5,
      mediaType: 'photo',
      includeBase64: false,
      includeExif: false,
    });

    const imageArray = Array.isArray(selectedImages)
      ? selectedImages
      : [selectedImages];

    const imageFiles: ImageFile[] = imageArray.map(img => ({
      path: img.path,
      mime: img.mime,
      filename: img.path.split('/').pop() || `gallery_${Date.now()}.jpg`,
    }));

    await uploadImages(contractId, imageFiles, dispatch, append, customAlert);
  } catch (e: any) {
    if (e.code !== 'E_PICKER_CANCELLED') {
      if (customAlert) {
        customAlert.showError('Không thể truy cập thư viện', 'Lỗi');
      } else {
        Alert.alert('Lỗi', 'Không thể truy cập thư viện');
      }
    }
  }
};

// Hàm upload ảnh chung
const uploadImages = async (
  contractId: string,
  imageFiles: ImageFile[],
  dispatch: AppDispatch,
  append: boolean,
  customAlert?: {
    showError: (message: string, title?: string, autoHide?: boolean) => void;
    showSuccess: (message: string, title?: string, autoHide?: boolean) => void;
    hideAlert: () => void;
  },
) => {
  customAlert?.hideAlert();
  try {
    const result = await dispatch(
      uploadContractImages({
        contractId,
        images: imageFiles,
        append,
      }),
    ).unwrap();

    if (customAlert) {
      customAlert.showSuccess(
        result.message ||
          'Upload ảnh hợp đồng thành công. Hợp đồng đang chờ admin phê duyệt.',
        'Thành công',
        true,
      );
    } else {
      Alert.alert(
        'Thành công',
        result.message ||
          'Upload ảnh hợp đồng thành công. Hợp đồng đang chờ admin phê duyệt.',
      );
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    if (customAlert) {
      customAlert.showError(error, 'Lỗi', true);
    } else {
      Alert.alert('Lỗi', error);
    }
  }
};

// Xử lý chọn ảnh để upload
export const handlePickImages = (
  selectedContract: any,
  contractId: string,
  dispatch: AppDispatch,
  customAlert?: {
    showError: (message: string, title?: string) => void;
    showSuccess: (message: string, title?: string) => void;
    showConfirm: (
      message: string,
      onConfirm: () => void,
      title?: string,
      customButtons?: Array<{
        text: string;
        onPress: () => void;
        style?: 'default' | 'cancel' | 'destructive';
      }>,
    ) => void;
    hideAlert: () => void;
  },
) => {
  if (
    !selectedContract ||
    (selectedContract.status !== 'pending_signature' &&
      selectedContract.status !== 'pending_approval' &&
      selectedContract.status !== 'needs_resigning')
  ) {
    if (customAlert) {
      customAlert.showError(
        'Chỉ có thể upload ảnh khi hợp đồng đang chờ ký',
        'Thông báo',
      );
    } else {
      Alert.alert(
        'Thông báo',
        'Chỉ có thể upload ảnh khi hợp đồng đang chờ ký',
      );
    }
    return;
  }

  const existingCount = selectedContract.signedContractImages?.length ?? 0;

  // Nếu chưa có ảnh nào, cứ mở picker luôn ở chế độ append
  if (existingCount === 0) {
    handleGalleryUpload(contractId, dispatch, true, customAlert);
    return;
  }

  // Ngược lại, hỏi thêm hay thay thế
  if (customAlert) {
    customAlert.showConfirm(
      'Bạn muốn thêm ảnh mới hay thay thế toàn bộ ảnh cũ?',
      () => {},
      'Upload ảnh hợp đồng',
      [
        {
          text: 'Thêm ảnh',
          onPress: () =>
            handleGalleryUpload(contractId, dispatch, true, customAlert),
          style: 'default',
        },
        {
          text: 'Thay thế toàn bộ ảnh',
          onPress: () =>
            handleGalleryUpload(contractId, dispatch, false, customAlert),
          style: 'default',
        },
        {
          text: 'Hủy',
          onPress: customAlert.hideAlert,
          style: 'cancel',
        },
      ],
    );
  } else {
    Alert.alert(
      'Upload ảnh hợp đồng',
      'Bạn muốn thêm ảnh mới hay thay thế toàn bộ ảnh cũ?',
      [
        {
          text: 'Thêm ảnh',
          onPress: () => handleGalleryUpload(contractId, dispatch, true),
        },
        {
          text: 'Thay thế toàn bộ ảnh',
          onPress: () => handleGalleryUpload(contractId, dispatch, false),
        },
        {text: 'Hủy', style: 'cancel'},
      ],
    );
  }
};
