import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';
import { 
  responsiveFont, 
  responsiveIcon,
  responsiveSpacing 
} from '../../../utils/responsive';
import { HeartAnimation } from '../../../components';

interface EmptyFavoriteProps {
  isLoggedIn: boolean;
  onLoginPress?: () => void;
}

const EmptyFavorite: React.FC<EmptyFavoriteProps> = ({
  isLoggedIn,
  onLoginPress,
}) => {
  if (!isLoggedIn) {
    return (
          <View style={styles.container}>
      <View style={styles.animationContainer}>
        <HeartAnimation size={100} color="#FF1493" />
      </View>
      <Text style={styles.title}>Đăng nhập để xem yêu thích</Text>
        <Text style={styles.subtitle}>
          Đăng nhập để lưu những phòng trọ bạn quan tâm
        </Text>
        <TouchableOpacity style={styles.loginButton} onPress={onLoginPress}>
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        <HeartAnimation size={100} color="#FF69B4" />
      </View>
      <Text style={styles.title}>Chưa có phòng yêu thích</Text>
      <Text style={styles.subtitle}>
        Hãy khám phá và lưu những phòng trọ bạn quan tâm
      </Text>
    </View>
  );
};

export default EmptyFavorite;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(40),
    backgroundColor: Colors.backgroud,
  },
  animationContainer: {
    marginBottom: responsiveSpacing(24),
  },
  title: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: responsiveSpacing(12),
  },
  subtitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: responsiveFont(24),
    marginBottom: responsiveSpacing(32),
  },
  loginButton: {
    backgroundColor: Colors.limeGreen,
    paddingHorizontal: responsiveSpacing(32),
    paddingVertical: responsiveSpacing(16),
    borderRadius: responsiveIcon(25),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  loginButtonText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
}); 