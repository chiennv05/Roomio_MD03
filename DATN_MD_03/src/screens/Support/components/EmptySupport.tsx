import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {
  responsiveFont,
  responsiveSpacing,
  scale,
} from '../../../utils/responsive';

interface EmptySupportProps {
  message?: string;
}

const EmptySupport: React.FC<EmptySupportProps> = ({
  message = 'Chưa có yêu cầu hỗ trợ',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Image
          source={require('../../../assets/icons/icon_warning.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.message}>{message}</Text>
      <Text style={styles.subText}>
        Bạn chưa có yêu cầu hỗ trợ nào.{'\n'}
        Nhấn nút + để tạo yêu cầu hỗ trợ mới.
      </Text>

      <View style={styles.illustrationContainer}>
        <View style={styles.illustrationCard}>
          <Text style={styles.illustrationText}>💬</Text>
        </View>
        <View style={styles.illustrationCard}>
          <Text style={styles.illustrationText}>🛠️</Text>
        </View>
        <View style={styles.illustrationCard}>
          <Text style={styles.illustrationText}>💡</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsiveSpacing(32),
    backgroundColor: Colors.backgroud,
  },
  iconContainer: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: Colors.lightOrangeBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveSpacing(24),
  },
  icon: {
    width: scale(40),
    height: scale(40),
    tintColor: Colors.warning,
  },
  message: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
    textAlign: 'center',
    marginBottom: responsiveSpacing(12),
  },
  subText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: responsiveFont(20),
    marginBottom: responsiveSpacing(32),
    maxWidth: '80%',
  },
  illustrationContainer: {
    flexDirection: 'row',
    gap: responsiveSpacing(16),
  },
  illustrationCard: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(12),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  illustrationText: {
    fontSize: responsiveFont(24),
  },
});

export default EmptySupport;
