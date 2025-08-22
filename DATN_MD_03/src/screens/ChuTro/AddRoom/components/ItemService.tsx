import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {
  moderateScale,
  responsiveFont,
  responsiveIcon,
  SCREEN,
  verticalScale,
} from '../../../../utils/responsive';
import {Colors} from '../../../../theme/color';
import {Icons} from '../../../../assets/icons';
import {Fonts} from '../../../../theme/fonts';
import {ItemSeviceOptions} from '../utils/seviceOptions';

interface ServiceProps {
  status: boolean;
  item: ItemSeviceOptions;
  onPress: (item: ItemSeviceOptions) => void;
}

const WIGHT_IMAGE = SCREEN.width * 0.28;

const ItemService = ({status = false, item, onPress}: ServiceProps) => {
  const iconKey = `${item.iconBase}${status ? 'Selected' : 'Default'}`;
  const icon = Icons[iconKey as keyof typeof Icons];

  const getPriceUnit = (item: ItemSeviceOptions): string => {
    const unitMap: Record<string, Record<string, string>> = {
      electricity: {
        perUsage: '/kWh',
        perPerson: '/người',
        perRoom: '/phòng',
      },
      water: {
        perUsage: '/m³',
        perPerson: '/người',
        perRoom: '/phòng',
      },
      khac: {
        perPerson: '/người',
        perRoom: '/phòng',
        perUsage: '/sử dụng',
      },
    };
    const key =
      item.value === 'electricity' || item.value === 'water'
        ? item.value
        : 'khac';

    return unitMap[key]?.[item.priceType ?? ''] ?? '';
  };

  const priceUnit = getPriceUnit(item);
  const displayPrice = item.price ?? 0;
  console.log('priceUnit:', item);
  return (
    <View
      style={[
        styles.container,
        {backgroundColor: status ? Colors.limeGreen : Colors.backgroud},
      ]}>
      <Image source={{uri: icon}} style={styles.styleIconCenter} />
      <Text style={styles.textTitle}>{item.label}</Text>
      {item.label !== 'Dịch vụ khác' && (
        <Text style={styles.textPrice}>
          {displayPrice}
          {priceUnit ? ` ${priceUnit}` : ''}
        </Text>
      )}
      <TouchableOpacity
        style={[
          styles.button,
          {backgroundColor: status ? Colors.darkGray : Colors.limeGreen},
        ]}
        onPress={() => onPress(item)}>
        <Image
          source={{
            uri:
              item.label === 'Dịch vụ khác'
                ? Icons.IconAdd
                : status
                ? Icons.IconEditWhite
                : Icons.IconEditBlack,
          }}
          style={styles.styleIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(ItemService);

const styles = StyleSheet.create({
  container: {
    width: WIGHT_IMAGE,
    height: WIGHT_IMAGE,
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: verticalScale(3.9),
    marginBottom: verticalScale(10),
  },
  button: {
    width: responsiveIcon(32),
    height: responsiveIcon(32),
    borderRadius: responsiveIcon(32) / 2,
    backgroundColor: Colors.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: -5,
    right: -5,
  },
  styleIcon: {
    width: responsiveIcon(18),
    height: responsiveIcon(18),
  },
  styleIconCenter: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
  },
  textTitle: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(16),
    color: Colors.gray60,
  },
  textPrice: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(16),
    color: Colors.black,
  },
});
