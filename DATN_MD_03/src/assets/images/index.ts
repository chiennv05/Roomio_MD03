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
};
