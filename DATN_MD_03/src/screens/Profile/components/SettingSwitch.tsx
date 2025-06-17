import React, {useState} from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ImageSourcePropType,
  Image,
} from 'react-native';
import {SCREEN, responsiveFont, responsiveIcon, responsiveSpacing, scale, verticalScale} from '../../../utils/responsive';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';

interface Props {
  iconStat?: ImageSourcePropType | string;
  label: string;
  initialValue: boolean;
}

export default function SettingSwitch({iconStat, label, initialValue}: Props) {
  const [isEnabled, setIsEnabled] = useState(initialValue);
  return (
    <View style={styles.row}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {iconStat && <Image source={{uri: iconStat}} style={styles.icon} />}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Switch
        value={isEnabled}
        onValueChange={setIsEnabled}
        trackColor={{false: Colors.gray, true: Colors.limeGreen}}
        thumbColor={Colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    borderBottomWidth: 0.5,
    borderColor: Colors.gray,
    width: SCREEN.width * 0.9,
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
