import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {Suggestion} from '../../../../types/Suggestion';

interface AddressProps {
  item: Suggestion;
  onPress: (item: Suggestion) => void;
}

const ItemAddress = ({item, onPress}: AddressProps) => {
  return (
    <TouchableOpacity style={styles.item} onPress={() => onPress(item)}>
      <Text numberOfLines={2}>{item.display_name}</Text>
    </TouchableOpacity>
  );
};

export default ItemAddress;

const styles = StyleSheet.create({
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
});
