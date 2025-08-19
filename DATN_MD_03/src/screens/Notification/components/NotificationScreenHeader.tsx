import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {
  responsiveFont,
  responsiveSpacing,
  moderateScale,
} from '../../../utils/responsive';
import {Icons} from '../../../assets/icons';

interface NotificationScreenHeaderProps {
  onMenuPress?: () => void;
}

const NotificationScreenHeader: React.FC<NotificationScreenHeaderProps> = ({
  onMenuPress,
}) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Nút back với glass effect - ở bên trái */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackPress}
        activeOpacity={0.8}>
        <View style={styles.buttonGlass}>
          <Image
            source={{uri: Icons.IconArrowLeft}}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>

      {/* Tiêu đề với gradient text effect */}
      <View style={styles.titleContainer}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
          <Image
            source={{uri: Icons.IconNotification}}
            style={styles.titleIcon}
          />
          <Text style={styles.title}>Thông báo</Text>
        </View>
        <Text style={styles.subtitle}>Cập nhật mới nhất</Text>
      </View>

      {/* Spacer bên phải để cân bằng */}
      <View style={styles.rightSpacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveSpacing(20),
    paddingVertical: responsiveSpacing(16),
    backgroundColor: 'transparent',
  },
  backButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(22),
  },
  rightSpacer: {
    width: moderateScale(44),
    height: moderateScale(44),
  },
  buttonGlass: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.white,
    opacity: 1,
    borderRadius: moderateScale(22),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: Colors.shadowDefault,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  backIcon: {
    width: moderateScale(20),
    height: moderateScale(20),
    tintColor: Colors.black,
  },
  titleIcon: {
    width: moderateScale(18),
    height: moderateScale(18),
    tintColor: Colors.white,
  },

  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: responsiveSpacing(16),
  },
  title: {
    fontSize: responsiveFont(22),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: responsiveSpacing(2),
  },
});

export default NotificationScreenHeader;
