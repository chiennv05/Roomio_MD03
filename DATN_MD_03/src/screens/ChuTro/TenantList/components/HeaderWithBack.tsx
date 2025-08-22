import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {
  responsiveFont,
  responsiveSpacing,
} from '../../../../utils/responsive';
import {Icons} from '../../../../assets/icons';

interface HeaderWithBackProps {
  title: string;
  backgroundColor?: string;
}

const HeaderWithBack: React.FC<HeaderWithBackProps> = ({title, backgroundColor = Colors.backgroud}) => {
  const navigation = useNavigation();

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, {backgroundColor}]}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <View style={styles.backButtonCircle}>
          <Image source={{uri: Icons.IconArrowLeft}} style={styles.backIcon} />
        </View>
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.placeholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveSpacing(20),
    paddingTop: responsiveSpacing(16),
    paddingBottom: responsiveSpacing(8),
  },
  backButton: {
    width: responsiveSpacing(36),
    height: responsiveSpacing(36),
  },
  backButtonCircle: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: responsiveSpacing(18),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backIcon: {
    width: responsiveSpacing(12),
    height: responsiveSpacing(24),
    tintColor: Colors.black,
  },
  title: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: responsiveSpacing(36),
    height: responsiveSpacing(36),
  },
});

export default HeaderWithBack;
