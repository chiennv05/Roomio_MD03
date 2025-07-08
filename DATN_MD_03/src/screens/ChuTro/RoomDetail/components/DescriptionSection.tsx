import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, responsiveSpacing} from '../../../../utils/responsive';

interface DescriptionSectionProps {
  description: string | undefined;
}

const DescriptionSection: React.FC<DescriptionSectionProps> = ({description}) => {
  if (!description) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Mô tả</Text>
      <Text style={styles.description}>{description}</Text>
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
  description: {
    fontSize: responsiveFont(14),
    color: Colors.black,
    lineHeight: responsiveFont(22),
  },
});

export default DescriptionSection; 