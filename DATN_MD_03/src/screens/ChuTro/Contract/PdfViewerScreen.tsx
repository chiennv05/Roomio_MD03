import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Platform,
  PermissionsAndroid,
  ToastAndroid,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Pdf from 'react-native-pdf';

import {RootStackParamList} from '../../../types/route';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {verticalScale, responsiveFont} from '../../../utils/responsive';
import {Icons} from '../../../assets/icons';
import {API_CONFIG} from '../../../configs';
import {UIHeader} from '../MyRoom/components';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import {useCustomAlert} from '../../../hooks/useCustomAlrert';
import {CustomAlertModal} from '../../../components';
import {Alert} from 'react-native';

type PdfViewerRouteProp = RouteProp<RootStackParamList, 'PdfViewer'>;
type PdfViewerNavigationProp = StackNavigationProp<RootStackParamList>;

const PdfViewerScreen = () => {
  const navigation = useNavigation<PdfViewerNavigationProp>();
  const route = useRoute<PdfViewerRouteProp>();
  const {
    alertConfig,
    visible: alertVisible,
    hideAlert,
    showSuccess,
    showError,
    showConfirm,
  } = useCustomAlert();

  const {pdfUrl} = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [pdfLink, setPdfLink] = useState<string | null>(null);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const getValidPdfUrl = async (
    relativeUrl: string,
  ): Promise<string | null> => {
    try {
      const fullUrl = `${API_CONFIG.BASE_URL}${relativeUrl}`;
      console.log('link pdf', fullUrl);
      const response = await fetch(fullUrl, {
        method: 'HEAD',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      if (
        response.ok &&
        response.headers.get('Content-Type')?.includes('pdf')
      ) {
        return fullUrl;
      }
      return null;
    } catch (error) {
      console.warn('getValidPdfUrl error', error);
      return null;
    }
  };

  useEffect(() => {
    const loadPdf = async () => {
      setIsLoading(true);
      const url = await getValidPdfUrl(pdfUrl);
      if (url) {
        setPdfLink(url);
      } else {
        Alert.alert('Không thể tải file PDF.', 'Lỗi');
      }
      setIsLoading(false);
    };
    loadPdf();
  }, [pdfUrl]); // pdfUrl từ route param

  const handleDownloadPdf = async () => {
    try {
      if (!pdfLink) {
        showError('Không có file PDF để tải xuống.', 'Lỗi');
        return;
      }

      // Create filename
      let filename = 'contract.pdf';
      if (pdfLink.includes('/')) {
        const parts = pdfLink.split('/');
        const urlFilename = parts[parts.length - 1];
        if (urlFilename && urlFilename.includes('.pdf')) {
          filename = urlFilename;
        }
      }

      // Permissions (Android < 10)
      if (Platform.OS === 'android') {
        const androidVersion = Platform.Version;
        if (androidVersion < 29) {
          try {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
              {
                title: 'Quyền truy cập bộ nhớ',
                message: 'Ứng dụng cần quyền truy cập bộ nhớ để tải file PDF.',
                buttonNeutral: 'Hỏi lại sau',
                buttonNegative: 'Từ chối',
                buttonPositive: 'Đồng ý',
              },
            );

            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
              showError(
                'Bạn cần cấp quyền truy cập bộ nhớ để tải file PDF.',
                'Thông báo',
              );
              return;
            }
          } catch (err) {
            console.warn('permission request error', err);
            // tiếp tục cố gắng tải — có thiết bị gặp lỗi API permission
          }
        } else {
          console.log(
            'Android 10+ (API 29+): không cần WRITE_EXTERNAL_STORAGE cho thư mục app',
          );
        }
      }

      // Set download path
      let downloadPath: string;
      if (Platform.OS === 'ios') {
        downloadPath = `${RNFS.DocumentDirectoryPath}/${filename}`;
      } else {
        downloadPath = `${RNFS.DownloadDirectoryPath}/${filename}`;
      }

      // Hiện alert download (không tự ẩn)
      showSuccess('Đang tải xuống PDF...', 'Thông báo', false);

      // Nếu muốn đảm bảo không dùng file cũ khi đặt cùng tên, xóa file cũ nếu tồn tại
      try {
        const exists = await RNFS.exists(downloadPath);
        if (exists) {
          try {
            await RNFS.unlink(downloadPath);
            console.log('Deleted old file before download:', downloadPath);
          } catch (unlinkErr) {
            console.warn('unlink error', unlinkErr);
          }
        }
      } catch (existsErr) {
        console.warn('RNFS.exists error', existsErr);
      }

      const {promise} = RNFS.downloadFile({
        fromUrl: pdfLink,
        toFile: downloadPath,
        background: true,
        discretionary: true,
        progress: res => {
          // Optional: bạn có thể cập nhật progress state nếu cần
          const progress = res.contentLength
            ? (res.bytesWritten / res.contentLength) * 100
            : 0;
          console.log(`Download progress: ${progress.toFixed(2)}%`);
        },
      });

      const result = await promise;

      // Ẩn alert "Đang tải" trước khi show kết quả
      hideAlert();

      if (result.statusCode === 200) {
        if (Platform.OS === 'android') {
          ToastAndroid.show('Tải xuống thành công', ToastAndroid.LONG);
        } else {
          showSuccess('File PDF đã được tải xuống.', 'Thành công');
        }

        const shareOptions = {
          title: 'Chia sẻ file PDF',
          message: 'Chia sẻ hợp đồng',
          url: `file://${downloadPath}`,
          type: 'application/pdf',
        };

        // Dùng showConfirm với nút tuỳ chỉnh "Không" / "Mở file"
        showConfirm(
          'File PDF đã được tải xuống. Bạn có muốn mở file không?',
          () => {}, // onConfirm không dùng vì ta truyền customButtons
          'Thành công',
          [
            {
              text: 'Không',
              onPress: () => {
                hideAlert();
              },
              style: 'cancel',
            },
            {
              text: 'Mở file',
              onPress: async () => {
                try {
                  await Share.open(shareOptions);
                } catch (shareErr) {
                } finally {
                  hideAlert();
                }
              },
              style: 'default',
            },
          ],
        );
      } else {
        showError('Không thể tải xuống file PDF. Vui lòng thử lại sau.', 'Lỗi');
      }
    } catch (error) {
      console.error('Download error:', error);
      hideAlert(); // ẩn nếu đang hiển thị cảnh báo trước đó
      showError('Đã xảy ra lỗi khi tải xuống file PDF.', 'Lỗi');
    }
  };
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} translucent />
      <View style={[styles.headerContainer, { marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
        <UIHeader
          title="Xem hợp đồng PDF"
          iconLeft={Icons.IconArrowLeft}
          onPressLeft={handleGoBack}
          iconRight={Icons.IconDownLoad}
          onPressRight={handleDownloadPdf}
        />
      </View>

      <View style={styles.pdfContainer}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.darkGreen} />
            <Text style={styles.loadingText}>Đang tải PDF...</Text>
          </View>
        )}

        {!isLoading && pdfLink && (
          <Pdf
            source={{uri: pdfLink, cache: false}}
            style={styles.pdf}
            onLoadComplete={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              showError('Không thể hiển thị PDF.', 'Lỗi');
            }}
            trustAllCerts={false}
            enablePaging
            enableAnnotationRendering
          />
        )}
      </View>

      {alertConfig && (
        <CustomAlertModal
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={hideAlert}
          type={alertConfig.type}
          buttons={alertConfig.buttons}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  pdfContainer: {
    flex: 1,
    position: 'relative',
    width: '100%',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 60,
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1,
  },
  loadingText: {
    marginTop: verticalScale(10),
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(14),
    color: Colors.textGray,
  },
  headerContainer: {
    backgroundColor: Colors.white,
    width: '100%',
    alignItems: 'center',
    paddingBottom: 10,
  },
});

export default PdfViewerScreen;
