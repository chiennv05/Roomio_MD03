import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors} from '../../../../theme/color';
import {responsiveFont, responsiveSpacing} from '../../../../utils/responsive';
import {Fonts} from '../../../../theme/fonts';

interface InfoRowProps {
  label: string;
  value: string | number;
}

const InfoRow: React.FC<InfoRowProps> = ({label, value}) => {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}: </Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    marginBottom: responsiveSpacing(10),
  },
  label: {
    fontWeight: '400',
    color: Colors.gray60,
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    width: responsiveSpacing(140), // Adjust width as needed
  },
  value: {
    flex: 1,
    color: Colors.black,
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Medium,
    fontWeight: '500',
  },
});

export default InfoRow;
