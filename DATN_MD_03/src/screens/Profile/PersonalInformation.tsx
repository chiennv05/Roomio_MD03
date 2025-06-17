import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {updateProfile} from '../../store/slices/authSlice';
import type {AppDispatch} from '../../store';
import {SCREEN, responsiveFont, responsiveIcon, responsiveSpacing, scale, verticalScale} from '../../utils/responsive';
import {Colors} from '../../theme/color';
import IteminIrmation from './components/IteminFormation';
import { validateFullName, validatePhone, validateIdentityNumber } from '../../utils/validate';

export default function PersonalInformation() {
  const user = useSelector((state: any) => state.auth.user);
  const token = useSelector((state: any) => state.auth.token);
  const dispatch = useDispatch<AppDispatch>();

  // Chỉ lấy giá trị khởi tạo từ redux, không reset lại khi user đổi
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [identityNumber, setIdentityNumber] = useState(
    user?.identityNumber || '',
  );
  const [errorFullName, setErrorFullName] = useState('');
  const [errorPhone, setErrorPhone] = useState('');
  const [errorIdentityNumber, setErrorIdentityNumber] = useState('');

  const handleSave = async () => {
    // Validate
    const errFullName = validateFullName(fullName);
    const errPhone = validatePhone(phone);
    const errIdentityNumber = validateIdentityNumber(identityNumber);
    setErrorFullName(errFullName || '');
    setErrorPhone(errPhone || '');
    setErrorIdentityNumber(errIdentityNumber || '');
    if (errFullName || errPhone || errIdentityNumber) {
      return;
    }
    if (!token) {
      Alert.alert('Error', 'No token found!');
      return;
    }
    try {
      await dispatch(
        updateProfile({token, data: {fullName, phone, identityNumber}}),
      ).unwrap();
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      console.log('Update profile error:', err);
      Alert.alert('Error', 'Failed to update profile!');
    }
  };

  return (
    <View style={styles.container}>
      <IteminIrmation></IteminIrmation>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={fullName}
        onChangeText={text => { setFullName(text); setErrorFullName(''); }}
      />
      {errorFullName ? <Text style={{color: 'red', marginBottom: 4}}>{errorFullName}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={phone}
        onChangeText={text => { setPhone(text); setErrorPhone(''); }}
        keyboardType="phone-pad"
      />
      {errorPhone ? <Text style={{color: 'red', marginBottom: 4}}>{errorPhone}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Identity Number"
        value={identityNumber}
        onChangeText={text => { setIdentityNumber(text); setErrorIdentityNumber(''); }}
        keyboardType="number-pad"
      />
      {errorIdentityNumber ? <Text style={{color: 'red', marginBottom: 4}}>{errorIdentityNumber}</Text> : null}
      <TouchableOpacity style={styles.updateButton} onPress={handleSave}>
        <Text style={{fontWeight: 'bold', fontSize: responsiveFont(20)}}>
          Cập nhật
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN.width,
    height: SCREEN.height,
    backgroundColor: Colors.backgroud,
    alignItems: 'center',
  },

  input: {
    width: SCREEN.width * 0.9,
    borderWidth: responsiveFont(1),
    borderColor: Colors.gray,
    borderRadius: responsiveFont(50),
    padding: responsiveSpacing(12),
    marginBottom: responsiveSpacing(16),
    fontSize: responsiveFont(14),
  },
  updateButton: {
    width: SCREEN.width * 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.limeGreen,
    borderRadius: responsiveFont(50),
    padding: responsiveSpacing(12),
    marginTop: responsiveSpacing(16),
  },
});
