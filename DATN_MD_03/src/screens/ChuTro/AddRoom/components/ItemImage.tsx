import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {Image} from 'react-native';
import {
  moderateScale,
  responsiveIcon,
  SCREEN,
} from '../../../../utils/responsive';
import {Icons} from '../../../../assets/icons';
import {Colors} from '../../../../theme/color';

const WIGHT_IMAGE = SCREEN.width * 0.28;

const ItemImage = () => {
  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: 'https://imperia-smartcity.com.vn/wp-content/uploads/2024/11/a1.jpg',
        }}
        style={styles.styleImage}
      />
      <TouchableOpacity style={styles.button}>
        <Image source={{uri: Icons.IconDelete}} style={styles.styleIcon} />
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(ItemImage);

const styles = StyleSheet.create({
  container: {
    width: WIGHT_IMAGE,
    height: WIGHT_IMAGE,
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
