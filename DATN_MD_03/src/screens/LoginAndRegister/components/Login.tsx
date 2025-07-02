import {StyleSheet, Text, View} from 'react-native';
import React, {useCallback, useState} from 'react';
import ItemInput from './ItemInput';
import {responsiveFont, scale, SCREEN} from '../../../utils/responsive';
import {Fonts} from '../../../theme/fonts';
import {Colors} from '../../../theme/color';
import ItemButtonConfirm from './ItemButtonConfirm';
import {validateUserLogin} from '../../../utils/validate';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../../../store';
import {loginUser} from '../../../store/slices/authSlice';
import {Icons} from '../../../assets/icons';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';

interface ModalProps {
  setModal: (icon: any, title: string) => void;
}

export default function Login({setModal}: ModalProps) {
  const route =
    useRoute<RouteProp<RootStackParamList, 'PersonalInformation'>>();

  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const {redirectTo, roomId} = route.params || {};
  const [usename, setUsename] = useState('');
  const [password, setPassword] = useState('');

  const hanleLogin = () => {
    const error = validateUserLogin({
      username: usename,
      password: password,
    });
    if (error) {
      setModal(Icons.IconError, error);
      return;
    }
    const user = {
      username: usename,
      password: password,
    };
    dispatch(loginUser(user))
      .unwrap()
      .then(() => {
        setModal(Icons.IconCheck, 'Đăng nhập thành công');
        if (redirectTo === 'DetailRoom' && roomId) {
          navigation.replace('DetailRoom', {roomId});
        } else {
          navigation.replace('UITab');
        }
      })
      .catch(errMessage => {
        setModal(Icons.IconError, errMessage);
      });
  };

  const handleResetPass = useCallback(() => {
    navigation.navigate('ForgotPassword');
  }, [navigation]);
  const handleReset = useCallback(() => {
    setUsename('');
    setPassword('');
  }, []);
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
        editable={true}
      />
      <ItemInput
        value={password}
        onChangeText={setPassword}
        placeholder={'Mật khẩu'}
        isPass={true}
        editable={true}
      />
      <Text style={styles.textForgotPassword} onPress={handleResetPass}>
        Quên mật khẩu
      </Text>
      <Text style={styles.textCondition}>
        Bằng việc nhấn vào xác nhận, bạn đồng ý với
        <Text style={styles.textConditionGreen}> điều khoản và điều kiện </Text>
        của Romio
      </Text>
      <ItemButtonConfirm
        onPress={hanleLogin}
        title="Đăng nhập"
        icon={Icons.IconReset}
        onPressIcon={handleReset}
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
