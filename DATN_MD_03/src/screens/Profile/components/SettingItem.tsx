import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from 'react-native';
import {
  SCREEN,
  responsiveFont,
  responsiveIcon,
  responsiveSpacing,
  verticalScale,
} from '../../../utils/responsive';
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
      </View>
      {iconEnd && (
        <Image
          source={typeof iconEnd === 'string' ? {uri: iconEnd} : iconEnd}
          style={styles.iconEnd}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    width: responsiveIcon(24),
    height: responsiveIcon(24),
    marginRight: responsiveSpacing(20),
    resizeMode: 'contain',
  },
  iconEnd: {
    width: responsiveIcon(6),
    height: responsiveIcon(12),
    marginLeft: responsiveSpacing(30),
    resizeMode: 'contain',
  },
  label: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    marginRight: responsiveSpacing(15),
  },
});
