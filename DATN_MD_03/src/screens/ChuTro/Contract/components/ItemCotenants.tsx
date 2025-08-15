import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {CoTenant} from '../../../../types';
import {Icons} from '../../../../assets/icons';
import {
  responsiveIcon,
  responsiveSpacing,
  SCREEN,
} from '../../../../utils/responsive';

interface ItemCotenantsProps {
  item: CoTenant;
  onRemove: (username: string) => void;
}

const ItemCotenants: React.FC<ItemCotenantsProps> = ({item, onRemove}) => {
  return (
    <TouchableOpacity
      style={styles.chip}
      onLongPress={() => onRemove(item.username)}
      activeOpacity={0.85}>
      <View style={styles.containerContent}>
        <Text style={styles.chipText}>Username: {item.username}</Text>
        <Text style={styles.chipText}>Tên: {item.fullName}</Text>
        <Text style={styles.chipText}>Email: {item.email}</Text>
        <Text style={styles.chipText}>
          Số điện thoại: {item.identityNumber}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.chipRemove}
        onPress={() => onRemove(item.username)}
        hitSlop={{top: 8, right: 8, bottom: 8, left: 8}}>
        <Image source={{uri: Icons.IconDelete}} style={styles.chipRemoveIcon} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default React.memo(ItemCotenants);

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAF2',
    borderWidth: 1,
    borderColor: '#E6F0D8',
    paddingHorizontal: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(8),
    borderRadius: responsiveSpacing(22),
    marginBottom: responsiveSpacing(8),
    width: SCREEN.width * 0.9,
  },
  chipText: {
    color: Colors.darkGreen,
    fontFamily: Fonts.Roboto_Bold,
  },
  chipRemove: {marginLeft: 8},
  chipRemoveIcon: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
    tintColor: 'red',
  },
  containerContent: {
    flex: 1,
  },
});
