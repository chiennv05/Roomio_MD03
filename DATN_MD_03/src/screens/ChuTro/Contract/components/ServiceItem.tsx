import React from 'react';
import {View, Text, StyleSheet, Switch} from 'react-native';
import {CustomService} from '../../../../types';

interface Props {
  service: CustomService;
  enabled: boolean;
  onToggle: (service: CustomService) => void;
}

const ServiceItem: React.FC<Props> = ({service, enabled, onToggle}) => {
  return (
    <View style={styles.container}>
      <Switch value={enabled} onValueChange={() => onToggle(service)} />
      <View style={{flex: 1}}>
        <Text style={styles.name}>
          {service.name} - {service.price.toLocaleString()}đ (
          {service.priceType})
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
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
});

export default ServiceItem;
