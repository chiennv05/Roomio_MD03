import React, {memo} from 'react';
import {Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {
  responsiveFont,
  responsiveSpacing,
  scale,
} from '../../../../utils/responsive';
import {ItemFilterContract} from '../utils/filterContract';

interface Props {
  item: ItemFilterContract;
  index: number;
  isSelected: boolean;
  onPress: (value: string) => void;
}

const FilterStatusItem = ({item, index, isSelected, onPress}: Props) => {
  return (
    <TouchableOpacity
      style={StyleSheet.flatten([
        styles.containerBase,
        isSelected ? styles.selected : styles.default,
        index === 0 && {marginLeft: responsiveSpacing(10)},
      ])}
      onPress={() => onPress(item.value)}>
      <Text style={styles.textLabel}>{item.label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  containerBase: {
    marginHorizontal: scale(5),
    paddingHorizontal: responsiveSpacing(10),
    paddingVertical: responsiveSpacing(10),
    borderRadius: scale(25),
    minWidth: 100,
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
  },
});

export default memo(FilterStatusItem);
