import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';

export const buttonLink = () => {
  return (
    <View>
      <Text>buttonLink</Text>
    </View>
  );
};

// Component Button có thể tái sử dụng
export default function CustomButton({title}: {title: string}) {
  return (
    <TouchableOpacity style={styles.button}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
});
