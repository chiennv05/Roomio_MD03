import {Platform} from 'react-native';

export const Icons = {
  IconArrowLeft: Platform.select({
    ios: 'icon_arrow_left',
    android: 'asset:/icons/icon_arrow_left.png',
  }),
  IconEyesOn: Platform.select({
    ios: 'icon_eyes_on',
    android: 'asset:/icons/icon_eyes_on.png',
  }),
  IconEyesOff: Platform.select({
    ios: 'icon_eyes_off',
    android: 'asset:/icons/icon_eyes_off.png',
  }),
  IconReset: Platform.select({
    ios: 'icon_reset',
    android: 'asset:/icons/icon_reset.png',
  }),
  IconError: Platform.select({
    ios: 'icon_error',
    android: 'asset:/icons/icon_error.png',
  }),
  IconCheck: Platform.select({
    ios: 'icon_check',
    android: 'asset:/icons/icon_check.png',
  }),
};
