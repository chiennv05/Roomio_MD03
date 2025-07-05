import React, {ReactNode} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, scale, verticalScale} from '../../../../utils/responsive';

interface InfoRowProps {
  label: string;
  value?: string | number | ReactNode;
  labelWidth?: number;
  bold?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value = 'Không có',
  labelWidth = 120,
  bold = false,
}) => {
  const renderValue = () => {
    if (typeof value === 'string' || typeof value === 'number') {
      return (
        <Text
          style={[
            styles.value,
            bold && styles.boldValue,
          ]}>
          {value}
        </Text>
      );
    }
    return value;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, {width: scale(labelWidth)}]}>{label}</Text>
      {renderValue()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: verticalScale(8),
    alignItems: 'center',
  },
  label: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  value: {
    flex: 1,
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
  },
  boldValue: {
    fontFamily: Fonts.Roboto_Bold,
  },
});

export default InfoRow; 