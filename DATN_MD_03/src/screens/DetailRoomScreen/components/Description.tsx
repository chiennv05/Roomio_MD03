import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';
import { responsiveSpacing, responsiveFont } from '../../../utils/responsive';

interface DescriptionProps {
  text: string;
}

const Description: React.FC<DescriptionProps> = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 150;
  
  const shouldShowReadMore = text.length > maxLength;
  const displayText = isExpanded ? text : text.substring(0, maxLength);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mô tả chi tiết</Text>
      <Text style={styles.description}>
        {displayText}
        {!isExpanded && shouldShowReadMore && '...'}
      </Text>
      {shouldShowReadMore && (
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
          <Text style={styles.readMore}>
            {isExpanded ? 'Thu gọn' : 'Xem thêm'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: responsiveSpacing(16),
  },
  title: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(16),
    color: Colors.black,
    marginBottom: responsiveSpacing(12),
  },
  description: {
    fontSize: responsiveFont(14),
    color: Colors.textGray,
    fontFamily: Fonts.Roboto_Regular,
    lineHeight: responsiveFont(20),
  },
  readMore: {
    fontSize: responsiveFont(14),
    color: Colors.darkGreen,
    fontFamily: Fonts.Roboto_Bold,
    marginTop: responsiveSpacing(8),
  },
});

export default Description;
