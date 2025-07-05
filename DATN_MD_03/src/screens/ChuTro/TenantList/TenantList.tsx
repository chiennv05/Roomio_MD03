import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import {RootState, AppDispatch} from '../../../store';
import {Colors} from '../../../theme/color';
import {
  scale,
  verticalScale,
} from '../../../utils/responsive';
import {fetchTenants} from '../../../store/slices/tenantSlice';
import {TenantFilters} from '../../../types/Tenant';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';
import {Icons} from '../../../assets/icons';

// Import các component tái sử dụng
import HeaderWithBack from './components/HeaderWithBack';
import TenantItem from './components/TenantItem';
import SearchBar from './components/SearchBar';
import Pagination from './components/Pagination';
import {LoadingView, ErrorView, EmptyView} from './components/LoadingAndError';

type TenantListNavigationProp = StackNavigationProp<RootStackParamList>;

const TenantList = () => {
  const navigation = useNavigation<TenantListNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const {tenants, loading, error, pagination} = useSelector(
    (state: RootState) => state.tenant,
  );
  const token = useSelector((state: RootState) => state.auth.token);
  
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<TenantFilters>({
    page: 1,
    limit: 10,
    search: '',
    status: '',
  });

  useEffect(() => {
    if (token) {
      dispatch(fetchTenants({token, filters}));
    }
  }, [dispatch, token, filters]);

  // Hàm xử lý khi nhấn tìm kiếm
  const handleSearch = () => {
    setFilters(prev => ({...prev, search: searchText, page: 1}));
  };

  // Hàm xử lý khi chuyển trang
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      setFilters(prev => ({...prev, page: newPage}));
    }
  };

  // Render khi đang loading
  if (loading && (!tenants || tenants.length === 0)) {
    return (
      <SafeAreaView style={styles.container}>
        <HeaderWithBack title="Danh sách người thuê" />
        <LoadingView message="Đang tải dữ liệu..." />
      </SafeAreaView>
    );
  }

  // Render khi có lỗi
  if (error && (!tenants || tenants.length === 0)) {
    return (
      <SafeAreaView style={styles.container}>
        <HeaderWithBack title="Danh sách người thuê" />
        <ErrorView 
          error={error} 
          onRetry={() => dispatch(fetchTenants({token: token || '', filters}))} 
        />
      </SafeAreaView>
    );
  }

  // Render khi không có người thuê
  if (!loading && (!tenants || tenants.length === 0)) {
    return (
      <SafeAreaView style={styles.container}>
        <HeaderWithBack title="Danh sách người thuê" />
        <SearchBar
          placeholder="Tìm kiếm theo tên, email, số điện thoại"
          value={searchText}
          onChangeText={setSearchText}
          onSubmit={handleSearch}
        />
        <EmptyView message="Không có người thuê nào" icon={Icons.IconEmptyMessage} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithBack title="Danh sách người thuê" />
      <SearchBar
        placeholder="Tìm kiếm theo tên, email, số điện thoại"
        value={searchText}
        onChangeText={setSearchText}
        onSubmit={handleSearch}
      />
      <FlatList
        data={tenants}
        renderItem={({item}) => <TenantItem item={item} />}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onRefresh={() => dispatch(fetchTenants({token: token || '', filters}))}
        refreshing={loading}
        ListFooterComponent={
          pagination ? (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              hasPrevPage={pagination.hasPrevPage}
              hasNextPage={pagination.hasNextPage}
              onPageChange={handlePageChange}
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  listContainer: {
    padding: scale(10),
    paddingBottom: verticalScale(20),
  },
});

export default TenantList;
