import {Platform} from 'react-native';

export const Images = {
  ImageRoomio: Platform.select({
    ios: 'image_romio',
    android: 'asset:/images/image_romio.png',
  }),
  ImageBackgroundButton: Platform.select({
    ios: 'image_backgroud_button',
    android: 'asset:/images/image_backgroud_button.png',
  }),
  ImageCCCD1: Platform.select({
    ios: 'image_cccd1',
    android: 'asset:/images/image_cccd_1.png',
  }),
  ImageCCCD2: Platform.select({
    ios: 'image_cccd2',
    android: 'asset:/images/image_cccd_2.png',
  }),
  ImageCCCD3: Platform.select({
    ios: 'image_cccd3',
    android: 'asset:/images/image_cccd_3.png',
  }),
  ImageLogo: Platform.select({
    ios: 'image_logo',
    android: 'asset:/images/image_logo.png',
  }),
};
