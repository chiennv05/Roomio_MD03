import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert, TextInput} from 'react-native';
import supportService from '../../store/services/supportService';

/**
 * Component debug để test trực tiếp API delete support
 * Sử dụng để kiểm tra xem API có hoạt động không
 */
const DebugDeleteAPI: React.FC = () => {
  const [supportId, setSupportId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Test API delete trực tiếp
  const testDeleteAPI = async () => {
    if (!supportId.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập Support ID');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log('🧪 Testing direct API call for ID:', supportId);
      const response = await supportService.deleteSupportRequest(supportId.trim());
      console.log('📡 Direct API response:', response);
      
      setResult({
        success: true,
        response: response,
        message: 'API call successful'
      });
      
      Alert.alert('Thành công', 'API call thành công! Kiểm tra console để xem response.');
    } catch (error: any) {
      console.log('❌ Direct API error:', error);
      
      setResult({
        success: false,
        error: error,
        message: error?.message || 'API call failed'
      });
      
      Alert.alert('Lỗi', `API call thất bại: ${error?.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  // Test lấy danh sách support để có ID
  const testGetSupports = async () => {
    setLoading(true);
    try {
      console.log('🧪 Getting support list...');
      const response = await supportService.getSupportRequests({page: 1, limit: 5});
      console.log('📡 Support list response:', response);
      
      if ('isError' in response) {
        Alert.alert('Lỗi', response.message);
        return;
      }
      
      const supports = response.data.data.supportRequests;
      if (supports.length > 0) {
        const firstSupport = supports[0];
        setSupportId(firstSupport._id || '');
        Alert.alert('Thành công', `Đã load ${supports.length} support requests. ID đầu tiên: ${firstSupport._id}`);
      } else {
        Alert.alert('Thông báo', 'Không có support request nào');
      }
    } catch (error: any) {
      console.log('❌ Get supports error:', error);
      Alert.alert('Lỗi', `Không thể lấy danh sách: ${error?.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Delete Support API</Text>
      
      <TouchableOpacity style={styles.button} onPress={testGetSupports} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Loading...' : 'Get Support List & Fill ID'}
        </Text>
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Support ID:</Text>
        <TextInput
          style={styles.input}
          value={supportId}
          onChangeText={setSupportId}
          placeholder="Nhập Support ID để test delete"
          multiline={false}
        />
      </View>

      <TouchableOpacity 
        style={[styles.deleteButton, loading && styles.disabledButton]} 
        onPress={testDeleteAPI} 
        disabled={loading || !supportId.trim()}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Deleting...' : 'Test Delete API'}
        </Text>
      </TouchableOpacity>

      {result && (
        <View style={[styles.resultContainer, result.success ? styles.successResult : styles.errorResult]}>
          <Text style={styles.resultTitle}>
            {result.success ? '✅ Success' : '❌ Error'}
          </Text>
          <Text style={styles.resultMessage}>{result.message}</Text>
          <Text style={styles.resultDetails}>
            {JSON.stringify(result.success ? result.response : result.error, null, 2)}
          </Text>
        </View>
      )}
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
    marginBottom: 15,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  resultContainer: {
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  successResult: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
  },
  errorResult: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultMessage: {
    fontSize: 14,
    marginBottom: 10,
  },
  resultDetails: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
});

export default DebugDeleteAPI;
