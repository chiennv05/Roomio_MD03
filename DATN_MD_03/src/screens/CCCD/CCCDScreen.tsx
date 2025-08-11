import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import BarcodeScanning from '@react-native-ml-kit/barcode-scanning';

type QrParsed = {
  hoTen?: string;
  ngaySinh?: string;
  soCccd?: string;
  gioiTinh?: string;
  diaChi?: string;
  [k: string]: any;
};

const CCCDQRScanner: React.FC = () => {
  const [qrData, setQrData] = useState<QrParsed | null>(null);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const handleSelectImage = () => {
    launchImageLibrary({mediaType: 'photo'}, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
      } else if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        const source = {uri};
        setSelectedImage(source);

        try {
          const barcodes = await BarcodeScanning.scan(uri);
          console.log(
            'Detected barcodes  ss:',
            JSON.stringify(barcodes, null, 2),
          );

          console.log('barcodes:', barcodes[0].value);

          if (barcodes.length > 0) {
            const rawData = barcodes[0].value;
            parseQrData(rawData);
          } else {
            Alert.alert('Không tìm thấy QR', 'Không tìm thấy mã QR trong ảnh.');
            resetState();
          }
        } catch (error) {
          console.error('QR detection failed:', error);
          Alert.alert('Lỗi', 'Không thể giải mã QR từ ảnh này.');
          resetState();
        }
      }
    });
  };

  const parseQrData = rawData => {
    console.log('rawData:', rawData);
    const infoArray = rawData.split('|');
    console.log('infoArray:', infoArray);
    if (infoArray.length >= 6) {
      const parsedData = {
        idNumber: infoArray[0],
        oldIdNumber: infoArray[1],
        fullName: infoArray[2],
        dob: infoArray[3],
        gender: infoArray[4],
        address: infoArray[5],
        issueDate: infoArray[6] || 'Không có',
      };
      setQrData(parsedData);
    } else {
      setQrData({error: 'Mã QR không hợp lệ hoặc không đúng định dạng.'});
    }
  };

  const resetState = () => {
    setQrData(null);
    setSelectedImage(null);
  };

  return (
    <View style={styles.container}>
      {qrData ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Thông tin từ mã QR:</Text>
          {selectedImage && (
            <Image source={selectedImage} style={styles.qrImage} />
          )}
          {qrData.error ? (
            <Text style={styles.errorText}>{qrData.error}</Text>
          ) : (
            <>
              <Text style={styles.resultText}>
                **Số CCCD:** {qrData.idNumber}
              </Text>
              <Text style={styles.resultText}>
                **Họ và tên:** {qrData.fullName}
              </Text>
              <Text style={styles.resultText}>**Ngày sinh:** {qrData.dob}</Text>
              <Text style={styles.resultText}>
                **Giới tính:** {qrData.gender}
              </Text>
              <Text style={styles.resultText}>
                **Địa chỉ:** {qrData.address}
              </Text>
              <Text style={styles.resultText}>
                **Ngày cấp:** {qrData.issueDate}
              </Text>
            </>
          )}
          <TouchableOpacity onPress={resetState} style={styles.button}>
            <Text style={styles.buttonText}>Chọn ảnh khác</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.uploadContainer}>
          <Text style={styles.title}>Tải ảnh mã QR CCCD</Text>
          <Text style={styles.subtitle}>
            Nhấn nút bên dưới để chọn ảnh từ thư viện của bạn.
          </Text>
          <TouchableOpacity onPress={handleSelectImage} style={styles.button}>
            <Text style={styles.buttonText}>Chọn ảnh từ thư viện</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  uploadContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  qrImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
    borderRadius: 8,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'left',
    width: '100%',
    lineHeight: 24,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default CCCDQRScanner;
