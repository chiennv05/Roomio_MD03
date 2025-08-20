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
  StatusBar,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {Colors} from '../../theme/color';
import {Fonts} from '../../theme/fonts';
import {responsiveFont, responsiveSpacing, scale} from '../../utils/responsive';
import {Icons} from '../../assets/icons';

import {Support} from '../../types/Support';
import {RootState} from '../../store';
import {
  fetchSupportRequests,
  deleteSupportRequest,
} from '../../store/slices/supportSlice';
import {
  FilterTabsRow,
  SupportItem,
  EmptySupport,
  Pagination,
} from './components';
import SupportHeader from './components/SupportHeader';
import {RootStackParamList} from '../../types/route';
import CustomAlertModal from '../../components/CustomAlertModal';
import {useCustomAlert} from '../../hooks/useCustomAlrert';

type SupportScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SupportScreen'
>;

const SupportScreen: React.FC = () => {
  const dispatch = useDispatch();
  const {supportRequests, loading, pagination, error} = useSelector(
    (state: RootState) => state.support,
  );
  const navigation = useNavigation<SupportScreenNavigationProp>();
  const {alertConfig, visible, showError, showSuccess, showConfirm, hideAlert} =
    useCustomAlert();
  const statusBarHeight =
    Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

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
      showError('Yêu cầu hỗ trợ đã hoàn tất không thể xóa.', 'Không thể xóa');
      return;
    }

    showConfirm(
      'Bạn có chắc chắn muốn xóa yêu cầu hỗ trợ này?',
      () => {
        if (item._id) {
          dispatch(deleteSupportRequest(item._id) as any)
            .unwrap()
            .then(() => {
              showSuccess('Đã xóa yêu cầu hỗ trợ', 'Thành công');
            })
            .catch((err: any) => {
              showError(err || 'Không thể xóa yêu cầu hỗ trợ', 'Lỗi');
            });
        }
      },
      'Xác nhận xóa',
      [
        {text: 'Hủy', onPress: hideAlert, style: 'cancel'},
        {
          text: 'Xóa',
          onPress: () => {
            /* handled in onConfirm */
          },
          style: 'destructive',
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

  // Render the filter section
  const renderFilters = () => (
    <FilterTabsRow
      statusOptions={statusOptions}
      categoryOptions={categoryOptions}
      selectedStatus={statusFilter}
      selectedCategory={categoryFilter}
      onSelectStatus={setStatusFilter}
      onSelectCategory={setCategoryFilter}
    />
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
          <Image
            source={{uri: Icons.IconError as any}}
            style={{width: scale(60), height: scale(60)}}
          />
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
    <SafeAreaView style={[styles.container, {paddingTop: statusBarHeight}]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroud} />
      <SupportHeader
        title="Yêu cầu hỗ trợ"
        backgroundColor={Colors.backgroud}
      />
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
          source={{uri: Icons.IconAdd as any}}
          style={styles.fabIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Global Alert Modal for this screen */}
      {alertConfig && (
        <CustomAlertModal
          visible={true}
          title={alertConfig.title || 'Thông báo'}
          message={alertConfig.message}
          onClose={hideAlert}
          type={alertConfig.type}
          buttons={alertConfig.buttons}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
    paddingBottom: Platform.OS === 'ios' ? 0 : responsiveSpacing(16),
    paddingTop: responsiveSpacing(5), // Giảm marginTop để đẩy lên trên
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: responsiveSpacing(8), // Giảm padding ngang
    paddingVertical: responsiveSpacing(8), // Giảm padding dọc
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
    backgroundColor: Colors.figmaGreen,
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
  categoryFilterContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: responsiveSpacing(16),
    paddingBottom: responsiveSpacing(16),
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
    backgroundColor: Colors.figmaGreen,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fabIcon: {
    width: scale(24),
    height: scale(24),
    tintColor: Colors.black,
  },
});

export default SupportScreen;
