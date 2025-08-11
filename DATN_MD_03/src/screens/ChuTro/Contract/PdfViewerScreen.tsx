import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
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
import {PermissionsAndroid, Platform, ToastAndroid} from 'react-native';
import Share from 'react-native-share';

type PdfViewerRouteProp = RouteProp<RootStackParamList, 'PdfViewer'>;
type PdfViewerNavigationProp = StackNavigationProp<RootStackParamList>;

const PdfViewerScreen = () => {
  const navigation = useNavigation<PdfViewerNavigationProp>();
  const route = useRoute<PdfViewerRouteProp>();
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
      const response = await fetch(fullUrl, {method: 'HEAD'});

      if (
        response.ok &&
        response.headers.get('Content-Type')?.includes('pdf')
      ) {
        return fullUrl;
      }
      return null;
    } catch (error) {
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
        Alert.alert('Lỗi', 'Không thể tải file PDF.');
      }
      setIsLoading(false);
    };
    loadPdf();
  }, [pdfUrl]);

  const handleDownloadPdf = async () => {
    try {
      // Check if we have a valid PDF URL
      if (!pdfLink) {
        Alert.alert('Lỗi', 'Không có file PDF để tải xuống.');
        return;
      }

      // Create a filename from the URL or use a default name
      let filename = 'contract.pdf';
      if (pdfLink.includes('/')) {
        const parts = pdfLink.split('/');
        const urlFilename = parts[parts.length - 1];
        if (urlFilename && urlFilename.includes('.pdf')) {
          filename = urlFilename;
        }
      }

      // Handle permissions based on platform and Android version
      if (Platform.OS === 'android') {
        // Get Android version
        const androidVersion = Platform.Version;

        // For Android 10+ (API 29+), we don't need WRITE_EXTERNAL_STORAGE for app's download directory
        if (androidVersion >= 29) {
          // No permission needed, just continue with download
          console.log(
            'Android 10+, no explicit permission needed for app directory',
          );
        } else {
          // For older Android versions, request permission
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
              Alert.alert(
                'Thông báo',
                'Bạn cần cấp quyền truy cập bộ nhớ để tải file PDF.',
              );
              return;
            }
          } catch (err) {
            console.warn(err);
            // Continue anyway - some devices may have issues with the permission API
          }
        }
      }

      // Set download path based on platform
      let downloadPath;
      if (Platform.OS === 'ios') {
        downloadPath = `${RNFS.DocumentDirectoryPath}/${filename}`;
      } else {
        // For Android, try to use Download directory directly
        downloadPath = `${RNFS.DownloadDirectoryPath}/${filename}`;
      }

      console.log('Downloading to path:', downloadPath);

      // Show download starting message
      Alert.alert('Thông báo', 'Đang tải xuống PDF...');

      // Download the file
      const {promise} = RNFS.downloadFile({
        fromUrl: pdfLink,
        toFile: downloadPath,
        background: true,
        discretionary: true,
        progress: res => {
          const progress = (res.bytesWritten / res.contentLength) * 100;
          console.log(`Download progress: ${progress.toFixed(2)}%`);
        },
      });

      const result = await promise;

      if (result.statusCode === 200) {
        // Download successful
        if (Platform.OS === 'android') {
          ToastAndroid.show('Tải xuống thành công', ToastAndroid.LONG);
        } else {
          Alert.alert('Thành công', 'File PDF đã được tải xuống.');
        }

        // Optionally share the file
        const shareOptions = {
          title: 'Chia sẻ file PDF',
          message: 'Chia sẻ hợp đồng',
          url: `file://${downloadPath}`,
          type: 'application/pdf',
        };

        try {
          // Ask if user wants to open the file
          Alert.alert(
            'Thành công',
            'File PDF đã được tải xuống. Bạn có muốn mở file không?',
            [
              {
                text: 'Không',
                style: 'cancel',
              },
              {
                text: 'Mở file',
                onPress: () => Share.open(shareOptions),
              },
            ],
          );
        } catch (shareError) {
          console.error('Error sharing file:', shareError);
        }
      } else {
        Alert.alert(
          'Lỗi',
          'Không thể tải xuống file PDF. Vui lòng thử lại sau.',
        );
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tải xuống file PDF.');
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroud} />
      <View style={styles.headerContainer}>
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
            source={{uri: pdfLink, cache: true}}
            style={styles.pdf}
            onLoadComplete={() => setIsLoading(false)}
            onError={() => {
              Alert.alert('Lỗi', 'Không thể hiển thị PDF.');
              setIsLoading(false);
            }}
            trustAllCerts={false}
            enablePaging
            enableAnnotationRendering
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
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
    width: '100%',
    paddingBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PdfViewerScreen;
