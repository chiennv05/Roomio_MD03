import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Colors} from '../../../theme/color';
import {responsiveFont, SCREEN, verticalScale} from '../../../utils/responsive';

interface ItemInformationalProps {
  title: string;
  value: string | null;
}

const ItemInformational = ({title, value}: ItemInformationalProps) => {
  const checkValue = value === '' ? false : true;
  return (
    <View style={styles.container}>
      <Text style={[styles.value, !checkValue && styles.nullValue]}>
        {checkValue ? value : 'Chưa cập nhật'}
      </Text>
    </View>
  );
};

export default ItemInformational;

const styles = StyleSheet.create({
  container: {
    width: SCREEN.width * 0.9,
    height: verticalScale(50),
    borderWidth: 1,
    borderColor: Colors.gray200,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginVertical: verticalScale(5),
    alignSelf: 'center',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: responsiveFont(16),
    color: Colors.black,
    fontWeight: '500',
  },
  value: {
    fontSize: responsiveFont(16),
    color: Colors.black,
  },
  nullValue: {
    fontSize: responsiveFont(16),
    color: Colors.ashGray,
  },
});
