import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, responsiveSpacing} from '../../../../utils/responsive';

interface AddressSectionProps {
  addressText: string | undefined;
}

const AddressSection: React.FC<AddressSectionProps> = ({addressText}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Địa chỉ</Text>
      <Text style={styles.address}>
        {addressText || 'Không có thông tin địa chỉ'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: responsiveSpacing(15),
    marginTop: responsiveSpacing(15),
    borderRadius: 10,
    padding: responsiveSpacing(15),
    elevation: 2,
  },
  sectionTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(10),
  },
  address: {
    fontSize: responsiveFont(14),
    color: Colors.black,
    lineHeight: responsiveFont(22),
  },
});

export default AddressSection; 