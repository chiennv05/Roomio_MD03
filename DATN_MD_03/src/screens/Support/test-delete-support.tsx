import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import {useAppDispatch, useAppSelector} from '../../hooks/redux';
import {deleteSupportRequest, fetchSupportRequests} from '../../store/slices/supportSlice';

/**
 * Component test để kiểm tra chức năng xóa support
 * Sử dụng component này để debug vấn đề xóa support
 */
const TestDeleteSupport: React.FC = () => {
  const dispatch = useAppDispatch();
  const {supportRequests, loading, error} = useAppSelector(state => state.support);

  // Test xóa support request đầu tiên trong danh sách
  const testDeleteFirstSupport = async () => {
    if (supportRequests.length === 0) {
      Alert.alert('Lỗi', 'Không có support request nào để test');
      return;
    }

    const firstSupport = supportRequests[0];
    console.log('🧪 Testing delete for support:', firstSupport);

    if (!firstSupport._id) {
      Alert.alert('Lỗi', 'Support request không có ID');
      return;
    }

    if (firstSupport.status !== 'mo') {
      Alert.alert('Lỗi', `Support status là '${firstSupport.status}', chỉ có thể xóa status 'mo'`);
      return;
    }

    try {
      console.log('🔄 Dispatching delete...');
      const result = await dispatch(deleteSupportRequest(firstSupport._id)).unwrap();
      console.log('✅ Delete result:', result);
      Alert.alert('Thành công', 'Đã xóa support request');
      
      // Refresh danh sách
      dispatch(fetchSupportRequests({page: 1, limit: 10}));
    } catch (error) {
      console.log('❌ Delete error:', error);
      Alert.alert('Lỗi', `Không thể xóa: ${error}`);
    }
  };

  // Load support requests để test
  const loadSupports = () => {
    dispatch(fetchSupportRequests({page: 1, limit: 10}));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Delete Support</Text>
      
      <TouchableOpacity style={styles.button} onPress={loadSupports}>
        <Text style={styles.buttonText}>Load Support Requests</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={testDeleteFirstSupport}>
        <Text style={styles.buttonText}>Test Delete First Support</Text>
      </TouchableOpacity>

      <View style={styles.info}>
        <Text>Loading: {loading.toString()}</Text>
        <Text>Error: {error || 'None'}</Text>
        <Text>Support Count: {supportRequests.length}</Text>
        {supportRequests.length > 0 && (
          <Text>First Support Status: {supportRequests[0].status}</Text>
        )}
      </View>

      <View style={styles.supportList}>
        {supportRequests.slice(0, 3).map((support, index) => (
          <View key={support._id || index} style={styles.supportItem}>
            <Text style={styles.supportTitle}>{support.title}</Text>
            <Text style={styles.supportStatus}>Status: {support.status}</Text>
            <Text style={styles.supportId}>ID: {support._id}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  info: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  supportList: {
    flex: 1,
  },
  supportItem: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  supportTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  supportStatus: {
    color: '#666',
    marginBottom: 3,
  },
  supportId: {
    color: '#999',
    fontSize: 12,
  },
});

export default TestDeleteSupport;
