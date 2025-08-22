import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {
  responsiveFont,
  scale,
  SCREEN,
  verticalScale,
} from '../../../../utils/responsive';

const EmptyContract = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../../assets/icons/icon_contract3x.png')}
        style={styles.icon}
      />
      <Text style={styles.title}>Chưa có hợp đồng</Text>
      <Text style={styles.description}>
        Bạn chưa có hợp đồng nào. Hợp đồng sẽ hiển thị ở đây sau khi bạn tạo
        hoặc ký hợp đồng.
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
    fontFamily: Fonts.Roboto_Medium,
    fontSize: responsiveFont(20),
    color: Colors.black,
    marginBottom: verticalScale(8),
    textAlign: 'center',
    fontWeight: '700',
  },
  description: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(16),
    color: Colors.gray60,
    textAlign: 'center',
    lineHeight: verticalScale(22),
    width: SCREEN.width * 0.7,
  },
});

export default EmptyContract;
