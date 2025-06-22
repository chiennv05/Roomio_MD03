import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {
  responsiveFont,
  responsiveIcon,
  SCREEN,
  verticalScale,
} from '../../../utils/responsive';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
interface ButtonProps {
  onPress: () => void;
  title: string;
  icon: any;
  onPressIcon: () => void;
}

const ItemButtonConfirm = ({
  onPress,
  title,
  icon,
  onPressIcon,
}: ButtonProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.buttonIcon} onPress={onPressIcon}>
        <Image source={{uri: icon}} style={styles.styleIcon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonConfirm} onPress={onPress}>
        <Text style={styles.textButton}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ItemButtonConfirm;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: SCREEN.width * 0.9,
    height: verticalScale(73),
    backgroundColor: Colors.dearkOlive,
    borderRadius: 36,
    alignItems: 'center',
    padding: 10,
  },
  buttonIcon: {
    width: responsiveIcon(48),
    height: responsiveIcon(48),
    borderRadius: responsiveIcon(48) / 2,
    backgroundColor: Colors.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  styleIcon: {
    width: responsiveIcon(17),
    height: responsiveIcon(17),
  },
  buttonConfirm: {
    flex: 1,
    height: verticalScale(48),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.limeGreen,
    borderRadius: 36,
    margin: 2,
    marginLeft: 10,
  },

  textButton: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    fontWeight: '600',
  },
});
