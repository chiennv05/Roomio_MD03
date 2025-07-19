import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Platform,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Pdf from 'react-native-pdf';
import {Icons} from '../../../assets/icons';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {
  scale,
  verticalScale,
  responsiveFont,
  SCREEN,
} from '../../../utils/responsive';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import CustomAlertModal from '../../../components/CustomAlertModal';
import {useCustomAlert} from '../../../hooks/useCustomAlrert';

const PdfViewerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {pdfUrl} = route.params as {pdfUrl: string};

  const [loading, setLoading] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const {
    alertConfig,
    visible: alertVisible,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showConfirm,
  } = useCustomAlert();

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleLoadComplete = () => {
    setLoading(false);
  };

  const handleError = (error: any) => {
    console.error('PDF loading error:', error);
    setPdfError(error.message || 'Không thể tải file PDF');
    setLoading(false);
  };

  const checkPermission = async () => {
    if (Platform.OS === 'ios') {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Quyền lưu trữ',
          message: 'Ứng dụng cần quyền truy cập bộ nhớ để tải file PDF.',
          buttonNeutral: 'Hỏi lại sau',
          buttonNegative: 'Hủy',
          buttonPositive: 'Đồng ý',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const downloadPdf = async () => {
    if (!pdfUrl) {
      showError('Không có file PDF để tải xuống.', 'Lỗi', true);
      return;
    }

    const hasPermission = await checkPermission();
    if (!hasPermission) {
      showError('Bạn cần cấp quyền truy cập bộ nhớ để tải file PDF.', 'Lỗi quyền truy cập', true);
      return;
    }

    try {
      setIsDownloading(true);
      showSuccess('Đang tải xuống PDF...', 'Thông báo', false);

      // Tạo tên file dựa trên URL hoặc timestamp
      const timestamp = new Date().getTime();
      const fileName = `contract_${timestamp}.pdf`;

      // Thư mục lưu trữ
      const {dirs} = RNFetchBlob.fs;
      const dirPath =
        Platform.OS === 'ios'
          ? dirs.DocumentDir
          : dirs.DownloadDir || dirs.DocumentDir;

      // Đường dẫn đầy đủ của file
      const filePath = `${dirPath}/${fileName}`;

      // Tải xuống file
      const res = await RNFetchBlob.config({
        fileCache: true,
        path: filePath,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          title: 'Hợp đồng PDF',
          description: 'Đang tải xuống file PDF hợp đồng...',
          mime: 'application/pdf',
          mediaScannable: true,
        },
        progress: (received, total) => {
          const progress = received / total;
          setDownloadProgress(progress);
        },
      }).fetch('GET', pdfUrl);

      setIsDownloading(false);
      hideAlert(); // Ẩn thông báo "Đang tải xuống"

      if (Platform.OS === 'ios') {
        // Chia sẻ file trên iOS
        const shareOptions = {
          url: `file://${res.path()}`,
          type: 'application/pdf',
        };
        await Share.open(shareOptions);
      } else {
        // Hiển thị thông báo thành công trên Android
        showSuccess('File PDF đã được tải xuống.', 'Thành công', true);
      }
    } catch (error: any) {
      console.error('Download error:', error);
      setIsDownloading(false);
      hideAlert(); // Ẩn thông báo "Đang tải xuống" nếu có lỗi
      
      showConfirm(
        'Đã xảy ra lỗi khi tải xuống file PDF. Bạn có muốn thử lại không?',
        () => downloadPdf(),
        'Lỗi tải xuống',
        [
          {
            text: 'Hủy',
            onPress: hideAlert,
            style: 'cancel',
          },
          {
            text: 'Thử lại',
            onPress: () => downloadPdf(),
            style: 'default',
          },
        ]
      );
    }
  };

  if (pdfError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không thể hiển thị PDF.</Text>
        <Text style={styles.errorDetail}>{pdfError}</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleGoBack}>
          <Text style={styles.backText}>Quay lại</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.downloadBtn}
          onPress={downloadPdf}
          disabled={isDownloading}>
          <Text style={styles.downloadText}>
            {isDownloading ? 'Đang tải...' : 'Tải xuống'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* PDF Viewer */}
      <View style={styles.pdfContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.darkGreen} />
            <Text style={styles.loadingText}>Đang tải PDF...</Text>
          </View>
        )}

        <Pdf
          source={{uri: pdfUrl}}
          onLoadComplete={handleLoadComplete}
          onError={handleError}
          onPageChanged={(page, pageCount) => {
            console.log(`${page}/${pageCount}`);
          }}
          style={styles.pdf}
        />
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    backgroundColor: Colors.darkGreen,
  },
  backBtn: {
    padding: scale(8),
  },
  backText: {
    color: Colors.white,
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(16),
  },
  downloadBtn: {
    padding: scale(8),
  },
  downloadText: {
    color: Colors.white,
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(16),
  },
  pdfContainer: {
    flex: 1,
    position: 'relative',
  },
  pdf: {
    flex: 1,
    width: SCREEN.width,
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
  },
  loadingText: {
    marginTop: verticalScale(16),
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(16),
    color: Colors.textGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  errorText: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(18),
    color: Colors.red,
    marginBottom: verticalScale(8),
  },
  errorDetail: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(14),
    color: Colors.textGray,
    textAlign: 'center',
    marginBottom: verticalScale(24),
  },
  backButton: {
    backgroundColor: Colors.darkGreen,
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(12),
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.white,
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(16),
  },
});

export default PdfViewerScreen;
