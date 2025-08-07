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
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {
  responsiveFont,
  responsiveSpacing,
  moderateScale,
} from '../../../utils/responsive';
import {Icons} from '../../../assets/icons';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface NotificationScreenHeaderProps {
  onMenuPress?: () => void;
}

const NotificationScreenHeader: React.FC<NotificationScreenHeaderProps> = ({
  onMenuPress,
}) => {
  const navigation = useNavigation<NavigationProp>();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleTestPress = () => {
    navigation.navigate('NotificationTestScreen');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Nút back */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackPress}
        activeOpacity={0.7}>
        <Image
          source={{uri: Icons.IconOut}}
          style={styles.backIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Tiêu đề */}
      <Text style={styles.title}>Thông báo</Text>

      {/* Buttons container */}
      <View style={styles.buttonsContainer}>
        {/* Nút test */}
        <TouchableOpacity
          style={styles.testButton}
          onPress={handleTestPress}
          activeOpacity={0.7}>
          <Text style={styles.testButtonText}>🔔</Text>
        </TouchableOpacity>

        {/* Nút menu */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={onMenuPress}
          activeOpacity={0.7}>
          <Image
            source={{uri: Icons.IconSelectDate}}
            style={styles.menuIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(12),
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(20),
  },
  backIcon: {
    width: moderateScale(36),
    height: moderateScale(36),
  },
  title: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: responsiveSpacing(16),
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveSpacing(8),
  },
  testButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(20),
    backgroundColor: Colors.lightGreenBackground,
  },
  testButtonText: {
    fontSize: responsiveFont(16),
  },
  menuButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(20),
  },
  menuIcon: {
    width: moderateScale(36),
    height: moderateScale(36),
  },
});

export default NotificationScreenHeader;
