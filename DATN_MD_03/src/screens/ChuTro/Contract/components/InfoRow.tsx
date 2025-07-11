import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface InfoRowProps {
  label: string;
  value: string | number;
}

const InfoRow: React.FC<InfoRowProps> = ({label, value}) => {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    width: 100,
    color: '#333',
  },
  value: {
    flex: 1,
    color: '#555',
  },
});

export default InfoRow;
