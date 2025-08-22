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
  }, [pdfUrl]);

  // Hàm kiểm tra và tạo thư mục nếu cần
  const ensureDirectoryExists = async (dirPath: string): Promise<boolean> => {
    try {
      const exists = await RNFS.exists(dirPath);
      if (!exists) {
        await RNFS.mkdir(dirPath);
        console.log('Created directory:', dirPath);
      }
      return true;
    } catch (error) {
      console.warn('Error creating directory:', error);
      return false;
    }
  };

  // Hàm lấy đường dẫn download phù hợp
  const getDownloadPath = async (filename: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'ios') {
        return `${RNFS.DocumentDirectoryPath}/${filename}`;
      }

      // Android - thử các đường dẫn khác nhau
      const androidVersion = Platform.Version;
      console.log('Android version:', androidVersion);

      // Đường dẫn 1: Thư mục Documents của app (luôn có quyền)
      const documentsPath = `${RNFS.DocumentDirectoryPath}/${filename}`;
      
      // Đường dẫn 2: External storage (nếu có quyền)
      let externalPath = null;
      if (androidVersion >= 29) {
        // Android 10+ - sử dụng scoped storage
        const externalDir = RNFS.ExternalDirectoryPath;
        if (externalDir) {
          externalPath = `${externalDir}/${filename}`;
        }
      } else {
        // Android < 10 - sử dụng Downloads folder
        const downloadDir = RNFS.DownloadDirectoryPath;
        if (downloadDir) {
          const dirExists = await ensureDirectoryExists(downloadDir);
          if (dirExists) {
            externalPath = `${downloadDir}/${filename}`;
          }
        }
      }

      // Thử external path trước, fallback về documents
      if (externalPath) {
        try {
          const dirExists = await ensureDirectoryExists(externalPath.substring(0, externalPath.lastIndexOf('/')));
          if (dirExists) {
            return externalPath;
          }
        } catch (error) {
          console.warn('Cannot use external path, falling back to documents:', error);
        }
      }

      return documentsPath;
    } catch (error) {
      console.warn('getDownloadPath error:', error);
      return `${RNFS.DocumentDirectoryPath}/${filename}`;
    }
  };

  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    const androidVersion = Platform.Version;
    
    // Android 10+ không cần WRITE_EXTERNAL_STORAGE cho app-specific directories
    if (androidVersion >= 29) {
      return true;
    }

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

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Permission request error:', err);
      return false; // Không có quyền nhưng vẫn có thể thử tải về Documents
    }
  };

  const handleDownloadPdf = async () => {
    try {
      if (!pdfLink) {
        showError('Không có file PDF để tải xuống.', 'Lỗi');
        return;
      }

      // Tạo tên file
      let filename = 'contract.pdf';
      if (pdfLink.includes('/')) {
        const parts = pdfLink.split('/');
        const urlFilename = parts[parts.length - 1];
        if (urlFilename && urlFilename.includes('.pdf')) {
          filename = urlFilename;
        }
      }

      // Thêm timestamp để tránh trùng lặp
      const timestamp = new Date().getTime();
      const nameWithoutExt = filename.replace('.pdf', '');
      filename = `${nameWithoutExt}_${timestamp}.pdf`;

      // Yêu cầu quyền nếu cần
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        console.warn('No storage permission, but will try to download to app directory');
      }

      // Lấy đường dẫn download
      const downloadPath = await getDownloadPath(filename);
      if (!downloadPath) {
        showError('Không thể xác định vị trí lưu file.', 'Lỗi');
        return;
      }

      console.log('Download path:', downloadPath);

      // Hiển thị thông báo đang tải
      showSuccess('Đang tải xuống PDF...', 'Thông báo', false);

      // Xóa file cũ nếu tồn tại
      try {
        const exists = await RNFS.exists(downloadPath);
        if (exists) {
          await RNFS.unlink(downloadPath);
          console.log('Deleted existing file:', downloadPath);
        }
      } catch (unlinkErr) {
        console.warn('Error deleting existing file:', unlinkErr);
      }

      // Tải file
      const downloadOptions = {
        fromUrl: pdfLink,
        toFile: downloadPath,
        background: true,
        discretionary: true,
        cacheable: false,
        progress: (res: any) => {
          const progress = res.contentLength
            ? (res.bytesWritten / res.contentLength) * 100
            : 0;
          console.log(`Download progress: ${progress.toFixed(2)}%`);
        },
      };

      const {promise} = RNFS.downloadFile(downloadOptions);
      const result = await promise;

      hideAlert();

      if (result.statusCode === 200) {
        // Kiểm tra file đã được tải thành công
        const fileExists = await RNFS.exists(downloadPath);
        if (!fileExists) {
          showError('File không được lưu thành công.', 'Lỗi');
          return;
        }

        const fileStats = await RNFS.stat(downloadPath);
        console.log('Downloaded file size:', fileStats.size);

        if (fileStats.size === 0) {
          showError('File tải về bị lỗi (kích thước 0).', 'Lỗi');
          return;
        }

        // Thông báo thành công
        const downloadLocation = downloadPath.includes('Documents') 
          ? 'thư mục Documents của ứng dụng' 
          : 'thư mục Download';

        if (Platform.OS === 'android') {
          ToastAndroid.show(`Tải xuống thành công vào ${downloadLocation}`, ToastAndroid.LONG);
        } else {
          showSuccess(`File PDF đã được tải xuống vào ${downloadLocation}.`, 'Thành công');
        }

        // Chuẩn bị chia sẻ
        const shareOptions = {
          title: 'Chia sẻ file PDF',
          message: 'Chia sẻ hợp đồng',
          url: Platform.OS === 'ios' ? downloadPath : `file://${downloadPath}`,
          type: 'application/pdf',
        };

        // Hiển thị dialog xác nhận mở file
        showConfirm(
          `File PDF đã được lưu vào ${downloadLocation}.\nBạn có muốn mở file không?`,
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
                  console.warn('Share error:', shareErr);
                  // Fallback: thử mở bằng cách khác
                  if (Platform.OS === 'android') {
                    ToastAndroid.show('Không thể mở file. Vui lòng tìm file trong trình quản lý file.', ToastAndroid.LONG);
                  }
                } finally {
                  hideAlert();
                }
              },
              style: 'default',
            },
          ],
        );
      } else {
        showError(`Không thể tải xuống file PDF. Status: ${result.statusCode}`, 'Lỗi');
      }
    } catch (error) {
      console.error('Download error:', error);
      hideAlert();
      let errorMessage = 'Đã xảy ra lỗi khi tải xuống file PDF.';
      if (error instanceof Error && error.message) {
        if (error.message.includes('ENOENT')) {
          errorMessage = 'Không thể truy cập thư mục lưu file. Thử lại sau.';
        } else if (error.message.includes('EACCES')) {
          errorMessage = 'Không có quyền ghi file. Kiểm tra quyền ứng dụng.';
        }
      }
      
      showError(errorMessage, 'Lỗi');
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