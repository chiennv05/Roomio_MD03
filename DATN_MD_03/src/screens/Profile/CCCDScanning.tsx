import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
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
  SCREEN,
} from '../../utils/responsive';
import {Colors} from '../../theme/color';
import {Icons} from '../../assets/icons';
import ItemIntroduct from './components/ItemIntroduct';
import {Images} from '../../assets/images';
import {UIHeader} from '../ChuTro/MyRoom/components';
import {Fonts} from '../../theme/fonts';
import ItemButtonGreen from '../../components/ItemButtonGreen';
import ModalLoading from '../ChuTro/AddRoom/components/ModalLoading';

export default function CCCDScanning() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CCCDScanning'>>();
  const {redirectTo, roomId} = route.params || {};
  const [showCamera, setShowCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
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
          Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
          return;
        } else if (response.assets && response.assets.length > 0) {
          const uri = response.assets[0].uri;
          if (!uri) {
            Alert.alert('Lỗi', 'Không tìm thấy ảnh. Vui lòng thử lại.');
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
              Alert.alert(
                'Không tìm thấy QR',
                'Không tìm thấy mã QR trong ảnh.',
              );
            }
          } catch (error) {
            console.error('QR detection failed:', error);
            Alert.alert('Lỗi', 'Không thể giải mã QR từ ảnh này.');
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
          Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
          return;
        } else if (response.assets && response.assets.length > 0) {
          if (!response.assets[0].uri) {
            Alert.alert('Lỗi', 'Không tìm thấy ảnh. Vui lòng thử lại.');
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
              Alert.alert(
                'Không tìm thấy QR',
                'Không tìm thấy mã QR trong ảnh.',
              );
            }
          } catch (error) {
            console.error('QR detection failed:', error);
            Alert.alert('Lỗi', 'Không thể giải mã QR từ ảnh này.');
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
      <>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#000000"
          translucent={false}
        />
        <SafeAreaView style={styles.cameraContainer} edges={['top']}>
          {/* Header */}
          <View style={styles.cameraHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowCamera(false)}>
              <Image
                source={{uri: Icons.IconArrowLeft}}
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <Text style={styles.cameraTitle}>Xác thực tài khoản</Text>
          </View>

          {/* Camera View */}
          <View style={styles.cameraViewContainer}>
            <View style={styles.cameraFrame}>
              {/* Scanning overlay */}
              <View style={styles.scanningOverlay}>
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      transform: [
                        {
                          translateY: scanAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 200],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              </View>

              {/* Corner indicators */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>

            {/* Instruction overlay */}
            <View style={styles.instructionOverlay}>
              <Text style={styles.instructionTitle}>CHỤP MẶT TRƯỚC</Text>
              <View style={styles.noteContainer}>
                <Text style={styles.noteLabel}>Lưu ý</Text>
                <Text style={styles.noteText}>
                  Đặt CCCD/CMND trên mặt phẳng với đủ độ sáng và chụp ảnh rõ nét
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom controls */}
          <View style={styles.bottomControls}>
            {/* Library button */}
            <TouchableOpacity
              style={styles.libraryButton}
              onPress={handlePickFromLibrary}>
              <Text style={styles.libraryButtonText}>Thư viện</Text>
            </TouchableOpacity>

            {/* Capture button */}
            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleTakePhoto}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            {/* Placeholder for symmetry */}
            <View style={styles.libraryButton} />
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.white}
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          {/* Header */}
          <UIHeader
            title="Xác thực tài khoản"
            iconLeft={Icons.IconArrowLeft}
            onPressLeft={() => navigation.goBack()}
          />

          {/* Content */}
          <View style={styles.content}>
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
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#BAFD00',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
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
    width: responsiveFont(24),
    height: responsiveFont(24),
    tintColor: Colors.black,
  },
  title: {
    fontSize: responsiveFont(18),
    fontWeight: 'bold',
    color: Colors.black,
    marginLeft: responsiveSpacing(16),
  },
  content: {
    flex: 1,
    paddingHorizontal: responsiveSpacing(20),
    paddingTop: responsiveSpacing(24),
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
  instructionText: {
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
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(16),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cameraTitle: {
    fontSize: responsiveFont(18),
    fontWeight: 'bold',
    color: 'white',
    marginLeft: responsiveSpacing(16),
  },
  cameraViewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraFrame: {
    width: SCREEN.width * 0.8,
    height: SCREEN.width * 0.5,
    position: 'relative',
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  scanLine: {
    height: 2,
    backgroundColor: '#BAFD00',
    width: '100%',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#BAFD00',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructionOverlay: {
    position: 'absolute',
    top: -80,
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: responsiveFont(18),
    fontWeight: 'bold',
    color: 'white',
    marginBottom: responsiveSpacing(16),
  },
  noteContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: responsiveFont(8),
    padding: responsiveSpacing(12),
    maxWidth: SCREEN.width * 0.8,
  },
  noteLabel: {
    fontSize: responsiveFont(14),
    fontWeight: 'bold',
    color: '#BAFD00',
    marginBottom: responsiveSpacing(4),
  },
  noteText: {
    fontSize: responsiveFont(12),
    color: 'white',
    textAlign: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(40),
    paddingVertical: responsiveSpacing(40),
  },
  libraryButton: {
    paddingHorizontal: responsiveSpacing(20),
    paddingVertical: responsiveSpacing(12),
    borderRadius: responsiveFont(20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  libraryButtonText: {
    fontSize: responsiveFont(14),
    color: 'white',
    fontWeight: '500',
  },
  captureContainer: {
    alignItems: 'center',
    paddingVertical: responsiveSpacing(40),
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#BAFD00',
  },
});
