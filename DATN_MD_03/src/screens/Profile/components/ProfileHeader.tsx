import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import ContainerLinearGradent from '../../../components/ContainerLinearGradent';
import {useSelector} from 'react-redux';
import {
  responsiveFont,
  responsiveSpacing,
  verticalScale,
} from '../../../utils/responsive';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
export default function ProfileHeader() {
  const nguoiDung = useSelector((state: any) => state.auth.user);
  return (
    <ContainerLinearGradent>
      <View style={styles.header}>
        <Text style={styles.name}>
          {nguoiDung?.fullName || nguoiDung?.username || 'Chưa có tên'}
        </Text>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {(
                nguoiDung?.fullName?.[0] ||
                nguoiDung?.fullName?.[0] ||
                '?'
              ).toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.email}>{nguoiDung?.email || 'Chưa có email'}</Text>
      </View>
    </ContainerLinearGradent>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomLeftRadius: responsiveFont(25),
    borderBottomRightRadius: responsiveFont(25),
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: responsiveSpacing(50),
    paddingBottom: responsiveSpacing(20),
  },
  name: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(18),
  },
  avatarWrapper: {
    marginVertical: verticalScale(10),
  },
  avatar: {
    width: responsiveFont(100),
    height: responsiveFont(100),
    borderRadius: responsiveFont(90),
  },
  avatarCircle: {
    width: responsiveFont(100),
    height: responsiveFont(100),
    borderRadius: responsiveFont(90),
    backgroundColor: Colors.colorAvata,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: responsiveFont(40),
    color: Colors.white,
    fontFamily: Fonts.Roboto_Bold,
  },
  email: {
    color: '#444',
  },
});
