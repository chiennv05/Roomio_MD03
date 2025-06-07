import {StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import ItemInput from './ItemInput';
import {responsiveFont, scale, SCREEN} from '../../../utils/responsive';
import {Fonts} from '../../../theme/fonts';
import {Colors} from '../../../theme/color';
import ItemButtonConfirm from './ItemButtonConfirm';

export default function Login() {
  const [usename, setUsename] = useState('');
  const [password, setPassword] = useState('');
  return (
    <View style={styles.container}>
      <Text style={styles.textTitle}>
        Vui lòng thêm các thông tin dưới đây để đăng nhập vào App Romio nhé
      </Text>
      <ItemInput
        value={usename}
        onChangeText={setUsename}
        placeholder={'Username'}
        isPass={false}
      />
      <ItemInput
        value={password}
        onChangeText={setPassword}
        placeholder={'Mật khẩu'}
        isPass={true}
      />
      <Text style={styles.textForgotPassword}>Quên mật khẩu</Text>
      <Text style={styles.textCondition}>
        Bằng việc nhấn vào xác nhận, bạn đồng ý với
        <Text style={styles.textConditionGreen}> điều khoản và điều kiện </Text>
        của Romio
      </Text>
      <ItemButtonConfirm />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN.width * 0.9,
  },
  textTitle: {
    fontSize: responsiveFont(17),
    fontFamily: Fonts.Roboto_Regular,
    width: SCREEN.width * 0.9,
    textAlign: 'center',
    marginTop: 10,
    color: Colors.darkGray,
  },
  textForgotPassword: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.dearkOlive,
    marginVertical: scale(10),
  },
  textCondition: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.darkGray,
    marginTop: scale(10),
    marginBottom: scale(50),
  },
  textConditionGreen: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.primaryGreen,
  },
});
