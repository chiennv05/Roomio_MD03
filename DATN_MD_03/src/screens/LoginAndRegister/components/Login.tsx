import {StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import ItemInput from './ItemInput';
import {responsiveFont, SCREEN} from '../../../utils/responsive';
import {Fonts} from '../../../theme/fonts';
import {Colors} from '../../../theme/color';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <View style={styles.container}>
      <Text style={styles.textTitle}>
        Vui lòng thêm các thông tin dưới đây để đăng nhập vào App Romio nhé
      </Text>
      <ItemInput
        value={email}
        onChangeText={setEmail}
        placeholder={'Email'}
        isPass={false}
      />
      <ItemInput
        value={password}
        onChangeText={setPassword}
        placeholder={'Password'}
        isPass={true}
      />
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
});
