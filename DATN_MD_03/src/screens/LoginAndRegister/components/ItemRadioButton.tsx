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
      <View style={isSelected ? styles.styleIcon : styles.styleIconDefaut}>
        {isSelected && <View style={styles.styleRadio} />}
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  styleIconDefaut: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
    borderRadius: responsiveIcon(24) / 2,
    marginRight: 10,
    borderWidth: 2,
    borderColor: Colors.gray150,
  },
  textTitle: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(18),
    color: Colors.primaryGreen,
  },
  textTitleDefaut: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(18),
    color: Colors.black,
  },
  styleRadio: {
    width: responsiveIcon(16),
    height: responsiveIcon(16),
    borderRadius: responsiveIcon(16) / 2,
    borderWidth: 4,
    borderColor: Colors.dearkOlive,
  },
});
