import React, {useState, useEffect, useMemo} from 'react';
import {
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform,
  View,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {RootState, AppDispatch} from '../../../store';
import {Colors} from '../../../theme/color';
import {
  scale,
  verticalScale,
} from '../../../utils/responsive';
import {fetchTenants} from '../../../store/slices/tenantSlice';
import {TenantFilters} from '../../../types/Tenant';

// Import các component tái sử dụng
import HeaderWithBack from './components/HeaderWithBack';
import TenantItem from './components/TenantItem';
import SearchBar from './components/SearchBar';
import {LoadingView, ErrorView} from './components/LoadingAndError';
import EmptyTenantList from './components/EmptyTenantList';

const TenantList = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const {tenants, loading, error} = useSelector(
    (state: RootState) => state.tenant,
  );
  const token = useSelector((state: RootState) => state.auth.token);
  
  const [searchText, setSearchText] = useState('');
  const [filters] = useState<TenantFilters>({
    page: 1,
    limit: 50, // Tăng giới hạn để hiển thị nhiều hơn
    search: '',
    status: '',
  });

  // Lọc danh sách người thuê có contractStatus là "active"
  const activeTenants = useMemo(() => {
    if (!tenants || tenants.length === 0) return [];
    console.log('Checking tenant contract statuses:');
    tenants.forEach(tenant => {
      console.log(`Tenant ${tenant.username} - contractStatus: ${tenant.contractStatus}`);
    });
    return tenants.filter(tenant => tenant.contractStatus === 'active');
  }, [tenants]);

  useEffect(() => {
    if (token) {
      console.log('Fetching tenants with token:', token ? 'Valid token' : 'No token');
      dispatch(fetchTenants({token, filters}));
    }
  }, [dispatch, token, filters]);

  // Log state để debug
  console.log('TenantList state:', {
    loading,
    error,
    tenantsLength: tenants?.length || 0,
    activeTenantsLength: activeTenants.length,
    hasToken: !!token,
  });

  // Log chi tiết về tenants
  console.log('Tenants data:', JSON.stringify(tenants, null, 2));
  console.log('Active tenants:', JSON.stringify(activeTenants, null, 2));

  // Hàm xử lý khi nhấn tìm kiếm
  const handleSearch = () => {
   
  };

  // Render khi đang loading
  if (loading && (!tenants || tenants.length === 0)) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <View style={styles.container}>
          <HeaderWithBack title="Danh sách người thuê" />
          <LoadingView message="Đang tải dữ liệu..." />
        </View>
      </SafeAreaView>
    ); 
  }

  // Render khi có lỗi
  if (error && (!tenants || tenants.length === 0)) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <View style={styles.container}>
          <HeaderWithBack title="Danh sách người thuê" />
          <ErrorView 
            error={error} 
            onRetry={() => dispatch(fetchTenants({token: token || '', filters}))} 
          />
        </View>
      </SafeAreaView>
    );
  }

  // Render khi không có người thuê active
  if (!loading && activeTenants.length === 0) {
    console.log('Rendering empty tenant list - No active tenants');
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <View style={styles.container}>
          <HeaderWithBack title="Danh sách người thuê" />
          <SearchBar
            placeholder="Tìm kiếm theo tên, email, số điện thoại"
            value={searchText}
            onChangeText={setSearchText}
            onSubmit={handleSearch}
          />
          <EmptyTenantList />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={styles.container}>
        <HeaderWithBack title="Danh sách người thuê" />
        <SearchBar
          placeholder="Tìm kiếm theo tên, email, số điện thoại"
          value={searchText}
          onChangeText={setSearchText}
          onSubmit={handleSearch}
        />
        <FlatList
          data={activeTenants}
          renderItem={({item}) => <TenantItem item={item} />}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onRefresh={() => dispatch(fetchTenants({token: token || '', filters}))}
          refreshing={loading}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
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
