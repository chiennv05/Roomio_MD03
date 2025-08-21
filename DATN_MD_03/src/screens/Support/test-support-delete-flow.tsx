import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useAppDispatch, useAppSelector} from '../../hooks/redux';
import {
  fetchSupportRequests,
  deleteSupportRequest,
} from '../../store/slices/supportSlice';
import {Support} from '../../types/Support';

/**
 * Component test toàn bộ flow delete support
 * Bao gồm: load data -> hiển thị -> delete -> refresh
 */
const TestSupportDeleteFlow: React.FC = () => {
  const dispatch = useAppDispatch();
  const {supportRequests, loading, error, pagination} = useAppSelector(
    state => state.support,
  );
  const [selectedSupport, setSelectedSupport] = useState<Support | null>(null);

  // Load support requests khi component mount
  useEffect(() => {
    loadSupports();
  }, []);

  const loadSupports = () => {
    console.log('🔄 Loading support requests...');
    dispatch(fetchSupportRequests({page: 1, limit: 10}));
  };

  const testDeleteSupport = async (support: Support) => {
    if (!support._id) {
      Alert.alert('Lỗi', 'Support không có ID');
      return;
    }

    if (support.status !== 'mo') {
      Alert.alert(
        'Không thể xóa',
        `Support có status '${support.status}'. Chỉ có thể xóa support có status 'mo'`,
      );
      return;
    }

    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa support "${support.title}"?`,
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Starting delete for support:', support._id);
              setSelectedSupport(support);
              
              const result = await dispatch(deleteSupportRequest(support._id!)).unwrap();
              console.log('✅ Delete successful, result:', result);
              
              Alert.alert('Thành công', 'Đã xóa support request');
              setSelectedSupport(null);
              
              // Refresh danh sách
              loadSupports();
            } catch (error: any) {
              console.log('❌ Delete failed:', error);
              Alert.alert('Lỗi', `Không thể xóa: ${error}`);
              setSelectedSupport(null);
            }
          },
        },
      ],
    );
  };

  const renderSupportItem = (support: Support, index: number) => {
    const isDeleting = selectedSupport?._id === support._id;
    const canDelete = support.status === 'mo';

    return (
      <View key={support._id || index} style={styles.supportItem}>
        <View style={styles.supportHeader}>
          <Text style={styles.supportTitle} numberOfLines={2}>
            {support.title}
          </Text>
          <View style={[styles.statusBadge, getStatusStyle(support.status)]}>
            <Text style={styles.statusText}>{getStatusText(support.status)}</Text>
          </View>
        </View>

        <Text style={styles.supportContent} numberOfLines={3}>
          {support.content}
        </Text>

        <View style={styles.supportMeta}>
          <Text style={styles.metaText}>ID: {support._id}</Text>
          <Text style={styles.metaText}>Status: {support.status}</Text>
          <Text style={styles.metaText}>Category: {support.category}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.deleteButton,
              !canDelete && styles.disabledButton,
              isDeleting && styles.loadingButton,
            ]}
            onPress={() => testDeleteSupport(support)}
            disabled={!canDelete || isDeleting}>
            {isDeleting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.deleteButtonText}>
                {canDelete ? 'Xóa' : 'Không thể xóa'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'mo':
        return {backgroundColor: '#28a745'};
      case 'dangXuLy':
        return {backgroundColor: '#ffc107'};
      case 'hoanTat':
        return {backgroundColor: '#6c757d'};
      default:
        return {backgroundColor: '#dc3545'};
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'mo':
        return 'Mở';
      case 'dangXuLy':
        return 'Đang xử lý';
      case 'hoanTat':
        return 'Hoàn tất';
      default:
        return 'Không xác định';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Test Support Delete Flow</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadSupports}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>Loading: {loading.toString()}</Text>
        <Text style={styles.infoText}>Error: {error || 'None'}</Text>
        <Text style={styles.infoText}>Total: {supportRequests.length}</Text>
        <Text style={styles.infoText}>
          Deletable: {supportRequests.filter(s => s.status === 'mo').length}
        </Text>
      </View>

      {loading && supportRequests.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {supportRequests.map((support, index) =>
            renderSupportItem(support, index),
          )}
          {supportRequests.length === 0 && (
            <Text style={styles.emptyText}>Không có support request nào</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  info: {
    backgroundColor: '#e9ecef',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  infoText: {
    fontSize: 12,
    marginBottom: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  supportItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  supportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  supportContent: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  supportMeta: {
    marginBottom: 15,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  loadingButton: {
    backgroundColor: '#6c757d',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 50,
  },
});

export default TestSupportDeleteFlow;
