import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  Text,
  ScrollView,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {updateProfile} from '../../store/slices/authSlice';
import type {AppDispatch} from '../../store';
import {
  responsiveFont,
  responsiveSpacing,
} from '../../utils/responsive';
import {Colors} from '../../theme/color';
import IteminIrmation from './components/IteminFormation';
import {
  validateFullName,
  validatePhone,
  validateIdentityNumber,
} from '../../utils/validate';

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
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#BAFD00" translucent={false} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <IteminIrmation />
          
          <View style={styles.formContainer}>
            <View style={styles.inputsContainer}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={fullName}
                onChangeText={text => {
                  setFullName(text);
                  setErrorFullName('');
                }}
              />
              {errorFullName ? (
                <Text style={styles.errorText}>{errorFullName}</Text>
              ) : null}
              
              <TextInput
                style={styles.input}
                placeholder="Phone"
                value={phone}
                onChangeText={text => {
                  setPhone(text);
                  setErrorPhone('');
                }}
                keyboardType="phone-pad"
              />
              {errorPhone ? (
                <Text style={styles.errorText}>{errorPhone}</Text>
              ) : null}
              
              <TextInput
                style={styles.input}
                placeholder="Identity Number"
                value={identityNumber}
                onChangeText={text => {
                  setIdentityNumber(text);
                  setErrorIdentityNumber('');
                }}
                keyboardType="number-pad"
              />
              {errorIdentityNumber ? (
                <Text style={styles.errorText}>
                  {errorIdentityNumber}
                </Text>
              ) : null}
            </View>
            
            <TouchableOpacity style={styles.updateButton} onPress={handleSave}>
              <Text style={styles.updateButtonText}>
                Cập nhật
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#BAFD00', // Màu xanh lá theo yêu cầu
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(20),
    paddingTop: responsiveSpacing(16),
    paddingBottom: responsiveSpacing(24),
  },
  inputsContainer: {
    width: '100%',
  },
  input: {
    width: '100%',
    borderWidth: responsiveFont(1),
    borderColor: Colors.gray,
    borderRadius: responsiveFont(50),
    padding: responsiveSpacing(14),
    marginBottom: responsiveSpacing(16),
    fontSize: responsiveFont(16),
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  errorText: {
    color: 'red', 
    marginBottom: responsiveSpacing(12),
    alignSelf: 'flex-start',
    fontSize: responsiveFont(12),
    marginTop: responsiveSpacing(-8),
  },
  updateButton: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.limeGreen,
    borderRadius: responsiveFont(50),
    padding: responsiveSpacing(16),
    marginTop: responsiveSpacing(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  updateButtonText: {
    fontWeight: 'bold', 
    fontSize: responsiveFont(18),
    color: Colors.black,
  },
});
