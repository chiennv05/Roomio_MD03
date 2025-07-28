import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  Text,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {updateProfile} from '../../store/slices/authSlice';
import type {AppDispatch} from '../../store';
import {responsiveFont, responsiveSpacing} from '../../utils/responsive';
import {Colors} from '../../theme/color';
import IteminIrmation from './components/IteminFormation';
import {
  validateFullName,
  validatePhone,
  validateIdentityNumber,
} from '../../utils/validate';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../types/route';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function PersonalInformation() {
  const route =
    useRoute<RouteProp<RootStackParamList, 'PersonalInformation'>>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const {redirectTo, roomId} = route.params || {};
  const user = useSelector((state: any) => state.auth.user);
  const token = useSelector((state: any) => state.auth.token);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Debug: Log thông tin user để kiểm tra
    console.log('User from Redux:', user);
    console.log('User address:', user?.address);
  }, [user]);

  // Chỉ lấy giá trị khởi tạo từ redux, không reset lại khi user đổi
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [identityNumber, setIdentityNumber] = useState(
    user?.identityNumber || '',
  );
  const [address, setAddress] = useState(user?.address || '');
  
  // Xử lý ngày sinh
  const initialDate = user?.birthDate ? new Date(user.birthDate) : new Date(2000, 0, 1);
  const [birthDate, setBirthDate] = useState<Date>(initialDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [errorFullName, setErrorFullName] = useState('');
  const [errorPhone, setErrorPhone] = useState('');
  const [errorIdentityNumber, setErrorIdentityNumber] = useState('');
  const [errorAddress, setErrorAddress] = useState('');

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSave = async () => {
    // Validate
    const errFullName = validateFullName(fullName);
    const errPhone = validatePhone(phone);
    const errIdentityNumber = validateIdentityNumber(identityNumber);
    setErrorFullName(errFullName || '');
    setErrorPhone(errPhone || '');
    setErrorIdentityNumber(errIdentityNumber || '');
    
    // Kiểm tra địa chỉ có trống không
    if (!address.trim()) {
      setErrorAddress('Địa chỉ không được để trống');
      return;
    } else {
      setErrorAddress('');
    }
    
    if (errFullName || errPhone || errIdentityNumber) {
      return;
    }
    if (!token) {
      Alert.alert('Error', 'No token found!');
      return;
    }
    try {
      const success = await dispatch(
        updateProfile({
          token, 
          data: {
            fullName, 
            phone, 
            identityNumber,
            address,
            birthDate: birthDate.toISOString(),
          }
        }),
      ).unwrap();
      if (success) {
        if (redirectTo === 'DetailRoom' && roomId) {
          navigation.replace('DetailRoom', {roomId});
        } else {
          Alert.alert('Thành công', 'Cập nhật thông tin thành công!');
        }
      }
    } catch (err) {
      console.log('Update profile error:', err);
      Alert.alert('Error', 'Failed to update profile!');
    }
  };

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#BAFD00"
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <IteminIrmation />

          <View style={styles.formContainer}>
            <View style={styles.inputsContainer}>
              <TextInput
                style={styles.input}
                placeholder="Họ và tên"
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
                placeholder="Số điện thoại"
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
                placeholder="CMND/CCCD"
                value={identityNumber}
                onChangeText={text => {
                  setIdentityNumber(text);
                  setErrorIdentityNumber('');
                }}
                keyboardType="number-pad"
              />
              {errorIdentityNumber ? (
                <Text style={styles.errorText}>{errorIdentityNumber}</Text>
              ) : null}
              
              {/* Trường nhập địa chỉ */}
              <TextInput
                style={styles.input}
                placeholder="Địa chỉ"
                value={address}
                onChangeText={text => {
                  setAddress(text);
                  setErrorAddress('');
                }}
                multiline={true}
                numberOfLines={3}
              />
              {errorAddress ? (
                <Text style={styles.errorText}>{errorAddress}</Text>
              ) : null}
              
              {/* Debug text để hiển thị thông tin address từ Redux */}
              {__DEV__ && (
                <Text style={{color: 'blue', marginBottom: 10}}>
                  Debug - Address from Redux: {user?.address || 'Không có'}
                </Text>
              )}
              
              {/* Trường chọn ngày sinh */}
              <TouchableOpacity 
                style={styles.input} 
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {`Ngày sinh: ${formatDate(birthDate)}`}
                </Text>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={birthDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()} // Không cho chọn ngày trong tương lai
                />
              )}
            </View>

            <TouchableOpacity style={styles.updateButton} onPress={handleSave}>
              <Text style={styles.updateButtonText}>Cập nhật</Text>
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
  dateText: {
    fontSize: responsiveFont(16),
    color: '#333',
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
