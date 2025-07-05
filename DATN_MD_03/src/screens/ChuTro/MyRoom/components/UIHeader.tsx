import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {Icons} from '../../../../assets/icons';
import {
  responsiveFont,
  responsiveIcon,
  SCREEN,
  verticalScale,
} from '../../../../utils/responsive';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {Fonts} from '../../../../theme/fonts';

interface HeaderProps {
  title: string;
  onPress: () => void;
}

const UIHeader = ({title, onPress}: HeaderProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.containerLeftAndRight}>
        <TouchableOpacity style={styles.styleButton} onPress={onPress}>
          <Image
            source={{uri: Icons.IconArrowLeft}}
            style={styles.styleIconButton}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.containerCenter}>
        <Text style={styles.textTitle}>{title}</Text>
      </View>
      <View style={styles.containerLeftAndRight} />
    </View>
  );
};

export default UIHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: SCREEN.width * 0.9,
    marginTop: verticalScale(10),
  },
  containerLeftAndRight: {
    flex: 1,
  },
  containerCenter: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  styleButton: {
    width: responsiveIcon(36),
    height: responsiveIcon(36),
    borderRadius: responsiveIcon(36) / 2,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  styleIconButton: {
    width: responsiveIcon(24) / 2,
    height: responsiveIcon(24),
  },
  textTitle: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    fontWeight: '700',
  },
});
