import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import { ContainerLinearGradent } from '../../components';
import {Icons} from '../../assets/icons';
import {Images} from '../../assets/images';
import {responsiveFont, responsiveIcon, SCREEN} from '../../utils/responsive';
import {Colors} from '../../theme/color';
import {Fonts} from '../../theme/fonts';
import ItemInput from './components/ItemInput';
import ItemButton from './components/ItemButton';
import {CommonActions, useNavigation, useRoute} from '@react-navigation/native';
import {validateResetPassword} from '../../utils/validate';
import {resetPassword} from '../../store/services/authService';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../types/route';
import CustomModal from './components/CustomModal';

export default function ResetPassWord() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const {email, resetToken} = route.params as {
    email: string;
    resetToken: string;
  };
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [titleModal, setTitleModal] = useState('');
  const [iconModal, setIconModal] = useState('');

  const hanldeOpenModal = () => {
    setIsVisible(true);
  };
  const hanldeCloseModal = () => {
    setIsVisible(false);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'Login'}],
      }),
    );
  };
  const handleSetModal = useCallback((icon: any, title: string) => {
    setTitleModal(title);
    setIconModal(icon);
    hanldeOpenModal();
  }, []);
  const handleGoBack = () => {
    navigation.goBack();
  };
  const handleConfirm = useCallback(async () => {
    const error = validateResetPassword(newPassword, confirmPassword);
    if (error) {
      handleSetModal(Icons.IconError, error);
      return;
    }
    try {
      const respondata = await resetPassword(email, resetToken, newPassword);
      console.log(respondata);
      handleSetModal(Icons.IconCheck, 'Đổi mật khẩu thành công');

      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      handleSetModal(Icons.IconError, err.message || 'Đổi mật khẩu thất bại');
    }
  }, [resetToken, email, newPassword, confirmPassword, handleSetModal]);
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        style={styles.containerFlex}
        resetScrollToCoords={{x: 0, y: 0}}
        contentContainerStyle={styles.containerScrollview}
        enableOnAndroid={true}
        keyboardOpeningTime={0}>
        <ContainerLinearGradent>
          <TouchableOpacity style={styles.styleButton} onPress={handleGoBack}>
            <Image
              source={{uri: Icons.IconArrowLeft}}
              style={styles.styleIconButton}
            />
          </TouchableOpacity>
          <Image
            source={{uri: Images.ImageRoomio}}
            style={styles.styleImageRoomio}
            resizeMode="contain"
          />
          <Text style={styles.textStart}>Quên mật khẩu</Text>
          <Text style={styles.textTitle}>
            Vui lòng nhập thông tin dưới đây để lấy lại mật khẩu của bạn để đăng
            nhập vào Roomio
          </Text>
        </ContainerLinearGradent>

        <View style={styles.containerInput}>
          <ItemInput
            value={newPassword}
            onChangeText={setNewPassword}
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
          <ItemButton onPress={handleConfirm} />
        </View>
        <CustomModal
          visible={isVisible}
          onPress={hanldeCloseModal}
          icon={iconModal}
          title={titleModal}
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerFlex: {
    flex: 1,
  },
  container: {
    width: SCREEN.width,
    height: SCREEN.height,
    backgroundColor: Colors.backgroud,
    alignItems: 'center',
  },
  containerScrollview: {
    width: SCREEN.width,
    flexGrow: 1,
    alignItems: 'center',
  },
  styleButton: {
    width: responsiveIcon(36),
    height: responsiveIcon(36),
    borderRadius: responsiveIcon(36) / 2,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: '10%',
    left: '5%',
  },
  styleIconButton: {
    width: responsiveIcon(24) / 2,
    height: responsiveIcon(24),
  },
  styleImageRoomio: {
    width: SCREEN.width * 0.45,
    height: (SCREEN.width * 0.45) / 5,
  },
  textStart: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
  },
  textTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    width: SCREEN.width * 0.9,
    textAlign: 'center',
    marginTop: 10,
    color: Colors.darkGray,
  },
  containerInput: {
    alignItems: 'center',
  },
});
