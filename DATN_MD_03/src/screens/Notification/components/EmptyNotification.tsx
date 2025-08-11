import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Icons } from '../../../assets/icons';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';
import { responsiveFont, responsiveSpacing, moderateScale } from '../../../utils/responsive';

const EmptyNotification = () => {
  return (
    <View style={styles.container}>
      {/* Icon */}
      <Image
        source={{uri: Icons.IconEmptyMessage}}
        style={styles.icon}
        resizeMode="contain"
      />

      {/* Tiêu đề chính */}
      <Text style={styles.title}>Hiện chưa có thông báo nào</Text>

      {/* Mô tả phụ */}
      <Text style={styles.subtitle}>Chúng tôi sẽ thông báo khi có điều gì mới</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(32),
    backgroundColor: Colors.backgroud,
  },
  icon: {
    width: moderateScale(166),
    height: moderateScale(166),
    marginBottom: responsiveSpacing(24),
  },
  title: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: responsiveSpacing(8),
  },
  subtitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: responsiveFont(20),
  },
});

export default EmptyNotification;
