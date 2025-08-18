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
  const avatarSource = item.avatar;
  return (
    <View style={styles.chip}>
      <View style={styles.titleContainer}>
        {item.avatar ? (
          <Image source={{uri: avatarSource}} style={styles.imageAvater} />
        ) : (
          <Text style={[styles.personInitial]}>
            {(item.fullName || item.username || 'N').charAt(0).toUpperCase()}
          </Text>
        )}
        <View style={styles.conainerNameandFullName}>
          <Text style={styles.textFullName}>{item.fullName}</Text>
          <Text style={styles.textUsername}>@{item.username}</Text>
        </View>
        <TouchableOpacity
          style={styles.chipRemove}
          onPress={() => onRemove(item.username)}
          hitSlop={{top: 8, right: 8, bottom: 8, left: 8}}>
          <Image
            source={{uri: Icons.IconTrashCanRed}}
            style={styles.chipRemoveIcon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.containerContent}>
        <View style={styles.containerTextRow}>
          <Text style={styles.textLabel}>Email : </Text>
          <Text style={styles.textUsername}>{item.email}</Text>
        </View>
        <View style={styles.containerTextRow}>
          <Text style={styles.textLabel}>Số điện thoại : </Text>
          <Text style={styles.textUsername}>{item.phone}</Text>
        </View>
      </View>
    </View>
  );
};

export default React.memo(ItemCotenants);

const styles = StyleSheet.create({
  chip: {
    width: SCREEN.width,
    backgroundColor: Colors.white,
    paddingHorizontal: responsiveSpacing(20),
    paddingVertical: responsiveSpacing(16),
    marginBottom: responsiveSpacing(8),
  },
  chipText: {
    color: Colors.darkGreen,
    fontFamily: Fonts.Roboto_Bold,
  },
  chipRemove: {marginLeft: 8},
  chipRemoveIcon: {
    width: responsiveIcon(32),
    height: responsiveIcon(32),
  },
  containerContent: {
    width: SCREEN.width,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageAvater: {
    width: responsiveIcon(66),
    height: responsiveIcon(66),
    borderRadius: responsiveIcon(66) / 2,
    marginRight: responsiveSpacing(12),
  },
  textFullName: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveIcon(20),
    color: Colors.black,
    fontWeight: '700',
    marginBottom: responsiveSpacing(4),
  },
  conainerNameandFullName: {
    flex: 1,
  },
  textUsername: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveIcon(16),
    color: Colors.dearkOlive,
    fontWeight: '400',
  },
  containerTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: responsiveSpacing(8),
  },
  textLabel: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveIcon(16),
    color: Colors.darkGray,
    fontWeight: '400',
    width: responsiveSpacing(120),
  },
  personInitial: {
    width: responsiveIcon(66),
    height: responsiveIcon(66),
    borderRadius: responsiveIcon(66) / 2,
    backgroundColor: Colors.limeGreen,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: Colors.black,
    fontFamily: Fonts.Roboto_Bold,
    marginRight: responsiveSpacing(12),
    fontSize: responsiveIcon(28),
  },
});
