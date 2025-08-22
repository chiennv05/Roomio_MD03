import React from 'react';
import {Modal} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';

interface ModalShowImageContractProps {
  visible: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

const ModalShowImageContract: React.FC<ModalShowImageContractProps> = ({
  visible,
  images,
  initialIndex = 0,
  onClose,
}) => {
  const formattedImages = images.map(url => ({url}));

  return (
    <Modal visible={visible} transparent={true} onRequestClose={onClose}>
      <ImageViewer
        imageUrls={formattedImages}
        index={initialIndex}
        onCancel={onClose}
        enableSwipeDown
        backgroundColor="#000"
        saveToLocalByLongPress={false}
      />
    </Modal>
  );
};

export default ModalShowImageContract;
