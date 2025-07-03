import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';
import { responsiveFont, responsiveSpacing, moderateScale } from '../../../utils/responsive';
import { Icons } from '../../../assets/icons';

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
    <>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          {/* Nút back */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <Image 
              source={{uri: Icons.IconOut}}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Tiêu đề */}
          <Text style={styles.title}>Thông báo</Text>

          {/* Nút menu */}
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={onMenuPress}
            activeOpacity={0.7}
          >
            <Image 
              source={{uri: Icons.IconSelectDate}}
              style={styles.menuIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.white,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(12),
    backgroundColor: Colors.backgroud,
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