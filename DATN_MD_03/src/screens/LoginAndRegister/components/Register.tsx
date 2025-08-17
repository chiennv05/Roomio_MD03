import {StyleSheet, Text, View} from 'react-native';
import React, {useCallback, useState} from 'react';
import {responsiveFont, scale, SCREEN} from '../../../utils/responsive';
import ItemRadioButton from './ItemRadioButton';
import ItemInput from './ItemInput';
import {Fonts} from '../../../theme/fonts';
import {Colors} from '../../../theme/color';
import ItemButtonConfirm from './ItemButtonConfirm';
import {validateUserInputFirstError} from '../../../utils/validate';
import {useDispatch} from 'react-redux';
import {registerUser} from '../../../store/slices/authSlice';
import {AppDispatch} from '../../../store';
import {Icons} from '../../../assets/icons';
const roleOptions = [
  {label: 'Người thuê', value: 'nguoiThue'},
  {label: 'Chủ trọ', value: 'chuTro'},
];
interface ModalProps {
  setModal: (icon: any, title: string) => void;
}

export default function Register({setModal}: ModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedRole, setSelectedRole] = useState('nguoiThue');

  const [usename, setUsename] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
  };
  const handleRegister = async () => {
    const error = validateUserInputFirstError({
      username: usename,
      email,
      password,
      confirmPassword,
    });
    if (error) {
      setModal(Icons.IconError, error);
      return;
    }

    const newUser = {
      username: usename,
      email,
      password,
      confirmPassword,
      role: selectedRole,
    };

    try {
      const result = await dispatch(registerUser(newUser)).unwrap();
      console.log('result', result);
      setModal(Icons.IconCheck, 'Đăng ký thành công');
      setUsename('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setSelectedRole('nguoiThue');
    } catch (err: any) {
      setModal(Icons.IconError, err);
    }
  };

  const handleReset = useCallback(() => {
    setUsename('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setSelectedRole('nguoiThue');
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.containerRadioButton}>
        {roleOptions.map((option, index) => (
          <ItemRadioButton
            key={index}
            label={option.label}
            value={option.value}
            onPress={handleRoleChange}
            isSelected={selectedRole === option.value}
          />
        ))}
      </View>

      <ItemInput
        value={usename}
        onChangeText={setUsename}
        placeholder={'Tài khoản'}
        isPass={false}
        editable={true}
      />
      <ItemInput
        value={email}
        onChangeText={setEmail}
        placeholder={'Email'}
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
      <ItemInput
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder={'Nhập lại mật khẩu'}
        isPass={true}
        editable={true}
      />
      <Text style={styles.textCondition}>
        Bằng việc nhấn vào xác nhận, bạn đồng ý với
        <Text style={styles.textConditionGreen}> điều khoản và điều kiện </Text>
        của Roomio
      </Text>

      <ItemButtonConfirm
        onPress={handleRegister}
        title="Đăng ký"
        icon={Icons.IconReset}
        onPressIcon={handleReset}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN.width * 0.9,
    paddingTop: 20,
    paddingBottom: 100,
  },
  containerRadioButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
