import React, {useState, useEffect, useMemo} from 'react';
import {
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector, useDispatch} from 'react-redux';
import {RootState, AppDispatch} from '../../../store';
import {Colors} from '../../../theme/color';
import {
  responsiveSpacing,
} from '../../../utils/responsive';
import {fetchTenants} from '../../../store/slices/tenantSlice';
import {TenantFilters} from '../../../types/Tenant';

// Import các component tái sử dụng
import HeaderWithBack from './components/HeaderWithBack';
import {useFocusEffect} from '@react-navigation/native';
import TenantItem from './components/TenantItem';
import SearchBar from './components/SearchBar';
import {LoadingView, ErrorView} from './components/LoadingAndError';
import EmptyTenantList from './components/EmptyTenantList';

const TenantList = () => {
  const insets = useSafeAreaInsets();
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
    if (!tenants || tenants.length === 0) {return [];}
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

  // Refetch khi màn danh sách focus trở lại (sau khi cập nhật ở màn chi tiết/UpdateTenant)
  useFocusEffect(
    React.useCallback(() => {
      if (token) {
        dispatch(fetchTenants({token, filters}));
      }
      return undefined;
    }, [dispatch, token, filters]),
  );

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
      <View style={styles.mainContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroud} />
        <SafeAreaView style={[styles.safeArea, {paddingTop: insets.top}]}>
          <HeaderWithBack title="Danh sách người thuê" />
          <View style={styles.container}>
            <LoadingView message="Đang tải dữ liệu..." />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Render khi có lỗi
  if (error && (!tenants || tenants.length === 0)) {
    return (
      <View style={styles.mainContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <SafeAreaView style={[styles.safeArea, {paddingTop: insets.top}]}>
          <HeaderWithBack title="Danh sách người thuê" />
          <View style={styles.container}>
            <ErrorView
              error={error}
              onRetry={() => dispatch(fetchTenants({token: token || '', filters}))}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Render khi không có người thuê active
  if (!loading && activeTenants.length === 0) {
    console.log('Rendering empty tenant list - No active tenants');
    return (
      <View style={styles.mainContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <SafeAreaView style={[styles.safeArea, {paddingTop: insets.top}]}>
          <HeaderWithBack title="Danh sách người thuê" />
          <View style={styles.container}>
            <SearchBar
              placeholder="Tìm kiếm theo tên, email, số điện thoại"
              value={searchText}
              onChangeText={setSearchText}
              onSubmit={handleSearch}
            />
            <EmptyTenantList />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <SafeAreaView style={[styles.safeArea, {paddingTop: insets.top}]}>
        <HeaderWithBack title="Danh sách người thuê" />
        <View style={styles.container}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  listContainer: {
    paddingHorizontal: responsiveSpacing(20),
    paddingBottom: responsiveSpacing(20),
  },
});

export default TenantList;
