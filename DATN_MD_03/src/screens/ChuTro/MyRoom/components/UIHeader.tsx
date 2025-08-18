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
  iconLeft?: string;
  iconRight?: string | React.ReactNode;
  onPressLeft?: () => void;
  onPressRight?: () => void;
  color?: string;
}

const UIHeader = ({
  title,
  iconLeft,
  iconRight,
  onPressLeft,
  onPressRight,
  color,
}: HeaderProps) => {
  return (
    <View style={[styles.container, {backgroundColor: color}]}>
      <View style={styles.containerLeftAndRight}>
        {iconLeft && (
          <TouchableOpacity onPress={onPressLeft}>
            <View style={styles.backButtonCircle}>
              <Image
                source={{uri: Icons.IconArrowLeft}}
                style={styles.backIcon}
              />
            </View>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.containerCenter}>
        <Text style={styles.textTitle}>{title}</Text>
      </View>
      <View style={styles.containerLeftAndRight}>
        {iconRight &&
          (typeof iconRight === 'string' ? (
            <TouchableOpacity onPress={onPressRight}>
              <View style={styles.backButtonCircle}>
                <Image
                  source={{uri: iconRight}}
                  style={styles.backIcon}
                />
              </View>
            </TouchableOpacity>
          ) : (
            iconRight // ✅ nếu là component thì render luôn
          ))}
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerCenter: {
    flex: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonCircle: {
    width: responsiveIcon(36),
    height: responsiveIcon(36),
    borderRadius: responsiveIcon(36) / 2,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  backIcon: {
    width: responsiveIcon(24) / 2,
    height: responsiveIcon(24),
  },
  textTitle: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    fontWeight: '700',
  },
  styleIconRight: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
  },
});
