import {StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import {Image} from 'react-native';
import {
  moderateScale,
  responsiveIcon,
  SCREEN,
  verticalScale,
} from '../../../../utils/responsive';
import {Icons} from '../../../../assets/icons';
import {Colors} from '../../../../theme/color';
import {ImageUploadResult} from '../../../../types/ImageUploadResult';
import {API_CONFIG} from '../../../../configs';

const WIGHT_IMAGE = SCREEN.width * 0.28;
interface ItemImageProps {
  item: ImageUploadResult;
  onDeleteImage: (fileName: string) => void;
  onClickItem: (fileName: string) => void;
}

const ItemImage = ({item, onDeleteImage, onClickItem}: ItemImageProps) => {
  const formatImageUrl = (url: string): string => {
    if (url.startsWith('http')) {
      return url;
    }
    return `${API_CONFIG.BASE_URL}${url}`;
  };
  const imageUrl = formatImageUrl(item.url);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onClickItem(imageUrl)}>
      <Image
        source={{
          uri: imageUrl,
        }}
        style={styles.styleImage}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => onDeleteImage(item.fileName)}>
        <Image source={{uri: Icons.IconDelete}} style={styles.styleIcon} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default React.memo(ItemImage);

const styles = StyleSheet.create({
  container: {
    width: WIGHT_IMAGE,
    height: WIGHT_IMAGE,
    marginHorizontal: verticalScale(3.9),
    marginBottom: verticalScale(10),
  },
  styleImage: {
    width: WIGHT_IMAGE,
    height: WIGHT_IMAGE,
    borderRadius: moderateScale(5),
  },
  button: {
    width: responsiveIcon(32),
    height: responsiveIcon(32),
    borderRadius: responsiveIcon(32) / 2,
    backgroundColor: Colors.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: -5,
    right: -5,
  },
  styleIcon: {
    width: responsiveIcon(18),
    height: responsiveIcon(18),
  },
});
