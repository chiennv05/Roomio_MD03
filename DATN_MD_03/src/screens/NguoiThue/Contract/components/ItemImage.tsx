import React from 'react';
import {StyleSheet, View, TouchableOpacity, Image} from 'react-native';
import {scale} from '../../../../utils/responsive';
import {Colors} from '../../../../theme/color';

interface ItemImageProps {
  imageUrl: string;
  index: number;
  onViewImage: (index: number) => void;
  onDelete?: (filename: string) => void;
}

const ItemImage: React.FC<ItemImageProps> = ({
  imageUrl,
  index,
  onViewImage,
}) => {
  return (
    <View style={styles.container} key={`signed-image-${index}`}>
      <TouchableOpacity
        style={styles.imageWrapper}
        activeOpacity={0.8}
        onPress={() => onViewImage(index)}>
        <Image
          source={{uri: imageUrl}}
          style={styles.contractImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(ItemImage);

const styles = StyleSheet.create({
  container: {
    marginRight: scale(10),
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: scale(200),
    height: scale(280),
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
  },
  button: {
    backgroundColor: Colors.white,
    paddingVertical: scale(8),
    paddingHorizontal: scale(16),
    borderRadius: 4,
    marginHorizontal: scale(8),
  },
  buttonText: {
    color: Colors.red, // hoặc bất kỳ màu nào bạn muốn
    fontWeight: 'bold',
  },
});
