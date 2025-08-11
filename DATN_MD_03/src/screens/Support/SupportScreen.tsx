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

import {Colors} from '../../theme/color';
import {Fonts} from '../../theme/fonts';
import {responsiveFont, responsiveSpacing, scale} from '../../utils/responsive';

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
    backgroundColor: Colors.backgroud,
    paddingBottom: Platform.OS === 'ios' ? 0 : responsiveSpacing(16),
    marginTop: responsiveSpacing(15),
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    padding: responsiveSpacing(16),
    paddingBottom: responsiveSpacing(100), // Tăng padding để tránh che nội dung bởi FAB
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsiveSpacing(20),
  },
  errorText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    marginTop: responsiveSpacing(16),
    textAlign: 'center',
  },
  retryButton: {
    marginTop: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(12),
    paddingHorizontal: responsiveSpacing(20),
    backgroundColor: Colors.primaryGreen,
    borderRadius: scale(8),
  },
  retryButtonText: {
    color: Colors.white,
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(14),
  },
  filterContainer: {
    backgroundColor: Colors.white,
    padding: responsiveSpacing(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  fabButton: {
    position: 'absolute',
    right: responsiveSpacing(20),
    bottom:
      Platform.OS === 'ios' ? responsiveSpacing(20) : responsiveSpacing(30),
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    backgroundColor: Colors.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: responsiveSpacing(16),
    paddingHorizontal: responsiveSpacing(16),
    justifyContent: 'space-between',
    marginBottom: responsiveSpacing(8),
    borderRadius: scale(12),
    marginHorizontal: responsiveSpacing(16),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.primaryGreen,
  },
  statLabel: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    marginTop: responsiveSpacing(4),
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.divider,
  },
});

export default SupportScreen;
