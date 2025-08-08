import React from 'react';
import {StyleSheet, TouchableOpacity, Image} from 'react-native';
import {scale} from '../../../../utils/responsive';
import {Colors} from '../../../../theme/color';
import {Icons} from '../../../../assets/icons';

interface ItemImageProps {
  imageUrl: string;
  index: number;
  onViewImage: (index: number) => void;
  onDelete: (filename: string) => void;
}

const ItemImage: React.FC<ItemImageProps> = ({
  imageUrl,
  index,
  onViewImage,
  onDelete,
}) => {
  const handleDelete = () => {
    const fileName = imageUrl.split('/').pop();
    onDelete(fileName || '');
  };

  return (
    <TouchableOpacity
      onPress={() => onViewImage(index)}
      style={styles.container}
      key={`signed-image-${index}`}>
      <Image
        source={{uri: imageUrl}}
        style={styles.contractImage}
        resizeMode="cover"
      />
      <TouchableOpacity style={styles.button} onPress={handleDelete}>
        <Image
          source={{uri: Icons.IconDelete}}
          style={styles.stylesIconDelete}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default React.memo(ItemImage);

const styles = StyleSheet.create({
  container: {
    marginRight: scale(10),
    width: scale(200),
    height: scale(280),
  },
  imageWrapper: {
    position: 'relative',
  },
  contractImage: {
    width: scale(200),
    height: scale(280),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  button: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.red,
    padding: scale(5),
    borderRadius: 20,
  },
  stylesIconDelete: {
    width: scale(12),
    height: scale(12),
    tintColor: Colors.white,
  },
});
