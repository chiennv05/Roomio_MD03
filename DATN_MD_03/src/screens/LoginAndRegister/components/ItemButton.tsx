import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import {
  responsiveFont,
  responsiveSpacing,
  SCREEN,
  verticalScale,
} from '../../../utils/responsive';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';

interface ButtonProps {
  onPress: () => void;
  loading?: boolean;
}
const ItemButton = ({onPress, loading = false}: ButtonProps) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={loading}>
      {loading ? (
        <ActivityIndicator color={Colors.white} />
      ) : (
        <Text style={styles.textButton}>Xác nhận</Text>
      )}
    </TouchableOpacity>
  );
};

export default ItemButton;

const styles = StyleSheet.create({
  container: {
    width: SCREEN.width * 0.9,
    height: verticalScale(48),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.limeGreen,
    borderRadius: 36,
    marginTop: responsiveSpacing(20),
  },
  textButton: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    fontWeight: '600',
  },
});
