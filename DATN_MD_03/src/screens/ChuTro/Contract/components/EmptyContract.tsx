import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, scale, verticalScale} from '../../../../utils/responsive';

const EmptyContract = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../../assets/icons/icon_contract3x.png')}
        style={styles.icon}
      />
      <Text style={styles.title}>Chưa có hợp đồng</Text>
      <Text style={styles.description}>
        Bạn chưa có hợp đồng nào. Hợp đồng sẽ hiển thị ở đây sau khi bạn tạo hoặc ký hợp đồng.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  icon: {
    width: scale(80),
    height: scale(80),
    tintColor: Colors.gray150,
    marginBottom: verticalScale(16),
  },
  title: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(18),
    color: Colors.textGray,
    marginBottom: verticalScale(8),
  },
  description: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(14),
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: verticalScale(22),
  },
});

export default EmptyContract; 