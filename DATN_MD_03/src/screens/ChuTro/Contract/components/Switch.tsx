import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, Animated, TouchableOpacity} from 'react-native';
import {responsiveSpacing} from '../../../../utils/responsive';
import {Colors} from '../../../../theme/color';

interface Props {
  value?: boolean; // controlled
  defaultValue?: boolean; // uncontrolled
  onToggle?: (nextEnabled: boolean) => void;
  disabled?: boolean;
}

export default function Switch({
  value,
  defaultValue = false,
  onToggle,
  disabled = false,
}: Props) {
  const [internalEnabled, setInternalEnabled] = useState(defaultValue);

  // Nếu có value (controlled) → dùng value, không thì dùng state nội bộ
  const displayEnabled = useMemo(
    () => (typeof value === 'boolean' ? value : internalEnabled),
    [value, internalEnabled],
  );

  const animatedValue = useState(new Animated.Value(displayEnabled ? 1 : 0))[0];

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: displayEnabled ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [displayEnabled, animatedValue]);

  const toggleSwitch = () => {
    const next = !displayEnabled;
    if (onToggle) onToggle(next);
    if (typeof value !== 'boolean') setInternalEnabled(next); // uncontrolled
  };

  return (
    <TouchableOpacity
      onPress={toggleSwitch}
      disabled={disabled}
      style={styles.switchContainer}>
      <Animated.View
        style={[
          styles.switchTrack,
          {
            backgroundColor: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [Colors.gray, Colors.limeGreen],
            }),
          },
        ]}>
        <Animated.View
          style={[
            styles.switchThumb,
            {
              transform: [
                {
                  translateX: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [2, 23],
                  }),
                },
              ],
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  switchContainer: {
    padding: responsiveSpacing(4),
  },
  switchTrack: {
    width: responsiveSpacing(53),
    height: responsiveSpacing(32),
    borderRadius: responsiveSpacing(16),
    justifyContent: 'center',
  },
  switchThumb: {
    position: 'absolute',
    width: responsiveSpacing(28),
    height: responsiveSpacing(28),
    borderRadius: responsiveSpacing(14),
    backgroundColor: Colors.white,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});
