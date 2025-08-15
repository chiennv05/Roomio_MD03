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
import {RootState} from '../../../store';
export default function ProfileHeader() {
  const nguoiDung = useSelector((state: RootState) => state.auth.user);
  const currentPlan = useSelector(
    (state: RootState) => state.subscription.current?.plan,
  );
  const planLabel = (currentPlan || '').toUpperCase();

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
                nguoiDung?.username?.[0] ||
                '?'
              ).toUpperCase()}
            </Text>
          </View>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>{planLabel || 'FREE'}</Text>
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
    color: Colors.black,
  },
  avatarWrapper: {
    marginVertical: verticalScale(10),
    position: 'relative',
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
  planBadge: {
    position: 'absolute',
    right: -responsiveFont(10),
    bottom: 0,
    backgroundColor: '#0f172a',
    paddingHorizontal: responsiveFont(10),
    paddingVertical: responsiveFont(6) / 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  planBadgeText: {
    color: '#fff',
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(12),
    letterSpacing: 0.5,
  },
  email: {
    color: Colors.dearkOlive,
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Regular,
  },
});
