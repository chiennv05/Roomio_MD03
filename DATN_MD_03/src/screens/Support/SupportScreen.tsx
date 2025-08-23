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
import {useAppDispatch, useAppSelector} from '../../hooks/redux';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {Colors} from '../../theme/color';
import {Fonts} from '../../theme/fonts';
import {responsiveFont, responsiveSpacing, scale} from '../../utils/responsive';
import {Icons} from '../../assets/icons';

import {Support} from '../../types/Support';
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
  const dispatch = useAppDispatch();
  const {supportRequests, loading, pagination, error} = useAppSelector(
    state => state.support,
  );
  const navigation = useNavigation<SupportScreenNavigationProp>();
  const {alertConfig, visible, showError, showSuccess, showConfirm, hideAlert} =
    useCustomAlert();
  const statusBarHeight =
    Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  // Optimized handle add new support with useCallback
  const handleAddNewSupport = useCallback(() => {
    navigation.navigate('AddNewSupport');
  }, [navigation]);

  // Filter states - default to "Tất cả"
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Function to load support requests with optimized filtering
  const loadSupportRequests = useCallback(
    (page = 1) => {
      const params: any = {
        page,
        limit: 10,
      };

      // Only add status filter if not "Tất cả" (empty string)
      if (statusFilter) {
        params.status = statusFilter;
      }

      dispatch(fetchSupportRequests(params));
    },
    [dispatch, statusFilter],
  );

  // Load support requests when status filter changes
  useEffect(() => {
    loadSupportRequests(1); // Reset to page 1 when filter changes
  }, [statusFilter, loadSupportRequests]);

  // Refresh data when screen comes into focus (ensures UI updates after add/edit operations)
  useFocusEffect(
    useCallback(() => {
      loadSupportRequests(pagination.page || 1);
      // Return function will be called when screen goes out of focus
      return () => {};
    }, [loadSupportRequests, pagination.page]),
  );

  // Optimized handle item press with useCallback
  const handleItemPress = useCallback((item: Support) => {
    navigation.navigate('SupportDetail', {supportId: item._id || ''});
  }, [navigation]);

  // Optimized handle delete item with useCallback and removed console.log
  const handleDeleteItem = useCallback((item: Support) => {
    // Kiểm tra điều kiện xóa - chỉ cho phép xóa khi status là 'mo'
    if (item.status !== 'mo') {
      const statusText =
        item.status === 'dangXuLy'
          ? 'đang xử lý'
          : item.status === 'hoanTat'
          ? 'đã hoàn tất'
          : 'không xác định';
      showError(`Yêu cầu hỗ trợ ${statusText} không thể xóa.`, 'Không thể xóa');
      return;
    }

    if (!item._id) {
      showError('Không tìm thấy ID yêu cầu hỗ trợ', 'Lỗi');
      return;
    }

    const performDelete = () => {
      dispatch(deleteSupportRequest(item._id!))
        .unwrap()
        .then(() => {
          showSuccess('Đã xóa yêu cầu hỗ trợ', 'Thành công');
          // Refresh current page to reflect changes immediately
          loadSupportRequests(pagination.page || 1);
        })
        .catch((err: any) => {
          showError(err || 'Không thể xóa yêu cầu hỗ trợ', 'Lỗi');
        });
    };

    showConfirm(
      'Bạn có chắc chắn muốn xóa yêu cầu hỗ trợ này?',
      performDelete,
      'Xác nhận xóa',
      [
        {text: 'Hủy', onPress: hideAlert, style: 'cancel'},
        {
          text: 'Xóa',
          onPress: () => {
            hideAlert();
            performDelete();
          },
          style: 'destructive',
        },
      ],
    );
  }, [dispatch, showError, showSuccess, showConfirm, hideAlert, loadSupportRequests, pagination.page]);

  // Optimized handle page change with useCallback
  const handlePageChange = useCallback((page: number) => {
    loadSupportRequests(page);
  }, [loadSupportRequests]);

  // Status filter options - including "Tất cả" option
  const statusOptions = [
    {key: '', label: 'Tất cả'},
    {key: 'mo', label: 'Mở'},
    {key: 'dangXuLy', label: 'Đang xử lý'},
    {key: 'hoanTat', label: 'Hoàn tất'},
  ];

  // Render the filter section - only status tabs
  const renderFilters = () => (
    <FilterTabsRow
      statusOptions={statusOptions}
      categoryOptions={[]} // No category options
      selectedStatus={statusFilter}
      selectedCategory={''}
      onSelectStatus={setStatusFilter}
      onSelectCategory={() => {}} // No category selection
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
          visible={visible}
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
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(8),
    paddingBottom: responsiveSpacing(120), // Tăng padding để tránh che nội dung bởi FAB
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
    backgroundColor: Colors.darkGreen,
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
    right: responsiveSpacing(16),
    bottom:
      Platform.OS === 'ios' ? responsiveSpacing(32) : responsiveSpacing(32),
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    backgroundColor: Colors.darkGreen,
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
    tintColor: Colors.white,
  },
});

export default SupportScreen;
