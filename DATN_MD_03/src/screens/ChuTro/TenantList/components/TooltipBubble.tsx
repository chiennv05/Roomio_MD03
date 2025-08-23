import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, scale} from '../../../../utils/responsive';

interface TooltipBubbleProps {
  text: string;
  visible: boolean;
}

const TooltipBubble: React.FC<TooltipBubbleProps> = ({text, visible}) => {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Text style={styles.text} numberOfLines={2}>{text}</Text>
      </View>
      <View style={styles.arrow} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: '100%', // Changed from top to bottom to appear above avatar
    alignSelf: 'center',
    marginBottom: scale(8),
    alignItems: 'center',
    zIndex: 1000, // Ensure tooltip appears above other elements
  },
  bubble: {
    backgroundColor: Colors.darkGreen,
    paddingVertical: scale(6), // Slightly increased padding for better readability
    paddingHorizontal: scale(12), // Increased horizontal padding
    borderRadius: scale(8),
    minWidth: scale(80),
    maxWidth: scale(200), // Added max width to prevent very long names from breaking layout
    elevation: 5, // Added elevation for Android shadow
    shadowColor: Colors.black, // Added shadow for iOS
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  text: {
    color: Colors.white,
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Medium, // Changed to Medium for better readability
    textAlign: 'center',
    flexShrink: 1,
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: scale(8),
    borderRightWidth: scale(8),
    borderTopWidth: scale(8), // Changed back to borderTopWidth for upward arrow
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.darkGreen, // Changed back to borderTopColor
    alignSelf: 'center',
  },
});

export default TooltipBubble;
