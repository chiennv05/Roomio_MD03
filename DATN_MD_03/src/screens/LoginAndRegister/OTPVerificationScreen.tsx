import {
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {ContainerLinearGradent} from '../../components';
import {Icons} from '../../assets/icons';
import {Images} from '../../assets/images';
import {
  responsiveFont,
  responsiveIcon,
  scale,
  SCREEN,
} from '../../utils/responsive';
import {Colors} from '../../theme/color';
import {Fonts} from '../../theme/fonts';
import ItemButton from './components/ItemButton';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import CountdownTimer from './components/CountdownTimer';
import {forgotPassword, verifyOTP} from '../../store/services/authService';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../types/route';
import CustomModal from './components/CustomModal';
import {validateEmail} from '../../utils/validate';
const autoComplete = Platform.select<TextInputProps['autoComplete']>({
  android: 'sms-otp',
  default: 'one-time-code',
});
const CELL_COUNT = 6;

export default function OTPVerificationScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const {email} = route.params as {email: string};
  const [value, setValue] = useState('');
  const [timerKey, setTimerKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [titleModal, setTitleModal] = useState('');
  const [iconModal, setIconModal] = useState('');

  const hanldeOpenModal = () => {
    setIsVisible(true);
  };
  const hanldeCloseModal = () => {
    setIsVisible(false);
  };
  const handleSetModal = useCallback((icon: any, title: string) => {
    setTitleModal(title);
    setIconModal(icon);
    hanldeOpenModal();
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };
  const handleOTPVerification = useCallback(async () => {
    if (value.length !== CELL_COUNT) {
      handleSetModal(Icons.IconError, 'Vui lòng nhập mã OTP');
      return;
    }

    try {
      const respondata = await verifyOTP(email, value);
      const {resetToken} = respondata.data;
      console.log(resetToken);
      navigation.navigate('ResetPassWord', {
        email: email,
        resetToken: resetToken,
      });
    } catch (error: any) {
      handleSetModal(Icons.IconError, error.message || 'Xác nhận thất bại');
    }
  }, [handleSetModal, navigation, email, value]);
  const handleGuilai = useCallback(async () => {
    if (!canResend || isLoading) {return;}

    const error = validateEmail(email);
    if (error) {
      handleSetModal(Icons.IconError, error);
      return;
    }
    setIsLoading(true);
    setCanResend(false);
    try {
      await forgotPassword(email); // gọi API forgot-password
      handleSetModal(Icons.IconCheck, 'Gửi mã OTP thành công');
      setTimerKey(prev => prev + 1);
      setTimeout(() => setCanResend(true), 30000);
    } catch (err: any) {
      handleSetModal(Icons.IconError, err.message || 'Đã xảy ra lỗi');
    } finally {
      setIsLoading(false);
    }
  }, [email, handleSetModal, canResend, isLoading]);
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
          <Text style={styles.textStart}>Xác nhận OTP</Text>
          <Text style={styles.textTitle}>
            Vui lòng nhập mã xác nhận OTP được gửi đến email {email}
          </Text>
        </ContainerLinearGradent>

        <View style={styles.containerInput}>
          <CodeField
            ref={ref}
            {...props}
            key={'code-field'}
            value={value}
            onChangeText={setValue}
            cellCount={CELL_COUNT}
            rootStyle={styles.codeFieldRoot}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete={autoComplete}
            testID="my-code-input"
            renderCell={({index, symbol, isFocused}) => (
              <View
                key={index}
                style={[styles.cell, isFocused && styles.focusCell]}>
                <Text
                  style={[styles.textSell, isFocused && styles.focusCell]}
                  onLayout={getCellOnLayoutHandler(index)}>
                  {symbol || (isFocused && <Cursor />)}
                </Text>
              </View>
            )}
          />
          <Text style={styles.textCondition} onPress={handleGuilai}>
            Không nhận được mã? Gửi lại{' '}
            <CountdownTimer key={timerKey} initialTime={300} />
          </Text>
          <ItemButton onPress={handleOTPVerification} loading={isLoading} />
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
    top: '30%',
    left: '5%',
  },
  styleIconButton: {
    width: responsiveIcon(24) / 2,
    height: responsiveIcon(24),
  },
  styleImageRoomio: {
    width: SCREEN.width * 0.45,
    height: (SCREEN.width * 0.45) / 5,
    marginTop: '20%',
  },
  textStart: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
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
  root: {flex: 1, padding: 20},
  title: {textAlign: 'center', fontSize: 30},
  codeFieldRoot: {marginTop: 20, width: SCREEN.width * 0.9},

  cell: {
    width: responsiveIcon(50),
    height: responsiveIcon(50),
    borderWidth: 1,
    borderColor: Colors.mediumGray,
    justifyContent: 'center',
    alignItems: 'center',
    color: '#000',
    borderRadius: 5,
  },
  textSell: {
    fontSize: responsiveFont(24),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    fontWeight: '600',
  },
  focusCell: {
    borderColor: '#000',
  },
  textCondition: {
    width: SCREEN.width * 0.9,
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.darkGray,
    marginTop: scale(10),
  },
});
