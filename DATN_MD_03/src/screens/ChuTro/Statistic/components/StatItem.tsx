import React from 'react';
import {StyleSheet, Text, View, Image, ImageSourcePropType} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, responsiveSpacing} from '../../../../utils/responsive';

interface StatItemProps {
  title: string;
  value: string | number;
  icon?: ImageSourcePropType;
  color?: string;
  small?: boolean;
}

const StatItem = ({
  title,
  value,
  icon,
  color = Colors.primaryGreen,
  small = false,
}: StatItemProps) => {
  return (
    <View style={[styles.container, small && styles.smallContainer]}>
      <View style={[styles.borderLeft, {backgroundColor: color}]} />
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          {icon && (
            <Image source={icon} style={styles.icon} resizeMode="contain" />
          )}
        </View>
        <Text
          style={[styles.title, small && styles.smallTitle]}
          numberOfLines={1}>
          {title}
        </Text>
        <Text
          style={[styles.value, {color}, small && styles.smallValue]}
          numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
};

export default StatItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: responsiveSpacing(12),
    marginHorizontal: responsiveSpacing(16),
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  smallContainer: {
    marginHorizontal: responsiveSpacing(8),
    marginBottom: responsiveSpacing(8),
  },
  borderLeft: {
    width: 5,
    height: '100%',
  },
  iconContainer: {
    marginBottom: responsiveSpacing(8),
  },
  contentContainer: {
    flex: 1,
    padding: responsiveSpacing(14),
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: Colors.darkGray,
  },
  title: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    marginBottom: responsiveSpacing(4),
  },
  smallTitle: {
    fontSize: responsiveFont(12),
  },
  value: {
    fontSize: responsiveFont(24),
    fontFamily: Fonts.Roboto_Bold,
  },
  smallValue: {
    fontSize: responsiveFont(20),
  },
});
