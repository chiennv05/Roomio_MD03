import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {
  responsiveFont,
  responsiveSpacing,
  SCREEN,
} from '../../../../utils/responsive';
import {Colors} from '../../../../theme/color';

interface ItemHelpTextProps {
  text: string;
}

const ItemHelpText = ({text}: ItemHelpTextProps) => {
  return (
    <View>
      <Text style={styles.helperText}>{text}</Text>
    </View>
  );
};

export default ItemHelpText;

const styles = StyleSheet.create({
  helperText: {
    fontSize: responsiveFont(15),
    color: Colors.gray60, // màu xám nhẹ
    marginBottom: responsiveSpacing(10),
    marginLeft: 4,
  },
  container: {
    width: SCREEN.width * 0.9,
  },
});
