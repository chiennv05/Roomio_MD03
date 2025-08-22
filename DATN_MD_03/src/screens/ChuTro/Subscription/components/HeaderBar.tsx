import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SCREEN, responsiveFont, scale, verticalScale} from '../../../../utils/responsive';
import {Fonts} from '../../../../theme/fonts';
import {Colors} from '../../../../theme/color';

type HeaderBarProps = {
  title: string;
  subtitle?: string;
};

export default function HeaderBar({title, subtitle}: HeaderBarProps) {
  const navigation = useNavigation();
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backTxt}>←</Text>
        </TouchableOpacity>
        <View style={styles.center}>
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.rightSpace} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: SCREEN.width,
    paddingTop: verticalScale(4),
    paddingHorizontal: scale(12),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  backTxt: {
    fontSize: responsiveFont(18),
    color: Colors.black,
    fontFamily: Fonts.Roboto_Bold,
  },
  center: {flex: 1, alignItems: 'center'},
  rightSpace: {width: scale(40)},
  title: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(20),
    color: Colors.black,
  },
  subtitle: {
    marginTop: verticalScale(2),
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(12),
    color: '#374151',
  },
});


