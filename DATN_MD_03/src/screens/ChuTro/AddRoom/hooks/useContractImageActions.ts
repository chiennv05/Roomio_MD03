import {Alert} from 'react-native';
import {useAppDispatch} from '../../../../hooks';
import {
  deleteAllSignedImages,
  deleteSignedImageThunk,
} from '../../../../store/slices/contractSlice';

export function useContractImageActions(contractId: string) {
  const dispatch = useAppDispatch();

  /**
   * Xóa tất cả ảnh hợp đồng đã ký
   */
  const onDeleteAllImages = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa toàn bộ ảnh hợp đồng đã ký?',
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await dispatch(
                deleteAllSignedImages(contractId),
              ).unwrap();
              Alert.alert('Thành công', result.message);
            } catch (err: any) {
              Alert.alert('Lỗi', err || 'Xóa tất cả ảnh thất bại');
            }
          },
        },
      ],
    );
  };

  /**
   * Xóa 1 ảnh theo fileName
   * @param fileName Tên file ảnh đã ký
   */
  const onDeleteImage = (fileName: string) => {
    Alert.alert('Xác nhận', `Bạn có chắc chắn muốn xóa ảnh "${fileName}"?`, [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await dispatch(
              deleteSignedImageThunk({contractId, fileName}),
            ).unwrap();
            Alert.alert('Thành công', result.message);
          } catch (err: any) {
            Alert.alert('Lỗi', err || `Xóa ảnh "${fileName}" thất bại`);
          }
        },
      },
    ]);
  };

  return {onDeleteAllImages, onDeleteImage};
}
