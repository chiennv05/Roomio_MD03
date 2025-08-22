import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {
  responsiveFont,
  responsiveSpacing,
  scale,
} from '../../../utils/responsive';

interface SupportHeaderProps {
  title: string;
}

const SupportHeader: React.FC<SupportHeaderProps> = ({title}) => {
  const navigation = useNavigation();

  return (
    <>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <Image
            source={require('../../../assets/icons/icon_arrow_back.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.rightPlaceholder} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: scale(50), // Giảm height để gọn hơn
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroud,
    paddingHorizontal: responsiveSpacing(16),
    paddingTop: responsiveSpacing(5), // Giảm padding top
  },
  backButton: {
    padding: responsiveSpacing(4),
  },
  backIcon: {
    width: scale(24),
    height: scale(24),
    tintColor: Colors.black,
  },
  title: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    flex: 1,
    textAlign: 'center',
  },
  rightPlaceholder: {
    width: scale(32),
  },
});

export default SupportHeader;
