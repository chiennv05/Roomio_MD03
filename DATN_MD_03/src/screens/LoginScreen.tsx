import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Pressable,
  SafeAreaView,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
// import Icon from '@react-native-vector-icons/Feather';
import {useDispatch, useSelector} from 'react-redux';
import {login, register} from '../redux/actions/authAction';
import {useNavigation} from '@react-navigation/native';
import {Icons} from '../assets/icons';

export default function LoginScreen() {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [dob, setDob] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [role, setRole] = useState('nguoiThue');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const dispatch = useDispatch<any>();
  const auth = useSelector((state: any) => state.auth);
  const navigation = useNavigation() as any;

  // Validate email
  function validateEmail(email: string) {
    const re = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return re.test(email);
  }
  // Validate password
  function validatePassword(password: string) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(
      password,
    );
  }
  // Validate username
  function validateUsername(username: string) {
    return username.length >= 3 && username.length <= 20;
  }

  // Đăng nhập
  const handleLogin = async () => {
    if (!validateUsername(loginUsername)) {
      setDialogMessage('Tên đăng nhập không hợp lệ');
      setDialogVisible(true);
      return;
    }
    if (!validatePassword(loginPassword)) {
      setDialogMessage('Mật khẩu không hợp lệ');
      setDialogVisible(true);
      return;
    }
    const result = await dispatch(
      login({username: loginUsername, password: loginPassword}),
    );
    if (result && result.success) {
      navigation.navigate('Home');
    }
  };

  // Đăng ký
  const handleRegister = () => {
    if (!validateEmail(email)) {
      setDialogMessage('Email không hợp lệ');
      setDialogVisible(true);
      return;
    }
    if (!validateUsername(registerUsername)) {
      setDialogMessage('Tên đăng nhập phải từ 3-20 ký tự');
      setDialogVisible(true);
      return;
    }
    if (!validatePassword(registerPassword)) {
      setDialogMessage(
        'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
      );
      setDialogVisible(true);
      return;
    }
    if (registerPassword !== confirmPassword) {
      setDialogMessage('Mật khẩu xác nhận không khớp');
      setDialogVisible(true);
      return;
    }
    if (!dob) {
      setDialogMessage('Vui lòng nhập ngày sinh');
      setDialogVisible(true);
      return;
    }
    if (!role) {
      setDialogMessage('Vui lòng chọn vai trò');
      setDialogVisible(true);
      return;
    }
    let apiRole = role;
    if (role === 'renter') apiRole = 'nguoiThue';
    if (role === 'owner') apiRole = 'chuTro';
    dispatch(
      register({
        email,
        password: registerPassword,
        username: registerUsername,
        role: apiRole,
        birthDate: dob,
      }),
    );
  };

  useEffect(() => {
    // Đăng nhập thành công
    if (auth.user && activeTab === 'login') {
      setDialogMessage('Đăng nhập thành công!');
      setDialogVisible(true);
      setTimeout(() => {
        setDialogVisible(false);
        navigation.reset({
          index: 0,
          routes: [{name: 'HomeScreen'}],
        });
      }, 1500);
    }
    // Đăng ký thành công
    if (auth.user && activeTab === 'register') {
      setDialogMessage('Đăng ký thành công!');
      setDialogVisible(true);
      setTimeout(() => {
        setDialogVisible(false);
        setActiveTab('login');
      }, 1500);
    }
    // Lỗi validate hoặc backend
    if (auth.error) {
      setDialogMessage(auth.error);
      setDialogVisible(true);
    }
  }, [auth.user, auth.error, activeTab, navigation]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F4F4F4'}}>
      <ScrollView
        contentContainerStyle={{paddingBottom: 100}}
        keyboardShouldPersistTaps="handled">
        {/* Gradient Header */}
        <LinearGradient
          colors={['#BAFD00', '#F4F4F4']}
          start={{x: 0.5, y: 0}}
          end={{x: 0.5, y: 1}}
          style={styles.headerGradient}>
          <TouchableOpacity style={styles.backBtn}>
            <Image
              source={{uri: Icons.IconArrowLeft}}
              style={{width: 12, height: 24}}
            />
          </TouchableOpacity>
          <Text style={styles.logo}>ROOMIO</Text>
          <Text style={styles.title}>Bắt đầu cùng ROMIO ngay</Text>
          <Text style={styles.subtitle}>
            Đăng nhập để Roomio đồng hành cùng bạn để tìm nơi ở lý tưởng một
            cách dễ dàng
          </Text>
        </LinearGradient>

        {/* Tab Đăng nhập / Đăng ký */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tabBtn, activeTab === 'login' && styles.tabActive]}
            onPress={() => setActiveTab('login')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'login' && styles.tabTextActive,
              ]}>
              Đăng nhập
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.tabBtn,
              activeTab === 'register' && styles.tabActive,
            ]}
            onPress={() => setActiveTab('register')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'register' && styles.tabTextActive,
              ]}>
              Đăng ký
            </Text>
          </Pressable>
        </View>

        {activeTab === 'login' && (
          <>
            <Text style={styles.infoText}>
              Vui lòng thêm các thông tin dưới đây để đăng nhập vào App Romio
              nhé
            </Text>
            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Tên đăng nhập"
                  placeholderTextColor="#B8B8B8"
                  value={loginUsername}
                  onChangeText={setLoginUsername}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Mật khẩu"
                  placeholderTextColor="#B8B8B8"
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                  <Text style={{fontSize: 20}}>{showPass ? '👁️' : '🙈'}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={{alignSelf: 'flex-start', marginLeft: 30}}>
              <Text style={styles.forgotText}>Quên mật khẩu?</Text>
            </TouchableOpacity>
            <Text style={styles.termText}>
              Bằng việc nhấn vào xác nhận, bạn đồng ý với{' '}
              <Text style={styles.termLink}>điều khoản và điều kiện</Text> của
              Romio
            </Text>

            {/* Button cố định dưới cùng */}
            <View style={styles.footerBtn}>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.roundBtn}>
                  {/* <Icon name="rotate-ccw" size={26} color="#fff" /> */}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handleLogin}
                  disabled={auth.loading}>
                  <Text style={styles.confirmText}>
                    {auth.loading ? 'Đang xử lý...' : 'Xác nhận'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {activeTab === 'register' && (
          <>
            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Tên đăng nhập"
                  placeholderTextColor="#B8B8B8"
                  value={registerUsername}
                  onChangeText={setRegisterUsername}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Ngày sinh (dd-mm-yy)"
                  placeholderTextColor="#B8B8B8"
                  value={dob}
                  onChangeText={setDob}
                />
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#B8B8B8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Mật khẩu"
                  placeholderTextColor="#B8B8B8"
                  value={registerPassword}
                  onChangeText={setRegisterPassword}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                  <Text style={{fontSize: 20}}>{showPass ? '👁️' : '🙈'}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Xác nhận mật khẩu"
                  placeholderTextColor="#B8B8B8"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPass}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPass(!showConfirmPass)}>
                  <Text style={{fontSize: 20}}>
                    {showConfirmPass ? '👁️' : '🙈'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioBtn}
                  onPress={() => setRole('nguoiThue')}>
                  <View
                    style={[
                      styles.radioCircle,
                      role === 'nguoiThue' && styles.radioChecked,
                    ]}
                  />
                  <Text style={styles.radioLabel}>Người thuê</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioBtn}
                  onPress={() => setRole('chuTro')}>
                  <View
                    style={[
                      styles.radioCircle,
                      role === 'chuTro' && styles.radioChecked,
                    ]}
                  />
                  <Text style={styles.radioLabel}>Chủ trọ</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Button cố định dưới cùng */}
            <View style={styles.footerBtn}>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.roundBtn}>
                  {/* <Icon name="rotate-ccw" size={26} color="#fff" /> */}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handleRegister}
                  disabled={auth.loading}>
                  <Text style={styles.confirmText}>
                    {auth.loading ? 'Đang xử lý...' : 'Xác nhận'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
      <Modal
        visible={dialogVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDialogVisible(false)}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}>
          <View
            style={{
              backgroundColor: '#fff',
              padding: 24,
              borderRadius: 12,
              minWidth: 260,
              alignItems: 'center',
            }}>
            <Text style={{fontSize: 16, marginBottom: 16, textAlign: 'center'}}>
              {dialogMessage}
            </Text>
            <TouchableOpacity
              onPress={() => setDialogVisible(false)}
              style={{
                backgroundColor: '#BAFD00',
                paddingHorizontal: 24,
                paddingVertical: 8,
                borderRadius: 8,
              }}>
              <Text style={{fontWeight: 'bold', color: '#191a15'}}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    height: 271,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 16,
    paddingBottom: 10,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  backBtn: {
    position: 'absolute',
    left: 15,
    top: 15,
    zIndex: 2,
    backgroundColor: '#fff',
    borderRadius: 100,
    padding: 5,
    width: 40,

    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    marginTop: 30,
    fontSize: 34,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#1A1A1A',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#1A1A1A',
    marginTop: 7,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#606060',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#17190F',
    borderRadius: 30,
    marginBottom: 12,
    width: '88%',
    padding: 5,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 0,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#BAFD00',
  },
  tabText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    padding: 5,
  },
  tabTextActive: {
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  infoText: {
    alignSelf: 'center',
    marginBottom: 16,
    color: '#4F4F4F',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 18,
  },
  inputGroup: {
    width: '100%',
    paddingHorizontal: 28,
    marginBottom: 10,
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 14,
    paddingHorizontal: 15,
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: '#212121',
  },
  forgotText: {
    color: '#4444444',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 10,
  },
  termText: {
    fontSize: 12,
    color: '#4444444',
    alignSelf: 'center',
    marginBottom: 5,
    paddingHorizontal: 35,
  },
  termLink: {
    color: '#BAFD00',
    textDecorationLine: 'underline',
  },
  footerBtn: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '88%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#191a15', // Màu viền ngoài (đen)
    borderRadius: 30,
    padding: 6,
  },
  roundBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#40403f',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#BAFD00',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontSize: 18,
    color: '#191a15',
    fontWeight: 'bold',
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#7A7A7A',
    marginRight: 5,
  },
  radioChecked: {
    backgroundColor: '#BAFD00',
  },
  radioLabel: {
    fontSize: 16,
    color: '#7A7A7A',
  },
});
