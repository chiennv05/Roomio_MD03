import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {Icons} from '../../../assets/icons';
import {
  responsiveFont,
  scale,
  verticalScale,
  responsiveSpacing,
} from '../../../utils/responsive';

interface VerificationCardProps {
  onVerify: () => void;
}

const VerificationCard: React.FC<VerificationCardProps> = ({onVerify}) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2C3E50', '#34495E', '#1C2833']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.iconOuter}>
              <Text style={styles.exclamationMark}>!</Text>
            </LinearGradient>
          </View>

          <Text style={styles.title}>Xác thực tài khoản của bạn</Text>
          <Text style={styles.description}>
            Xác thực CCCD để mở khóa đầy đủ tính năng và bảo vệ tài khoản của bạn.{'\n'}
            Bạn vẫn có thể cập nhật số điện thoại và email mà không cần xác thực.
          </Text>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            <BenefitItem text="Bảo vệ thông tin cá nhân" />
            <BenefitItem text="Tăng độ uy tín" />
            <BenefitItem text="Mở khóa tính năng premium" />
          </View>

          <TouchableOpacity
            style={styles.verifyButton}
            activeOpacity={0.8}
            onPress={onVerify}>
            <LinearGradient
              colors={['#BAFD00', '#9FE600']}
              style={styles.buttonGradient}>
              <Text style={styles.buttonText}>Xác thực ngay</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const BenefitItem: React.FC<{text: string}> = ({text}) => (
  <View style={styles.benefitItem}>
    <View style={styles.checkCircle}>
      <Image source={{uri: Icons.IconCheck}} style={styles.benefitIcon} />
    </View>
    <Text style={styles.benefitText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: responsiveSpacing(20),
    marginBottom: verticalScale(20),
    borderRadius: scale(20),
    overflow: 'hidden',
    shadowColor: '#2C3E50',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  gradient: {
    borderRadius: scale(20),
  },
  content: {
    padding: scale(24),
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: verticalScale(20),
  },
  iconOuter: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  exclamationMark: {
    fontSize: responsiveFont(32),
    fontFamily: Fonts.Roboto_Bold,
    color: '#FFFFFF',
  },
  title: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: '#FFFFFF',
    marginBottom: verticalScale(10),
    textAlign: 'center',
  },
  description: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: verticalScale(24),
    paddingHorizontal: scale(10),
    lineHeight: responsiveFont(20),
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: verticalScale(24),
    alignItems: 'flex-start',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(14),
  },
  checkCircle: {
    width: scale(26),
    height: scale(26),
    borderRadius: scale(13),
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  benefitIcon: {
    width: scale(14),
    height: scale(14),
    tintColor: '#FFFFFF',
  },
  benefitText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Medium,
    color: '#FFFFFF',
    flex: 1,
  },
  verifyButton: {
    width: '100%',
    borderRadius: scale(12),
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(14),
  },
  buttonText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default VerificationCard;
