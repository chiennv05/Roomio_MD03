import {Image, StyleSheet, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {Icons} from '../../../../assets/icons';
import {OptionItem} from '../../../../types/Options';
import {SCREEN, verticalScale} from '../../../../utils/responsive';

interface ItemOptionsProps {
  item: OptionItem;
  selected: boolean;
  onPress: (item: OptionItem) => void;
}

const ItemOptions = ({item, selected, onPress}: ItemOptionsProps) => {
  const iconKey = `${item.iconBase}${selected ? 'Selectd' : 'Default'}`;
  const icon = Icons[iconKey as keyof typeof Icons];

  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.selected]}
      onPress={() => onPress(item)}>
      <Image
        source={{uri: icon}}
        style={[styles.icon, selected && styles.iconSelected]}
      />
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );
};

export default React.memo(ItemOptions);

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    width: SCREEN.width * 0.43,
    height: verticalScale(48),
    borderRadius: 24,
    backgroundColor: '#f2f2f2', // default gray
    margin: 4,
  },
  selected: {
    backgroundColor: '#C6FF00', // neon yellow-green
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#9e9e9e', // gray icon
    marginRight: 8,
  },
  iconSelected: {
    tintColor: '#000',
  },
  label: {
    fontSize: 14,
    color: '#9e9e9e',
    fontWeight: '500',
  },
  labelSelected: {
    color: '#000',
    fontWeight: '700',
  },
});
