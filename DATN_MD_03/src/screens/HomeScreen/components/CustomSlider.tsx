import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
} from 'react-native';

const SLIDER_WIDTH = 280;

interface CustomSliderProps {
  minValue: number;
  maxValue: number;
  values: [number, number];
  onValuesChange: (values: [number, number]) => void;
}

// Format function for displaying values on thumbs
  const formatThumbValue = (value: number, maxValue: number) => {
    if (maxValue > 1000000) {
      // For prices
      if (value >= 1000000) {
        const millions = value / 1000000;
        return millions % 1 === 0 ? `${millions} triệu` : `${millions.toFixed(1)} triệu`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}k`;
      } else {
        return value.toString();
      }
    } else {
      // For areas
      return `${value}m²`;
    }
  };

const CustomSlider: React.FC<CustomSliderProps> = ({
  minValue,
  maxValue,
  values,
  onValuesChange,
}) => {
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null);
  const minPosition = ((values[0] - minValue) / (maxValue - minValue)) * SLIDER_WIDTH;
  const maxPosition = ((values[1] - minValue) / (maxValue - minValue)) * SLIDER_WIDTH;

  // PanResponder for min thumb
  const minPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setDragging('min');
    },
    onPanResponderMove: (evt, gestureState) => {
      const newPosition = minPosition + gestureState.dx;
      const newValue = positionToValue(newPosition);
      const clampedValue = Math.max(minValue, Math.min(values[1], newValue));
      onValuesChange([clampedValue, values[1]]);
    },
    onPanResponderRelease: () => {
      setDragging(null);
    },
  });

  // PanResponder for max thumb
  const maxPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setDragging('max');
    },
    onPanResponderMove: (evt, gestureState) => {
      const newPosition = maxPosition + gestureState.dx;
      const newValue = positionToValue(newPosition);
      const clampedValue = Math.max(values[0], Math.min(maxValue, newValue));
      onValuesChange([values[0], clampedValue]);
    },
    onPanResponderRelease: () => {
      setDragging(null);
    },
  });

  // Function to round values nicely
  const roundValue = (value: number) => {
    if (maxValue > 1000000) {
      // For prices: round to nearest 100k
      return Math.round(value / 100000) * 100000;
    } else {
      // For areas: round to nearest 5
      return Math.round(value / 5) * 5;
    }
  };

  const positionToValue = (position: number) => {
    const percentage = Math.max(0, Math.min(1, position / SLIDER_WIDTH));
    const rawValue = minValue + percentage * (maxValue - minValue);
    return roundValue(rawValue);
  };



  const handleTrackPress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const newValue = positionToValue(locationX);
    
    // Determine which thumb is closer
    const distanceToMin = Math.abs(newValue - values[0]);
    const distanceToMax = Math.abs(newValue - values[1]);
    
    if (distanceToMin < distanceToMax) {
      const clampedValue = Math.max(minValue, Math.min(values[1], newValue));
      onValuesChange([clampedValue, values[1]]);
    } else {
      const clampedValue = Math.max(values[0], Math.min(maxValue, newValue));
      onValuesChange([values[0], clampedValue]);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.sliderContainer}
        onPress={handleTrackPress}
        activeOpacity={1}
      >
        {/* Track */}
        <View style={styles.track} />
        
        {/* Selected Range */}
        <View
          style={[
            styles.selectedTrack,
            {
              left: minPosition,
              width: maxPosition - minPosition,
            },
          ]}
        />
        
        {/* Min Thumb */}
        <View style={{ position: 'absolute', left: minPosition - 15 }}>
          <Text style={[styles.thumbText, { left: 15 - (formatThumbValue(values[0], maxValue).length * 3) }]}>
            {formatThumbValue(values[0], maxValue)}
          </Text>
          <View
            {...minPanResponder.panHandlers}
            style={[
              styles.thumb,
              { 
                transform: [{ scale: dragging === 'min' ? 1.2 : 1 }],
              },
            ]}
          />
        </View>
        
        {/* Max Thumb */}
        <View style={{ position: 'absolute', left: maxPosition - 15 }}>
          <Text style={[styles.thumbText, { left: 15 - (formatThumbValue(values[1], maxValue).length * 3) }]}>
            {formatThumbValue(values[1], maxValue)}
          </Text>
          <View
            {...maxPanResponder.panHandlers}
            style={[
              styles.thumb,
              { 
                transform: [{ scale: dragging === 'max' ? 1.2 : 1 }],
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  sliderContainer: {
    width: SLIDER_WIDTH,
    height: 60,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 30,
    backgroundColor: '#F4F4F4',
    borderRadius: 15,
  },
  selectedTrack: {
    position: 'absolute',
    height: 30,
    backgroundColor: '#BAFD00',
    borderRadius: 6,
  },
  thumb: {
    position: 'absolute',
    width: 30,
    height: 30,
    backgroundColor: '#333',
    borderRadius: 15,
    top: -15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  thumbText: {
    position: 'absolute',
    top: -35,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: 'white',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default CustomSlider; 