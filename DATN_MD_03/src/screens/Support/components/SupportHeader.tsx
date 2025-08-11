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
    height: scale(70),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    paddingHorizontal: responsiveSpacing(16),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingTop: responsiveSpacing(25),
  },
  backButton: {
    padding: responsiveSpacing(8),
    borderRadius: scale(20),
    backgroundColor: Colors.lightGray,
  },
  backIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: Colors.darkGray,
  },
  title: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    flex: 1,
    textAlign: 'center',
  },
  rightPlaceholder: {
    width: scale(40),
  },
});

export default SupportHeader;
