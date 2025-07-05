import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Icons} from '../../../../assets/icons';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, scale, verticalScale} from '../../../../utils/responsive';

interface HeaderWithBackProps {
  title: string;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}

const HeaderWithBack: React.FC<HeaderWithBackProps> = ({
  title,
  onBackPress,
  rightComponent,
}) => {
  const navigation = useNavigation();

  const handleGoBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
        <Image 
          source={{uri: Icons.IconOut}}
          style={styles.backIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>{title}</Text>
      
      {rightComponent ? (
        rightComponent
      ) : (
        <View style={styles.rightPlaceholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    backgroundColor: Colors.white,
    elevation: 2,
  },
  headerTitle: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  backButton: {
    padding: scale(8),
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: scale(20),
    height: scale(20),
   
  },
  rightPlaceholder: {
    width: scale(24),
  },
});

export default HeaderWithBack; 