import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {CustomService} from '../../../../types';
import Switch from './Switch';
import {responsiveFont} from '../../../../utils/responsive';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';

interface Props {
  service: CustomService;
  enabled: boolean;
  onToggle: (service: CustomService) => void;
}

const ServiceItem: React.FC<Props> = ({service, enabled, onToggle}) => {
  const getPriceUnit = (
    priceType: 'perUsage' | 'perPerson' | 'perRoom',
  ): string => {
    const unitMap: Record<string, string> = {
      perUsage: '/lần', // hoặc bạn muốn đổi thành đơn vị khác
      perPerson: '/người',
      perRoom: '/phòng',
    };

    return unitMap[priceType] ?? '';
  };

  return (
    <View style={styles.container}>
      <Switch value={enabled} onToggle={() => onToggle(service)} />
      <View style={{flex: 1}}>
        <Text style={styles.name}>
          {service.name} - {service.price.toLocaleString()}đ
          {getPriceUnit(service.priceType)}
        </Text>
        {!!service.description && (
          <Text style={styles.description}>{service.description}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginTop: 12,
  },
  name: {
    fontSize: responsiveFont(16),
    fontWeight: '600',
    color: Colors.black,
    fontFamily: Fonts.Roboto_Bold,
  },
  description: {
    fontSize: responsiveFont(14),
    color: Colors.gray60,
    marginTop: 2,
  },
});

export default ServiceItem;
