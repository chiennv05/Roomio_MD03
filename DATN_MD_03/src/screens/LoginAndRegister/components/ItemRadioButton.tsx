import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {responsiveFont, responsiveIcon} from '../../../utils/responsive';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';

interface RadioButtonProps {
  label: string;
  value: string;
  onPress: (value: string) => void;
  isSelected: boolean;
}

const ItemRadioButton = ({
  label,
  value,
  onPress,
  isSelected,
}: RadioButtonProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(value)}>
      <View style={isSelected ? styles.styleIcon : styles.styleIconDefaut} />
      <Text style={isSelected ? styles.textTitle : styles.textTitleDefaut}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default React.memo(ItemRadioButton);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  styleIcon: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
    borderRadius: responsiveIcon(24) / 2,
    backgroundColor: Colors.limeGreen,
    marginRight: 10,
    borderWidth: 2,
    borderColor: Colors.dearkOlive,
  },
  styleIconDefaut: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
    borderRadius: responsiveIcon(24) / 2,
    marginRight: 10,
    borderWidth: 2,
    borderColor: Colors.dearkOlive,
  },
  textTitle: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(18),
    color: Colors.primaryGreen,
  },
  textTitleDefaut: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(18),
    color: Colors.darkGray,
  },
});
