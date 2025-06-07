import {Platform} from 'react-native';

export const Icons = {
  IconArrowLeft: Platform.select({
    ios: 'icon_arrow_left',
    android: 'asset:/icons/icon_arrow_left.png',
  }),
};
