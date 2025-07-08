import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';
import Pdf from 'react-native-pdf';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {scale, verticalScale, responsiveFont} from '../../../utils/responsive';
import {Icons} from '../../../assets/icons';

type PdfViewerRouteProp = RouteProp<RootStackParamList, 'PdfViewer'>;
type PdfViewerNavigationProp = StackNavigationProp<RootStackParamList>;

const PdfViewerScreen = () => {
  const navigation = useNavigation<PdfViewerNavigationProp>();
  const route = useRoute<PdfViewerRouteProp>();
  const {pdfUrl} = route.params;
  const [isLoading, setIsLoading] = useState(true);

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Xử lý lỗi khi tải PDF
  const handleError = (error: Error) => {
    console.error('Lỗi khi tải PDF:', error.message);
    setIsLoading(false);
    Alert.alert('Lỗi', 'Không thể tải PDF. Vui lòng thử lại sau.');
  };

  // Lấy kích thước màn hình
  const {width, height} = Dimensions.get('window');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Image source={{uri: Icons.IconArrowBack}} style={{width: 24, height: 24}} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hợp đồng PDF</Text>
        <View style={{width: 24}} />
      </View>

      <View style={styles.pdfContainer}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.darkGreen} />
            <Text style={styles.loadingText}>Đang tải PDF...</Text>
          </View>
        )}
        
        <Pdf
          source={{uri: pdfUrl, cache: true}}
          style={styles.pdf}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`PDF đã tải thành công với ${numberOfPages} trang`);
            setIsLoading(false);
          }}
          onPageChanged={(page, numberOfPages) => {
            console.log(`Trang hiện tại: ${page}/${numberOfPages}`);
          }}
          onError={(error) => {
            console.error('Lỗi khi tải PDF:', error);
            setIsLoading(false);
            Alert.alert('Lỗi', 'Không thể tải PDF. Vui lòng thử lại sau.');
          }}
          onPressLink={(uri) => {
            console.log(`Link pressed: ${uri}`);
          }}
          trustAllCerts={false}
          enablePaging={true}
          enableAnnotationRendering={true}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray150,
  },
  backButton: {
    padding: scale(8),
  },
  headerTitle: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(18),
    color: Colors.black,
  },
  pdfContainer: {
    flex: 1,
    position: 'relative',
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
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  placeholderText: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(14),
    color: Colors.textGray,
    textAlign: 'center',
    marginBottom: verticalScale(10),
  },
  noteText: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(16),
    color: Colors.red,
    textAlign: 'center',
  },
});

export default PdfViewerScreen; 