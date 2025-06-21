import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function PersonalInformation() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thông tin cá nhân</Text>
      {/* Thêm nội dung chi tiết ở đây */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
