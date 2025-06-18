import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from 'react-native';
import {SCREEN, responsiveFont, responsiveIcon, responsiveSpacing, scale, verticalScale} from '../../../utils/responsive';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
interface Props {
  iconStat?: ImageSourcePropType | any;
  label: string;
  isLogout?: boolean;
  iconEnd?: ImageSourcePropType | any;
  onPress?: () => void;
}

export default function SettingItem({
  iconStat,
  label,
  isLogout = false,
  iconEnd,
  onPress,
}: Props) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.left}>
        {iconStat && (
          <Image
            source={typeof iconStat === 'string' ? {uri: iconStat} : iconStat}
            style={styles.icon}
          />
        )}
        <Text style={[styles.label, isLogout && {color: Colors.dearkOlive}]}>
          {label}
        </Text>
        {iconEnd && (
          <Image
            source={typeof iconEnd === 'string' ? {uri: iconEnd} : iconEnd}
            style={styles.icon}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: verticalScale(14),
    borderBottomWidth: 0.5,
    borderColor: Colors.gray,
    width: SCREEN.width * 0.9,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: responsiveIcon(20),
    height: responsiveIcon(20),
    marginRight: responsiveSpacing(20),
    resizeMode: 'contain',
  },
  label: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
  },
});
