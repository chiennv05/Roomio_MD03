import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {
  responsiveFont,
  responsiveIcon,
  responsiveSpacing,
  SCREEN,
} from '../../../../utils/responsive';
import {Fonts} from '../../../../theme/fonts';
import {Colors} from '../../../../theme/color';

interface TitleProps {
  title: string;
  icon?: string;
}

const ItemTitle = ({title, icon}: TitleProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.textTitle}>{title} </Text>
      {icon && <Image source={{uri: icon}} style={styles.styleIcon} />}
    </View>
  );
};

export default ItemTitle;

const styles = StyleSheet.create({
  container: {
    width: SCREEN.width * 0.9,
    marginVertical: responsiveSpacing(15),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    fontWeight: '700',
    color: Colors.black,
  },
  styleIcon: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
  },
});
