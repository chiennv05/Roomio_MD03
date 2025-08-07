import {useAppDispatch} from '../../../../hooks';
import {
  deleteAllSignedImages,
  deleteSignedImageThunk,
} from '../../../../store/slices/contractSlice';
import {useCustomAlert} from '../../../../hooks/useCustomAlrert';

export function useContractImageActions(contractId: string) {
  const dispatch = useAppDispatch();
  const {showSuccess, showError} = useCustomAlert();

  /**
   * Xóa tất cả ảnh hợp đồng đã ký
   */
  const onDeleteAllImages = async () => {
    try {
      const result = await dispatch(deleteAllSignedImages(contractId)).unwrap();
      showSuccess(result.message, 'Thành công', true);
    } catch (err: any) {
      showError(err || 'Xóa tất cả ảnh thất bại', 'Lỗi', true);
    }
  };

  /**
   * Xóa 1 ảnh theo fileName
   * @param fileName Tên file ảnh đã ký
   */
  const onDeleteImage = async (fileName: string) => {
    try {
      const result = await dispatch(
        deleteSignedImageThunk({contractId, fileName}),
      ).unwrap();
      showSuccess(
        result.message || 'Xóa ảnh hợp đồng đã ký thành công',
        'Thành công',
        true,
      );
    } catch (err: any) {
      showError(err || `Xóa ảnh "${fileName}" thất bại`, 'Lỗi', true);
    }
  };

  return {onDeleteAllImages, onDeleteImage};
}
