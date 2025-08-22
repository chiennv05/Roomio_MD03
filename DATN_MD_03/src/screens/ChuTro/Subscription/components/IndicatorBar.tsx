import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, scale} from '../../../../utils/responsive';
import {Colors} from '../../../../theme/color';

type Item = {_id: string; key: string};

export default function IndicatorBar({
  items,
  progress,
}: {
  items: Item[];
  progress: Animated.SharedValue<number>;
}) {
  return (
    <View style={styles.row}>
      {items.map((p, i) => (
        <Pill key={p._id} index={i} label={p.key || ''} progress={progress} />
      ))}
    </View>
  );
}

function Pill({
  index,
  label,
  progress,
}: {
  index: number;
  label: string;
  progress: Animated.SharedValue<number>;
}) {
  const WIDTH_ACTIVE = scale(44);
  const WIDTH_INACTIVE = scale(12);
  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(progress.value - index);
    const w = interpolate(distance, [0, 1], [WIDTH_ACTIVE, WIDTH_INACTIVE], Extrapolate.CLAMP);
    const bg = interpolateColor(distance, [0, 1], [Colors.dearkOlive, '#d1d5db']);
    return {width: w, backgroundColor: bg as any};
  });
  const textStyle = useAnimatedStyle(() => {
    const distance = Math.abs(progress.value - index);
    const opacity = interpolate(distance, [0, 0.6, 1], [1, 0.2, 0], Extrapolate.CLAMP);
    return {opacity};
  });
  return (
    <Animated.View style={[styles.pill, animatedStyle]}>
      <Animated.Text style={[styles.text, textStyle]}>
        {(label || '').toUpperCase()}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: scale(10),
  },
  pill: {
    height: scale(12),
    borderRadius: 999,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(10),
  },
  text: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(10),
    color: '#fff',
  },
});


