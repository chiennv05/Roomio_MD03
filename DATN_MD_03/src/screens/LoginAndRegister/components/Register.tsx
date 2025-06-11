import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {responsiveFont, scale, SCREEN} from '../../../utils/responsive';
import ItemRadioButton from './ItemRadioButton';
import ItemInput from './ItemInput';
import {Fonts} from '../../../theme/fonts';
import {Colors} from '../../../theme/color';
import ItemButtonConfirm from './ItemButtonConfirm';
import DatePicker from 'react-native-date-picker';
import {validateUserInputFirstError} from '../../../utils/validate';
import {useDispatch} from 'react-redux';
import {registerUser} from '../../../store/slices/authSlice';
import {AppDispatch} from '../../../store';
import {formatDate} from '../../../utils/formatDate';
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
  const [birthDay, setBirtDay] = useState('');
  const today = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() - 18);
  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - 100);
  const [date, setDate] = useState(maxDate);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
  };
  const handleRegister = async () => {
    const error = validateUserInputFirstError({
      username: usename,
      email,
      password,
      confirmPassword,
      birthDay: birthDay,
    });
    if (error) {
      setModal(Icons.IconError, error);
      return;
    }

    const formatDated = formatDate(birthDay);

    const newUser = {
      username: usename,
      email,
      password,
      confirmPassword,
      birthDate: formatDated,
      role: selectedRole,
    };

    try {
      const result = await dispatch(registerUser(newUser)).unwrap();
      console.log('result', result);
      setModal(Icons.IconCheck, 'Đăng ký thành công');
    } catch (err: any) {
      console.log('err', err);
      // lỗi chỗ này
      setModal(Icons.IconError, err);
    }
  };

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
        placeholder={'Username'}
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
      <TouchableOpacity onPress={() => setOpenDatePicker(true)}>
        <ItemInput
          value={birthDay}
          onChangeText={setBirtDay}
          placeholder={'Nhập ngày sinh'}
          isPass={false}
          editable={false}
        />
      </TouchableOpacity>
      <Text style={styles.textCondition}>
        Bằng việc nhấn vào xác nhận, bạn đồng ý với
        <Text style={styles.textConditionGreen}> điều khoản và điều kiện </Text>
        của Romio
      </Text>

      <DatePicker
        modal
        open={openDatePicker}
        date={date}
        title="Chọn ngày sinh"
        mode="date"
        locale="vi"
        maximumDate={maxDate}
        minimumDate={minDate}
        onConfirm={selectedDate => {
          console.log('🟢 onConfirm called');
          console.log('🟢 selectedDate:', selectedDate);

          if (selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
            setDate(selectedDate);
            setBirtDay(selectedDate.toLocaleDateString('vi-VN'));
          } else {
            console.warn(' selectedDate is null or invalid');
          }

          setOpenDatePicker(false);
        }}
        onCancel={() => {
          setOpenDatePicker(false);
        }}
      />
      <ItemButtonConfirm onPress={handleRegister} />
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
