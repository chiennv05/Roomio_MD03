import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';

import { Colors } from '../theme/color';
import { Fonts } from '../theme/fonts';
import { responsiveFont, responsiveSpacing, moderateScale } from '../utils/responsive';
import { Icons } from '../assets/icons';

interface LoginPromptModalProps {
  visible: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LoginPromptModal: React.FC<LoginPromptModalProps> = ({
  visible,
  onClose,
  onLogin,
}) => {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const iconRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animation khi mở modal
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(modalScale, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();

      // Animation xoay icon
      Animated.loop(
        Animated.timing(iconRotation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      // Animation khi đóng modal
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(modalScale, {
          toValue: 0.8,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, overlayOpacity, modalScale, modalOpacity, iconRotation]);

  const rotateIcon = iconRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleLogin = () => {
    onLogin();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: overlayOpacity,
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.overlayTouch}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: modalOpacity,
              transform: [{ scale: modalScale }],
            }
          ]}
        >
          {/* Header với icon */}
          <View style={styles.header}>
            <Animated.View 
              style={[
                styles.iconContainer,
                {
                  transform: [{ rotate: rotateIcon }],
                }
              ]}
            >
              <Image 
                source={{ uri: Icons.IconPerson }}
                style={styles.iconImage}
              />
            </Animated.View>
            <Text style={styles.title}>Yêu cầu đăng nhập</Text>
            <Text style={styles.subtitle}>
              Bạn cần đăng nhập để có thể đặt phòng và sử dụng đầy đủ tính năng
            </Text>
          </View>

          {/* Body với thông tin */}
          <View style={styles.body}>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Đặt phòng trực tiếp với chủ trọ</Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Lưu danh sách phòng yêu thích</Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Nhận thông báo phòng mới</Text>
            </View>
          </View>

          {/* Footer với buttons */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Để sau</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Image 
                source={{ uri: Icons.IconPerson }}
                style={styles.loginIcon}
              />
              <Text style={styles.loginButtonText}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.85,
    backgroundColor: Colors.white,
    borderRadius: moderateScale(20),
    paddingVertical: responsiveSpacing(24),
    paddingHorizontal: responsiveSpacing(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: responsiveSpacing(20),
  },
  iconContainer: {
    width: moderateScale(60),
    height: moderateScale(60),
    backgroundColor: Colors.limeGreenLight,
    borderRadius: moderateScale(30),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveSpacing(16),
    borderWidth: 3,
    borderColor: Colors.limeGreen,
  },
  iconImage: {
    width: moderateScale(32),
    height: moderateScale(32),
    tintColor: Colors.darkGreen,
  },
  title: {
    fontSize: responsiveFont(22),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: responsiveSpacing(8),
  },
  subtitle: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: responsiveFont(20),
  },
  body: {
    marginBottom: responsiveSpacing(24),
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing(12),
  },
  featureDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    backgroundColor: Colors.darkGreen,
    borderRadius: moderateScale(3),
    marginRight: responsiveSpacing(12),
  },
  featureText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: responsiveSpacing(12),
  },
  cancelButton: {
    flex: 1,
    paddingVertical: responsiveSpacing(14),
    paddingHorizontal: responsiveSpacing(16),
    borderRadius: moderateScale(12),
    borderWidth: 1.5,
    borderColor: Colors.mediumGray,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
  },
  loginButton: {
    flex: 1.2,
    flexDirection: 'row',
    paddingVertical: responsiveSpacing(14),
    paddingHorizontal: responsiveSpacing(16),
    borderRadius: moderateScale(12),
    backgroundColor: Colors.darkGreen,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.darkGreen,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginIcon: {
    width: moderateScale(18),
    height: moderateScale(18),
    tintColor: Colors.white,
    marginRight: responsiveSpacing(8),
  },
  loginButtonText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
  },
});

export default LoginPromptModal; 