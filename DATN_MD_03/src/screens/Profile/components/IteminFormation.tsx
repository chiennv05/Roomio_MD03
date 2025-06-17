import React from 'react';
import {Text, StyleSheet, View, TouchableOpacity, Image} from 'react-native';
import ContainerLinearGradent from '../../../components/ContainerLinearGradent';
import {useSelector} from 'react-redux';
import {SCREEN, responsiveFont, responsiveIcon, responsiveSpacing, scale, verticalScale} from '../../../utils/responsive';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {useNavigation} from '@react-navigation/native';
import { Icons } from '../../../assets/icons';

export default function IteminIrmation() {
  const nguoiDung = useSelector((state: any) => state.auth.user);
  const navigation = useNavigation();

  return (
    <ContainerLinearGradent >

      <View style={[styles.header, {position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Image source={{uri: Icons.IconOut}} style={{width: responsiveFont(24), height: responsiveFont(24)}} resizeMode="contain" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        <View style={styles.backButton2}/>
      </View>

      <View style={[styles.avatarWrapper, {marginTop: 80}]}>
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
    </ContainerLinearGradent>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: responsiveSpacing(16),
    paddingHorizontal: scale(16),
    paddingBottom: responsiveSpacing(10),
  },
  backButton: { 
    width: responsiveFont(36),
    height: responsiveFont(36),
    borderRadius: responsiveFont(18),
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
 
  },
  headerTitle: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    flex: 1,
    textAlign: 'center'
   
  },
  backButton2: {
    width: responsiveFont(36),
    height: responsiveFont(36),
  },
  avatarWrapper: {
    alignItems: 'center',
    marginTop: responsiveSpacing(20),
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
});
