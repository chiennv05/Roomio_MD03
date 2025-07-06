import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {
  moderateScale,
  responsiveFont,
  responsiveIcon,
  SCREEN,
} from '../../../../utils/responsive';
import {Colors} from '../../../../theme/color';
import {Icons} from '../../../../assets/icons';
import {Fonts} from '../../../../theme/fonts';

interface ServiceProps {
  status: boolean;
}

const WIGHT_IMAGE = SCREEN.width * 0.28;

const ItemService = ({status}: ServiceProps) => {
  return (
    <View
      style={[
        styles.container,
        {backgroundColor: status ? Colors.limeGreen : Colors.backgroud},
      ]}>
      <Image
        source={{uri: Icons.IconElectricalBlack}}
        style={styles.styleIconCenter}
      />
      <Text style={styles.textTitle}>Điện</Text>
      <Text style={styles.textPrice}>4000</Text>
      <TouchableOpacity
        style={[
          styles.button,
          {backgroundColor: status ? Colors.darkGray : Colors.limeGreen},
        ]}>
        <Image
          source={{uri: status ? Icons.IconEditWhite : Icons.IconEditBlack}}
          style={styles.styleIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(ItemService);

const styles = StyleSheet.create({
  container: {
    width: WIGHT_IMAGE,
    height: WIGHT_IMAGE,
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
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
  styleIconCenter: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
  },
  textTitle: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(16),
    color: Colors.gray60,
  },
  textPrice: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(16),
    color: Colors.black,
  },
});
