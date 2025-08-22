import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {
  moderateScale,
  scale,
  SCREEN,
  verticalScale,
} from '../../../utils/responsive';
import {Image} from 'react-native';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';

interface ItemIntroductProps {
  image: string;
  title: string;
}
const ItemIntroduct = ({image, title}: ItemIntroductProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.containerImage}>
        <Image
          source={{uri: image}}
          style={styles.styleImage}
          resizeMode="cover"
        />
      </View>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
};

export default React.memo(ItemIntroduct);
const styles = StyleSheet.create({
  container: {
    width: SCREEN.width * 0.9,

    flexDirection: 'row',
    marginVertical: verticalScale(5),
  },
  containerImage: {
    padding: moderateScale(10),
    backgroundColor: Colors.backgroud,
    borderRadius: moderateScale(10),
  },
  styleImage: {
    width: scale(100),
    height: verticalScale(70),
  },
  text: {
    fontSize: moderateScale(16),
    color: Colors.black,
    marginLeft: scale(10),
    flex: 1,
    alignSelf: 'center',
    fontWeight: '500',
    fontFamily: Fonts.Roboto_Regular,
  },
});
