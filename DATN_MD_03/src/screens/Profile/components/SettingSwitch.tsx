import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageSourcePropType,
  Image,
  Animated,
  TouchableOpacity,
} from 'react-native';
import {
  SCREEN,
  responsiveFont,
  responsiveIcon,
  responsiveSpacing,
  verticalScale,
} from '../../../utils/responsive';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';

interface Props {
  iconStat?: ImageSourcePropType | string;
  label: string;
  initialValue: boolean;
}

export default function SettingSwitch({iconStat, label, initialValue}: Props) {
  const [isEnabled, setIsEnabled] = useState(initialValue);
  const animatedValue = useState(new Animated.Value(initialValue ? 1 : 0))[0];

  const getImageSource = () => {
    if (!iconStat) {return undefined;}
    if (typeof iconStat === 'string') {
      return {uri: iconStat};
    }
    return iconStat;
  };

  const toggleSwitch = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);

    // Smooth animation
    Animated.timing(animatedValue, {
      toValue: newValue ? 1 : 0,
      duration: 500, // Animation duration (ms)
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.row}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {iconStat && <Image source={getImageSource()} style={styles.icon} />}
        <Text style={styles.label}>{label}</Text>
      </View>
      <TouchableOpacity onPress={toggleSwitch} style={styles.switchContainer}>
        <Animated.View
          style={[
            styles.switchTrack,
            {
              backgroundColor: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [Colors.gray, Colors.limeGreen],
              }),
            },
          ]}
        >
        <Animated.View
            style={[
              styles.switchThumb,
              {
                transform: [
                  {
                                      translateX: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [2, 23], // Di chuyển từ trái sang phải (phù hợp với width 53px)
                  }),
                  },
                ],
              },
            ]}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    borderBottomWidth: 0.5,
    borderColor: Colors.gray,
    width: SCREEN.width * 0.9,
  },
  icon: {
    width: responsiveIcon(20),
    height: responsiveIcon(20),
    marginRight: responsiveSpacing(20),
    resizeMode: 'contain',
  },
  label: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    fontWeight: '400',
  },
  switchContainer: {
    padding: responsiveSpacing(4),
  },
  switchTrack: {
    width: responsiveSpacing(53),
    height: responsiveSpacing(32),
    borderRadius: responsiveSpacing(16),
    position: 'relative',
    justifyContent: 'center',
  },

  switchThumb: {
    position: 'absolute',
    width: responsiveSpacing(28),  // Tăng kích thước thumb
    height: responsiveSpacing(28),
    borderRadius: responsiveSpacing(14),
    backgroundColor: Colors.white,
    shadowOffset: {
      width: responsiveSpacing(0),
      height: responsiveSpacing(2),
    },
    shadowOpacity: responsiveSpacing(0.2),
    shadowRadius: responsiveSpacing(2),
    elevation: responsiveSpacing(3),
  },
});
