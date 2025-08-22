import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  SafeAreaView,
  Dimensions,
  Alert,
  Share,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Colors } from '../theme/color';
import { Fonts } from '../theme/fonts';
import { responsiveSpacing, responsiveFont } from '../utils/responsive';
import { Icons } from '../assets/icons';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
  roomPrice: string;
  roomAddress: string;
}

const { width } = Dimensions.get('window');

const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  roomId,
  roomName,
  roomPrice,
  roomAddress,
}) => {
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  // Tạo nội dung chia sẻ
  const createShareContent = () => {
    const deepUrl = `roomio://room/${roomId}`;
    const webUrl = `https://roomio.app/room/${roomId}`;

    return {
      title: 'Chia sẻ phòng trọ từ Roomio',
      message: `🏠 ${roomName}
💰 ${roomPrice}/tháng  
📍 ${roomAddress}

Xem chi tiết phòng trọ tại:
📱 Mở trong app: ${deepUrl}
🌐 Xem trên web: ${webUrl}

Tải app Roomio để khám phá thêm nhiều phòng trọ chất lượng!`,
      url: deepUrl,
    };
  };

  // Copy link vào clipboard
  const handleCopyLink = async () => {
    try {
      const shareContent = createShareContent();
      await Clipboard.setString(shareContent.message);

      setShowCopySuccess(true);
      setTimeout(() => {
        setShowCopySuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể copy link. Vui lòng thử lại.');
    }
  };

  // Chia sẻ qua React Native Share (built-in)
  const handleShare = async () => {
    try {
      const shareContent = createShareContent();

      const result = await Share.share({
        title: shareContent.title,
        message: shareContent.message,
        url: shareContent.url,
      });

      if (result.action === Share.sharedAction) {
        onClose();
      }
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể chia sẻ. Vui lòng thử lại.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Chia sẻ phòng trọ</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Image source={{ uri: Icons.IconRemove }} style={styles.closeIcon} />
              </TouchableOpacity>
            </View>

            {/* Room Info Preview */}
            <View style={styles.roomPreview}>
              <Text style={styles.roomName} numberOfLines={2}>
                {roomName}
              </Text>
              <Text style={styles.roomPrice}>{roomPrice}/tháng</Text>
              <Text style={styles.roomAddress} numberOfLines={2}>
                {roomAddress}
              </Text>
            </View>

            {/* Share Options */}
            <View style={styles.shareOptions}>
              {/* Copy Link */}
              <TouchableOpacity style={styles.shareOption} onPress={handleCopyLink}>
                <View style={styles.shareIconContainer}>
                  <Image source={{ uri: Icons.IconShare }} style={styles.shareIcon} />
                </View>
                <Text style={styles.shareOptionText}>Copy link</Text>
              </TouchableOpacity>

              {/* Share More */}
              <TouchableOpacity style={styles.shareOption} onPress={handleShare}>
                <View style={styles.shareIconContainer}>
                  <Image source={{ uri: Icons.IconShare }} style={styles.shareIcon} />
                </View>
                <Text style={styles.shareOptionText}>Chia sẻ</Text>
              </TouchableOpacity>

              {/* Share Facebook */}
              <TouchableOpacity style={styles.shareOption} onPress={handleShare}>
                <View style={[styles.shareIconContainer, styles.facebookIcon]}>
                  <Text style={styles.facebookText}>f</Text>
                </View>
                <Text style={styles.shareOptionText}>Facebook</Text>
              </TouchableOpacity>

              {/* Share Zalo */}
              <TouchableOpacity style={styles.shareOption} onPress={handleShare}>
                <View style={[styles.shareIconContainer, styles.zaloIcon]}>
                  <Text style={styles.zaloText}>Z</Text>
                </View>
                <Text style={styles.shareOptionText}>Zalo</Text>
              </TouchableOpacity>
            </View>

            {/* Copy Success Message */}
            {showCopySuccess && (
              <View style={styles.successMessage}>
                <Image source={{ uri: Icons.IconCheck }} style={styles.successIcon} />
                <Text style={styles.successText}>Đã copy link thành công!</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'transparent',
  },
  modal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: responsiveSpacing(20),
    minHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(20),
    paddingVertical: responsiveSpacing(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  title: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  closeButton: {
    padding: responsiveSpacing(4),
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: Colors.textGray,
  },
  roomPreview: {
    paddingHorizontal: responsiveSpacing(20),
    paddingVertical: responsiveSpacing(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  roomName: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(4),
  },
  roomPrice: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGreen,
    marginBottom: responsiveSpacing(4),
  },
  roomAddress: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
  },
  shareOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: responsiveSpacing(20),
    paddingVertical: responsiveSpacing(20),
    justifyContent: 'space-around',
  },
  shareOption: {
    alignItems: 'center',
    marginBottom: responsiveSpacing(20),
    width: (width - 80) / 4, // 4 columns
  },
  shareIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.darkGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveSpacing(8),
  },
  shareIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.white,
  },
  facebookIcon: {
    backgroundColor: '#1877F2',
  },
  facebookText: {
    color: Colors.white,
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
  },
  zaloIcon: {
    backgroundColor: '#0180C7',
  },
  zaloText: {
    color: Colors.white,
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
  },
  shareOptionText: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    textAlign: 'center',
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: responsiveSpacing(20),
    paddingVertical: responsiveSpacing(12),
    backgroundColor: Colors.darkGreen,
    marginHorizontal: responsiveSpacing(20),
    borderRadius: 8,
  },
  successIcon: {
    width: 16,
    height: 16,
    tintColor: Colors.white,
    marginRight: responsiveSpacing(8),
  },
  successText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.white,
  },
});

export default ShareModal;
