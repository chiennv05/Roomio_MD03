import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
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
  onPress?: () => void;
}

const ItemTitle = ({title, icon, onPress}: TitleProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.textTitle}>{title} </Text>
      {icon && (
        <TouchableOpacity onPress={onPress}>
          <Image source={{uri: icon}} style={styles.styleIcon} />
        </TouchableOpacity>
      )}
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
