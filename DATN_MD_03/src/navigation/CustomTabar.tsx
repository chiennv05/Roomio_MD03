import {
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {Icons} from '../assets/icons';
import {
  responsiveFont,
  responsiveIcon,
  responsiveSpacing,
  SCREEN,
  verticalScale,
} from '../utils/responsive';
import {Images} from '../assets/images';
import {Colors} from '../theme/color';

export default function CustomTabar({state, navigation}: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let IconSource = Icons.IconHome;
        switch (route.name) {
          case 'Home':
            IconSource = !isFocused ? Icons.IconHomeDefaut : Icons.IconHome;
            break;
          case 'Map':
            IconSource = !isFocused ? Icons.IconMapDefault : Icons.IconMap;
            break;
          case 'Favorite':
            IconSource = !isFocused ? Icons.IconHeartDefaut : Icons.IconHeart;
            break;
          case 'Bill':
            IconSource = !isFocused ? Icons.IconContract : Icons.IconContract;
            break;
          case 'Profile':
            IconSource = !isFocused ? Icons.IconPersonDefaut : Icons.IconPerson;
            break;
        }

        if (!isFocused) {
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? {selected: true} : {}}
              onPress={onPress}
              activeOpacity={0.8}
              style={styles.tab}>
              <Image source={{uri: IconSource}} style={styles.icon} />
            </TouchableOpacity>
          );
        }
        return (
          <View style={styles.tab} key={route.key}>
            <ImageBackground
              style={styles.imageBackgoud}
              source={{uri: Images.ImageBackgroundButton}}>
              <Image source={{uri: IconSource}} style={styles.icon} />
            </ImageBackground>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN.width - responsiveSpacing(20),
    flexDirection: 'row',
    backgroundColor: Colors.dearkOlive,
    height: verticalScale(70),
    borderRadius: responsiveSpacing(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(10),
    alignSelf: 'center',
    position: 'absolute',
    bottom: verticalScale(5),
    left: responsiveSpacing(10),
    right: responsiveSpacing(10),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  icon: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
    resizeMode: 'contain',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    margin: 10,
    borderRadius: 10,
  },
  label: {
    marginLeft: 8,
    color: 'white',
    fontWeight: '600',
    fontSize: responsiveFont(18),
  },
  imageBackgoud: {
    width: responsiveIcon(60),
    height: responsiveIcon(60),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
