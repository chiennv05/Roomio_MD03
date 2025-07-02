import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {ContainerLinearGradent} from '../../components';
import {
  responsiveFont,
  responsiveIcon,
  SCREEN,
  verticalScale,
} from '../../utils/responsive';
import {Colors} from '../../theme/color';
import {Images} from '../../assets/images';
import {Fonts} from '../../theme/fonts';
import Login from './components/Login';
import Register from './components/Register';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import CustomModal from './components/CustomModal';

export default function LoginAndRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [titleModal, setTitleModal] = useState('');
  const [iconModal, setIconModal] = useState('');

  const hanldeOpenModal = () => {
    setIsVisible(true);
  };
  const hanldeCloseModal = () => {
    setIsVisible(false);
  };

  const handleSetIsLogin = (value: boolean) => {
    setIsLogin(value);
  };
  const handleSetModal = (icon: any, title: string) => {
    setTitleModal(title);
    setIconModal(icon);
    hanldeOpenModal();
  };
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        style={styles.containerFlex}
        resetScrollToCoords={{x: 0, y: 0}}
        contentContainerStyle={styles.containerScrollview}
        enableOnAndroid={true}
        keyboardOpeningTime={0}>
        <ContainerLinearGradent>
          <Image
            source={{uri: Images.ImageRoomio}}
            style={styles.styleImageRoomio}
            resizeMode="contain"
          />
          <Text style={styles.textStart}>Bắt đầu cùng ROMIO ngay</Text>
          <Text style={styles.textTitle}>
            Đăng nhập để Roomio đồng hành cùng bạn để tìm nơi ở lý tưởng một
            cách dễ dàng
          </Text>
        </ContainerLinearGradent>
        <View style={styles.containerButtonLoginAndRegister}>
          <TouchableOpacity
            style={
              isLogin
                ? styles.buttonLoginAndRegisterChoose
                : styles.buttonLoginAndRegister
            }
            onPress={() => handleSetIsLogin(true)}>
            <Text
              style={
                isLogin
                  ? styles.textButtonLoginAndRegisterChoose
                  : styles.textButtonLoginAndRegister
              }>
              Đăng nhập
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={
              !isLogin
                ? styles.buttonLoginAndRegisterChoose
                : styles.buttonLoginAndRegister
            }
            onPress={() => handleSetIsLogin(false)}>
            <Text
              style={
                !isLogin
                  ? styles.textButtonLoginAndRegisterChoose
                  : styles.textButtonLoginAndRegister
              }>
              Đăng ký
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.containerViewLoginAndRegister}>
          {isLogin ? (
            <Login setModal={handleSetModal} />
          ) : (
            <Register setModal={handleSetModal} />
          )}
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
  containerFlex: {
    flex: 1,
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
    color: Colors.black,
  },
  textTitle: {
    fontSize: responsiveFont(17),
    fontFamily: Fonts.Roboto_Regular,
    width: SCREEN.width * 0.9,
    textAlign: 'center',
    marginTop: 10,
    color: Colors.darkGray,
  },
  containerButtonLoginAndRegister: {
    flexDirection: 'row',
    width: SCREEN.width * 0.9,
    backgroundColor: Colors.black,
    height: verticalScale(50),
    borderRadius: 30,
  },
  buttonLoginAndRegister: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonLoginAndRegisterChoose: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.limeGreen,
    borderRadius: 30,
    margin: 2,
  },
  textButtonLoginAndRegister: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
  },
  textButtonLoginAndRegisterChoose: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  containerViewLoginAndRegister: {},
  containerBirthdayPicker: {
    width: SCREEN.width,
    height: SCREEN.height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
  },
  modal: {
    height: SCREEN.height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCalendal: {
    height: 450,
  },
});
