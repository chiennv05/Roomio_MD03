import React from 'react';
import {StyleSheet, Text, View, Image, ImageSourcePropType} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, responsiveSpacing} from '../../../../utils/responsive';

interface StatGroupProps {
  title: string;
  icon?: ImageSourcePropType;
  children: React.ReactNode;
  backgroundColor?: string;
}

const StatGroup = ({
  title,
  icon,
  children,
  backgroundColor = Colors.lightGreenBackground,
}: StatGroupProps) => {
  return (
    <View style={[styles.container, {backgroundColor}]}>
      <View style={styles.headerContainer}>
        {icon && (
          <Image source={icon} style={styles.headerIcon} resizeMode="contain" />
        )}
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <View style={styles.childrenContainer}>{children}</View>
    </View>
  );
};

export default StatGroup;

const styles = StyleSheet.create({
  container: {
    marginBottom: responsiveSpacing(16),
    borderRadius: 16,
    paddingTop: responsiveSpacing(12),
    paddingBottom: responsiveSpacing(4),
    marginHorizontal: responsiveSpacing(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(16),
    marginBottom: responsiveSpacing(8),
  },
  headerIcon: {
    width: 20,
    height: 20,
    marginRight: responsiveSpacing(8),
    tintColor: Colors.darkGray,
  },
  headerTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
  },
  childrenContainer: {
    paddingHorizontal: responsiveSpacing(4),
  },
});
