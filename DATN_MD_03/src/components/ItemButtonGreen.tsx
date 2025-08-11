import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {Colors} from '../theme/color';
import {responsiveFont, responsiveSpacing, SCREEN} from '../utils/responsive';

interface ItemButtonGreenProps {
  title: string;
  onPress: () => void;
}

const ItemButtonGreen = ({title, onPress}: ItemButtonGreenProps) => {
  return (
    <TouchableOpacity style={styles.updateButton} onPress={onPress}>
      <Text style={styles.textButton}>{title}</Text>
    </TouchableOpacity>
  );
};

export default ItemButtonGreen;

const styles = StyleSheet.create({
  updateButton: {
    width: SCREEN.width * 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.limeGreen,
    borderRadius: responsiveFont(50),
    marginTop: responsiveSpacing(16),
  },

  textButton: {
    color: Colors.black,
    fontSize: responsiveFont(16),
    fontWeight: 'bold',
    paddingVertical: responsiveSpacing(12),
  },
});
