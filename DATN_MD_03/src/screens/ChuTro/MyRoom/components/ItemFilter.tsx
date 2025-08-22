import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {Colors} from '../../../../theme/color';
import {RoomSatus} from '../constants/roomStatus';
import {
  responsiveFont,
  responsiveSpacing,
  scale,
} from '../../../../utils/responsive';
import {Fonts} from '../../../../theme/fonts';

interface FilterProps {
  item: RoomSatus;
  isSelected: boolean;
  onPress: (value: string, approvalStatus: string) => void;
  index: number;
}

const ItemFilter = ({item, isSelected, onPress, index}: FilterProps) => {
  return (
    <TouchableOpacity
      style={StyleSheet.flatten([
        styles.containerBase,
        isSelected ? styles.selected : styles.default,
        index === 0 && {marginLeft: responsiveSpacing(10)},
      ])}
      onPress={() => onPress(item.value, item.approvalStatus)}>
      <Text style={styles.textLabel}>{item.label}</Text>
    </TouchableOpacity>
  );
};

export default React.memo(ItemFilter);

const styles = StyleSheet.create({
  containerBase: {
    marginHorizontal: scale(5),
    borderRadius: scale(25),
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: Colors.limeGreen,
  },
  default: {
    backgroundColor: Colors.white,
  },
  textLabel: {
    fontSize: responsiveFont(16),
    fontWeight: '400',
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    paddingVertical: responsiveSpacing(8),
    paddingHorizontal: responsiveSpacing(24),
  },
});
