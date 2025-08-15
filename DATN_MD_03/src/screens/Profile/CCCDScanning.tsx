import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../types/route';
import {launchImageLibrary} from 'react-native-image-picker';
import BarcodeScanning from '@react-native-ml-kit/barcode-scanning';
import {
  responsiveFont,
  responsiveSpacing,
  scale,
  SCREEN,
} from '../../utils/responsive';
import {Colors} from '../../theme/color';
import {Icons} from '../../assets/icons';
import ItemIntroduct from './components/ItemIntroduct';
import {Images} from '../../assets/images';
import {Fonts} from '../../theme/fonts';
import ItemButtonGreen from '../../components/ItemButtonGreen';
import ModalLoading from '../ChuTro/AddRoom/components/ModalLoading';
import {HeaderWithBack} from '../../components';
import CustomAlertModal from '../../components/CustomAlertModal';
import LinearGradient from 'react-native-linear-gradient';

export default function CCCDScanning() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CCCDScanning'>>();
  const {redirectTo, roomId} = route.params || {};
  const [showCamera, setShowCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Alert modal state
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'error' | 'success' | 'warning' | 'info',
    buttons: [] as Array<{
      text: string;
      onPress: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>,
  });
  const scanAnimation = useRef(new Animated.Value(0)).current;
  const startScanAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [scanAnimation]);
  useEffect(() => {
    if (showCamera) {
      startScanAnimation();
    }
  }, [showCamera, startScanAnimation]);

  useEffect(() => {
    if (showCamera) {
      startScanAnimation(); // OK vì khai báo ở trên rồi
    }
  }, [showCamera, startScanAnimation]);

  const handleStartScanning = () => {
    setShowCamera(true);
  };

  const handleTakePhoto = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1,
      },
      async response => {
        if (response.didCancel) {
          return;
        } else if (response.errorCode) {
          setAlertConfig({
            visible: true,
            title: 'Lỗi',
            message: 'Không thể chọn ảnh. Vui lòng thử lại.',
            type: 'error',
            buttons: [{
              text: 'Đóng',
              style: 'default',
              onPress: () => setAlertConfig(prev => ({...prev, visible: false})),
            }],
          });
          return;
        } else if (response.assets && response.assets.length > 0) {
          const uri = response.assets[0].uri;
          if (!uri) {
            setAlertConfig({
              visible: true,
              title: 'Lỗi',
              message: 'Không tìm thấy ảnh. Vui lòng thử lại.',
              type: 'error',
              buttons: [{
                text: 'Đóng',
                style: 'default',
                onPress: () => setAlertConfig(prev => ({...prev, visible: false})),
              }],
            });
            return;
          }
          setIsScanning(true);

          try {
            const barcodes = await BarcodeScanning.scan(uri);

            if (barcodes.length > 0) {
              const rawData = barcodes[0].value;
              // Navigate to result screen with scanned data
              navigation.navigate('CCCDResult', {
                rawData,
                imageUri: uri,
                redirectTo: redirectTo || undefined,
                roomId: roomId || undefined,
              });
            } else {
              setAlertConfig({
                visible: true,
                title: 'Không tìm thấy QR',
                message: 'Không tìm thấy mã QR trong ảnh.',
                type: 'warning',
                buttons: [{
                  text: 'Đóng',
                  style: 'default',
                  onPress: () => setAlertConfig(prev => ({...prev, visible: false})),
                }],
              });
            }
          } catch (error) {
            console.error('QR detection failed:', error);
            setAlertConfig({
              visible: true,
              title: 'Lỗi',
              message: 'Không thể giải mã QR từ ảnh này.',
              type: 'error',
              buttons: [{
                text: 'Đóng',
                style: 'default',
                onPress: () => setAlertConfig(prev => ({...prev, visible: false})),
              }],
            });
          } finally {
            setIsScanning(false);
          }
        }
      },
    );
  };

  const handlePickFromLibrary = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1,
      },
      async response => {
        if (response.didCancel) {
          return;
        } else if (response.errorCode) {
          setAlertConfig({
            visible: true,
            title: 'Lỗi',
            message: 'Không thể chọn ảnh. Vui lòng thử lại.',
            type: 'error',
            buttons: [{
              text: 'Đóng',
              style: 'default',
              onPress: () => setAlertConfig(prev => ({...prev, visible: false})),
            }],
          });
          return;
        } else if (response.assets && response.assets.length > 0) {
          if (!response.assets[0].uri) {
            setAlertConfig({
              visible: true,
              title: 'Lỗi',
              message: 'Không tìm thấy ảnh. Vui lòng thử lại.',
              type: 'error',
              buttons: [{
                text: 'Đóng',
                style: 'default',
                onPress: () => setAlertConfig(prev => ({...prev, visible: false})),
              }],
            });
            return;
          }
          const uri = response.assets[0].uri;
          setIsScanning(true);

          try {
            const barcodes = await BarcodeScanning.scan(uri);

            if (barcodes.length > 0) {
              const rawData = barcodes[0].value;
              // Navigate to result screen with scanned data
              navigation.navigate('CCCDResult', {
                rawData,
                imageUri: uri,
                redirectTo: redirectTo || undefined,
                roomId: roomId || undefined,
              });
            } else {
              setAlertConfig({
                visible: true,
                title: 'Không tìm thấy QR',
                message: 'Không tìm thấy mã QR trong ảnh.',
                type: 'warning',
                buttons: [{
                  text: 'Đóng',
                  style: 'default',
                  onPress: () => setAlertConfig(prev => ({...prev, visible: false})),
                }],
              });
            }
          } catch (error) {
            console.error('QR detection failed:', error);
            setAlertConfig({
              visible: true,
              title: 'Lỗi',
              message: 'Không thể giải mã QR từ ảnh này.',
              type: 'error',
              buttons: [{
                text: 'Đóng',
                style: 'default',
                onPress: () => setAlertConfig(prev => ({...prev, visible: false})),
              }],
            });
          } finally {
            setIsScanning(false);
          }
        }
      },
    );
  };

  const instructionItems = [
    {
      image: Images.ImageCCCD1,
      title: 'Sửa dụng giấy tờ gốc, còn hạn sử dụng',
      description: '',
    },
    {
      image: Images.ImageCCCD2,
      title: 'Giữ giấy tờ nằm thẳng trong khung hình',
      description: '',
    },
    {
      image: Images.ImageCCCD3,
      title:
        'Chụp ảnh trong môi trường sáng, đầm bảo rõ nét, không bị lóa, mất góc',
      description: '',
    },
  ];

  if (showCamera) {
    return (
      <View style={styles.cameraMainContainer}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        {/* Camera Background */}
        <View style={styles.cameraBackground}>
          {/* Camera placeholder - thay bằng RNCamera nếu cần */}
          <View style={styles.cameraPlaceholder}>
            <Text style={styles.cameraPlaceholderText}>Camera View</Text>
          </View>
        </View>

        {/* Overlay Content */}
        <View style={styles.cameraOverlay}>
          {/* Header */}
          <SafeAreaView edges={['top']}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setShowCamera(false)}>
                <Image
                  source={{uri: Icons.IconArrowLeft}}
                  style={styles.backIcon}
                />
              </TouchableOpacity>
              <Text style={styles.cameraTitle}>Chụp mặt trước CCCD</Text>
              <View style={styles.backButton} />
            </View>
          </SafeAreaView>

          {/* Center Frame */}
          <View style={styles.frameCenterContainer}>
            <View style={styles.cameraFrame}>
              {/* Animated scan line */}
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [
                      {
                        translateY: scanAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, SCREEN.width * 0.5],
                        }),
                      },
                    ],
                  },
                ]}
              />
              {/* Corner indicators */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>

            {/* Instructions */}
            <View style={styles.instructionCard}>
              <Text style={styles.instructionTitle}>HƯỚNG DẪN</Text>
              <Text style={styles.instructionText}>
                • Đặt CCCD/CMND trong khung hình{'\n'}
                • Đảm bảo đủ ánh sáng và hình ảnh rõ nét{'\n'}
                • Tránh bóng và phản quang
              </Text>
            </View>
          </View>

          {/* Bottom controls */}
          <View style={styles.bottomControlsContainer}>
            <View style={styles.bottomControls}>
              {/* Library button */}
              <TouchableOpacity
                style={styles.sideButton}
                onPress={handlePickFromLibrary}>
                <View style={styles.sideButtonContent}>
                  <Image
                    source={{uri: Icons.IconAdd}}
                    style={styles.sideButtonIcon}
                  />
                </View>
                <Text style={styles.sideButtonText}>Thư viện</Text>
              </TouchableOpacity>

              {/* Capture button */}
              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleTakePhoto}>
                <View style={styles.captureButtonOuter}>
                  <View style={styles.captureButtonInner} />
                </View>
              </TouchableOpacity>

              {/* Cancel button */}
              <TouchableOpacity
                style={styles.sideButton}
                onPress={() => setShowCamera(false)}>
                <View style={styles.sideButtonContent}>
                  <Image
                    source={{uri: Icons.IconRemove}}
                    style={styles.sideButtonIcon}
                  />
                </View>
                <Text style={styles.sideButtonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#BAFD00', '#F4F4F4']}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={styles.gradientHeader}>
        <SafeAreaView edges={['top']}>
          <HeaderWithBack
            title="Xác thực tài khoản"
            backgroundColor="transparent"
          />
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      <View style={styles.container}>
        <Text style={styles.subtitle}>
          Chụp CCCD/CMND để xác minh tài khoản
        </Text>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          {instructionItems.map((item, index) => (
            <ItemIntroduct
              key={index}
              image={item.image || ''}
              title={item.title}
            />
          ))}
        </View>

        {/* Start button */}
        <View style={styles.buttonContainer}>
          <ItemButtonGreen
            title="Bắt đầu chụp"
            onPress={handleStartScanning}
          />
        </View>
        <ModalLoading loading={true} visible={isScanning} />
      </View>

      {/* Custom Alert Modal */}
      <CustomAlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig(prev => ({...prev, visible: false}))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  gradientHeader: {
    paddingBottom: responsiveSpacing(10),
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(20),
    paddingTop: responsiveSpacing(24),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(16),
    backgroundColor: '#BAFD00',
  },
  backButton: {
    padding: responsiveSpacing(8),
  },
  backIcon: {
    width: responsiveFont(12),
    height: responsiveFont(24),
    tintColor: Colors.white,
  },
  title: {
    fontSize: responsiveFont(18),
    fontWeight: 'bold',
    color: Colors.black,
    marginLeft: responsiveSpacing(16),
  },
  subtitle: {
    fontSize: responsiveFont(16),
    color: Colors.black,
    textAlign: 'center',
    marginBottom: responsiveSpacing(32),
    fontWeight: '700',
    fontFamily: Fonts.Roboto_Bold,
  },
  instructionsContainer: {
    flex: 1,
    width: '100%',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: responsiveSpacing(24),
  },
  iconContainer: {
    width: responsiveFont(40),
    height: responsiveFont(40),
    backgroundColor: '#F0F0F0',
    borderRadius: responsiveFont(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: responsiveSpacing(16),
  },
  iconEmoji: {
    fontSize: responsiveFont(20),
  },
  instructionTextCard: {
    flex: 1,
    fontSize: responsiveFont(14),
    color: Colors.black,
    lineHeight: responsiveFont(20),
  },
  buttonContainer: {
    paddingHorizontal: responsiveSpacing(20),
    paddingBottom: responsiveSpacing(24),
  },
  startButton: {
    backgroundColor: '#BAFD00',
    borderRadius: responsiveFont(12),
    paddingVertical: responsiveSpacing(16),
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: responsiveFont(16),
    fontWeight: 'bold',
    color: Colors.black,
  },
  // Camera styles
  cameraMainContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  cameraPlaceholderText: {
    color: '#666',
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Medium,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(12),
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  cameraTitle: {
    fontSize: responsiveFont(18),
    fontWeight: '600',
    color: Colors.white,
    fontFamily: Fonts.Roboto_Bold,
  },
  frameCenterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraFrame: {
    width: SCREEN.width * 0.85,
    height: SCREEN.width * 0.53,
    position: 'relative',
  },
  scanLine: {
    position: 'absolute',
    height: 2,
    width: '100%',
    backgroundColor: '#BAFD00',
    shadowColor: '#BAFD00',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#BAFD00',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  instructionCard: {
    marginTop: responsiveSpacing(30),
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(16),
    paddingHorizontal: responsiveSpacing(20),
    borderWidth: 1,
    borderColor: 'rgba(186, 253, 0, 0.3)',
  },
  instructionTitle: {
    fontSize: responsiveFont(14),
    fontWeight: '700',
    color: '#BAFD00',
    marginBottom: responsiveSpacing(8),
    textAlign: 'center',
    fontFamily: Fonts.Roboto_Bold,
  },
  instructionText: {
    fontSize: responsiveFont(12),
    color: Colors.white,
    lineHeight: responsiveFont(18),
    fontFamily: Fonts.Roboto_Regular,
  },
  bottomControlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: responsiveSpacing(30),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingTop: responsiveSpacing(20),
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(40),
  },
  sideButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: scale(60),
  },
  sideButtonContent: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: responsiveSpacing(6),
  },
  sideButtonIcon: {
    width: scale(24),
    height: scale(24),
    tintColor: Colors.white,
  },
  sideButtonText: {
    fontSize: responsiveFont(11),
    color: Colors.white,
    fontFamily: Fonts.Roboto_Medium,
    opacity: 0.9,
  },
  captureButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonOuter: {
    width: scale(76),
    height: scale(76),
    borderRadius: scale(38),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#BAFD00',
    shadowColor: '#BAFD00',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  captureButtonInner: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    backgroundColor: '#BAFD00',
  },
});
