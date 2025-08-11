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
  if (!visible) {return null;}

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Text style={styles.text}>{text}</Text>
      </View>
      <View style={styles.arrow} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: '100%',
    alignSelf: 'center',
    marginBottom: scale(8),
    alignItems: 'center',
  },
  bubble: {
    backgroundColor: Colors.darkGreen,
    paddingVertical: scale(4),
    paddingHorizontal: scale(8),
    borderRadius: scale(8),
    minWidth: scale(80),
  },
  text: {
    color: Colors.white,
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    textAlign: 'center',
    flexShrink: 1,
    flexWrap: 'nowrap',
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: scale(8),
    borderRightWidth: scale(8),
    borderTopWidth: scale(8),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.darkGreen,
    alignSelf: 'center',
  },
});

export default TooltipBubble;
