import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface EmptySupportProps {
  message?: string;
}

const EmptySupport: React.FC<EmptySupportProps> = ({
  message = 'Không có yêu cầu hỗ trợ nào',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.subText}>
        Bạn có thể tạo yêu cầu hỗ trợ mới từ nút phía dưới
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 18,
    fontWeight: '500',
    color: '#555',
    marginTop: 16,
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: '80%',
  },
});

export default EmptySupport;
