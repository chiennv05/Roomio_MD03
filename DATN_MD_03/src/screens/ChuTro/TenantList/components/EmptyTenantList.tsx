import React, { useEffect } from 'react';
import {
  Text,
  StyleSheet,
  Animated,
  Easing,
  View,
  Dimensions,
} from 'react-native';
import { Colors } from '../../../../theme/color';
import { Fonts } from '../../../../theme/fonts';
import { responsiveFont, responsiveSpacing, responsiveIcon } from '../../../../utils/responsive';
import { Icons } from '../../../../assets/icons';

const EmptyTenantList: React.FC = () => {
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    console.log('EmptyTenantList mounted');
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();

    // Pulse animation for the search icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, [fadeAnim, scaleAnim, pulseAnim]);

  return (
    <View style={styles.outerContainer} testID="empty-tenant-list">
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground} />
          <Animated.Image
            source={{ uri: Icons.IconSearch }}
            style={[
              styles.searchIcon,
              { transform: [{ scale: pulseAnim }] },
            ]}
            resizeMode="contain"
          />
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>

        <Text style={styles.title}>Danh sách người thuê trống</Text>
        <Text style={styles.subtitle}>
          Bạn chưa có người thuê nào đang hoạt động
        </Text>
      </Animated.View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: width,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsiveSpacing(20),
    backgroundColor: Colors.white,
  },
  iconContainer: {
    width: responsiveIcon(120),
    height: responsiveIcon(120),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveSpacing(20),
    position: 'relative',
  },
  iconBackground: {
    width: responsiveIcon(80),
    height: responsiveIcon(80),
    borderRadius: responsiveIcon(40),
    backgroundColor: '#F2FFDC',
    position: 'absolute',
  },
  searchIcon: {
    width: responsiveIcon(40),
    height: responsiveIcon(40),
    tintColor: Colors.limeGreen,
    zIndex: 2,
  },
  dot: {
    width: responsiveIcon(10),
    height: responsiveIcon(10),
    borderRadius: responsiveIcon(5),
    backgroundColor: Colors.limeGreen,
    position: 'absolute',
  },
  dot1: {
    top: responsiveSpacing(30),
    right: responsiveSpacing(30),
  },
  dot2: {
    top: responsiveSpacing(50),
    left: responsiveSpacing(30),
  },
  dot3: {
    bottom: responsiveSpacing(30),
    right: responsiveSpacing(40),
  },
  title: {
    fontSize: responsiveFont(22),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.dearkOlive,
    marginBottom: responsiveSpacing(10),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    textAlign: 'center',
    marginBottom: responsiveSpacing(30),
    paddingHorizontal: responsiveSpacing(20),
  },
});

export default EmptyTenantList;
