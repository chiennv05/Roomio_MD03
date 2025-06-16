import {Platform} from 'react-native';

export const Icons = {
  IconArrowLeft: Platform.select({
    ios: 'icon_arrow_left',
    android: 'asset:/icons/icon_arrow_left.png',
  }),
  IconArrowDown: Platform.select({
    ios: 'icon_arrowdown',
    android: 'asset:/icons/icon_arrowdown.png',
  }),
  IconRemoveFilter: Platform.select({
    ios: 'icon_removefilter',
    android: 'asset:/icons/icon_removefilter.png',
  }),
  IconNotification: Platform.select({
    ios: 'icon_notification',
    android: 'asset:/icons/icon_notification.png',
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
  IconHeartDefaut: Platform.select({
    ios: 'icon_heart_defaut',
    android: 'asset:/icons/icon_heart_defaut.png',
  }),
  IconHeart: Platform.select({
    ios: 'icon_heart',
    android: 'asset:/icons/icon_heart.png',
  }),
  IconHomeDefaut: Platform.select({
    ios: 'icon_home_defaut',
    android: 'asset:/icons/icon_home_defaut.png',
  }),
  IconHome: Platform.select({
    ios: 'icon_home',
    android: 'asset:/icons/icon_home.png',
  }),
  IconPerson: Platform.select({
    ios: 'icon_person',
    android: 'asset:/icons/icon_person.png',
  }),
  IconPersonDefaut: Platform.select({
    ios: 'icon_person_defaut',
    android: 'asset:/icons/icon_person_defaut.png',
  }),
  IconSearch: Platform.select({
    ios: 'icon_search',
    android: 'asset:/icons/icon_search.png',
  }),
  IconSearchDefaut: Platform.select({
    ios: 'Icon_search_defaut',
    android: 'asset:/icons/Icon_search_defaut.png',
  }),
};
