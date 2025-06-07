import {Button, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {responsiveFont, scale, SCREEN} from '../../../utils/responsive';
import ItemRadioButton from './ItemRadioButton';
import ItemInput from './ItemInput';
import {Fonts} from '../../../theme/fonts';
import {Colors} from '../../../theme/color';
import ItemButtonConfirm from './ItemButtonConfirm';
import DatePicker from 'react-native-date-picker';
const roleOptions = [
  {label: 'Người thuê', value: 'nguoiThue'},
  {label: 'Chủ trọ', value: 'chuTro'},
];

export default function Register() {
  const [selectedRole, setSelectedRole] = useState('nguoiThue');

  const [usename, setUsename] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [date, setDate] = useState(new Date());

  const [openDatePicker, setOpenDatePicker] = useState(false);

  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
  };
  console.log(selectedRole);

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
      />
      <ItemInput
        value={email}
        onChangeText={setEmail}
        placeholder={'Email'}
        isPass={false}
      />
      <ItemInput
        value={password}
        onChangeText={setPassword}
        placeholder={'Mật khẩu'}
        isPass={true}
      />
      <ItemInput
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder={'Nhập lại mật khẩu'}
        isPass={true}
      />
      <Button title="lll" onPress={() => setOpenDatePicker(true)} />
      <Text style={styles.textCondition}>
        Bằng việc nhấn vào xác nhận, bạn đồng ý với
        <Text style={styles.textConditionGreen}> điều khoản và điều kiện </Text>
        của Romio
      </Text>

      <DatePicker
        modal
        open={openDatePicker}
        date={date}
        mode="date"
        locale="vi"
        maximumDate={new Date()}
        onConfirm={selectedDate => {
          setOpenDatePicker(false);
          setDate(selectedDate);
        }}
        onCancel={() => {
          setOpenDatePicker(false);
        }}
      />
      <ItemButtonConfirm />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN.width * 0.9,
    paddingTop: 20,
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
