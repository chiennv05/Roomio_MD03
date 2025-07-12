import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Image,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {Support} from '../../types/Support';
import {RootState} from '../../store';
import {
  fetchSupportRequests,
  deleteSupportRequest,
} from '../../store/slices/supportSlice';
import {
  SupportHeader,
  FilterMenu,
  SupportItem,
  EmptySupport,
  Pagination,
} from './components';
import {RootStackParamList} from '../../types/route';

type SupportScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SupportScreen'
>;

const SupportScreen: React.FC = () => {
  const dispatch = useDispatch();
  const {supportRequests, loading, pagination, summary, error} = useSelector(
    (state: RootState) => state.support,
  );
  const navigation = useNavigation<SupportScreenNavigationProp>();

  const handleAddNewSupport = () => {
    navigation.navigate('AddNewSupport');
  };

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Function to load support requests with filters
  const loadSupportRequests = useCallback(
    (page = 1) => {
      const params: any = {
        page,
        limit: 10,
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (categoryFilter) {
        params.category = categoryFilter;
      }

      dispatch(fetchSupportRequests(params) as any);
    },
    [dispatch, statusFilter, categoryFilter],
  );

  // Load support requests when filters change
  useEffect(() => {
    loadSupportRequests(1); // Reset to page 1 when filters change
  }, [statusFilter, categoryFilter, loadSupportRequests]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSupportRequests(pagination.page || 1);
      // Return function will be called when screen goes out of focus
      return () => {};
    }, [loadSupportRequests, pagination.page]),
  );

  // Handle item press
  const handleItemPress = (item: Support) => {
    navigation.navigate('SupportDetail', {supportId: item._id || ''});
  };

  // Handle delete item
  const handleDeleteItem = (item: Support) => {
    if (item.status === 'hoanTat') {
      Alert.alert(
        'Không thể xóa',
        'Yêu cầu hỗ trợ đã hoàn tất không thể xóa.',
        [{text: 'Đồng ý'}],
      );
      return;
    }

    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa yêu cầu hỗ trợ này?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            if (item._id) {
              dispatch(deleteSupportRequest(item._id) as any)
                .unwrap()
                .then(() => {
                  // Success notification
                  Alert.alert('Thành công', 'Đã xóa yêu cầu hỗ trợ');
                })
                .catch((err: any) => {
                  // Error notification
                  Alert.alert('Lỗi', err || 'Không thể xóa yêu cầu hỗ trợ');
                });
            }
          },
        },
      ],
    );
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    loadSupportRequests(page);
  };

  // Status filter options - keys match backend values
  const statusOptions = [
    {key: '', label: 'Tất cả'},
    {key: 'mo', label: 'Mở'},
    {key: 'dangXuLy', label: 'Đang xử lý'},
    {key: 'hoanTat', label: 'Hoàn tất'},
  ];

  // Category filter options - keys match backend values
  const categoryOptions = [
    {key: '', label: 'Tất cả'},
    {key: 'kyThuat', label: 'Kỹ thuật'},
    {key: 'thanhToan', label: 'Thanh toán'},
    {key: 'hopDong', label: 'Hợp đồng'},
    {key: 'khac', label: 'Khác'},
  ];

  // Render statistics bar
  const renderStatsBar = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{summary.totalRequests}</Text>
        <Text style={styles.statLabel}>Tổng số</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{summary.openRequests}</Text>
        <Text style={styles.statLabel}>Mở</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{summary.processingRequests}</Text>
        <Text style={styles.statLabel}>Đang xử lý</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{summary.completedRequests}</Text>
        <Text style={styles.statLabel}>Hoàn tất</Text>
      </View>
    </View>
  );

  // Render the filter section
  const renderFilters = () => (
    <View style={styles.filterContainer}>
      <FilterMenu
        title="Lọc theo trạng thái"
        options={statusOptions}
        selectedValue={statusFilter}
        onSelect={setStatusFilter}
      />
      <FilterMenu
        title="Lọc theo danh mục"
        options={categoryOptions}
        selectedValue={categoryFilter}
        onSelect={setCategoryFilter}
      />
    </View>
  );

  // Render content based on loading state
  const renderContent = () => {
    if (loading && supportRequests.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      );
    }

    if (error && supportRequests.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Icon name="error-outline" size={60} color="#f44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadSupportRequests()}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={supportRequests}
        keyExtractor={item => item._id || Math.random().toString()}
        renderItem={({item}) => (
          <SupportItem
            item={item}
            onPress={handleItemPress}
            onDelete={handleDeleteItem}
          />
        )}
        contentContainerStyle={
          supportRequests.length === 0 ? {flex: 1} : styles.listContent
        }
        ListEmptyComponent={<EmptySupport />}
        refreshing={loading}
        onRefresh={() => loadSupportRequests()}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <SupportHeader title="Yêu cầu hỗ trợ" />
      {renderStatsBar()}
      {renderFilters()}
      <View style={styles.contentContainer}>{renderContent()}</View>
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
      <TouchableOpacity style={styles.fabButton} onPress={handleAddNewSupport}>
        <Image
          source={require('../../assets/icons/icon_add.png')}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingBottom: Platform.OS === 'ios' ? 0 : 16,
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Tăng padding để tránh che nội dung bởi FAB
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#555',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  filterContainer: {
    backgroundColor: 'white',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fabButton: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 20 : 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
});

export default SupportScreen;
