import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {Icons} from '../../../assets/icons';
import {responsiveIcon, SCREEN, verticalScale} from '../../../utils/responsive';
import {Colors} from '../../../theme/color';
interface ButtonProps {
  onPress: () => void;
}

const ItemButtonConfirm = ({onPress}: ButtonProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.buttonIcon}>
        <Image source={{uri: Icons.IconReset}} style={styles.styleIcon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonConfirm} onPress={onPress}>
        <Text>Xác nhận</Text>
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
    width: responsiveIcon(24),
    height: responsiveIcon(24),
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
});
