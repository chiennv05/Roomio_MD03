import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {Icons} from '../../../assets/icons';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {SCREEN, scale, verticalScale, responsiveFont} from '../../../utils/responsive';
import {AppDispatch, RootState} from '../../../store';
import {fetchMyContracts} from '../../../store/slices/contractSlice';
import ContractItem from './components/ContractItem';
import EmptyContract from './components/EmptyContract';
import FilterStatus from './components/FilterStatus';
import Pagination from './components/Pagination';

const ContractManagement = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const {contracts, pagination, loading, error} = useSelector(
    (state: RootState) => state.contract,
  );

  // Tải danh sách hợp đồng
  useEffect(() => {
    loadContracts();
  }, [filterStatus, currentPage]);

  const loadContracts = async () => {
    try {
      await dispatch(
        fetchMyContracts({
          page: currentPage,
          limit: itemsPerPage,
          status: filterStatus || undefined,
        }),
      );
    } catch (error) {
      console.error('Failed to load contracts:', error);
    }
  };

  // Xử lý khi kéo để làm mới
  const onRefresh = async () => {
    setRefreshing(true);
    await loadContracts();
    setRefreshing(false);
  };

  // Thay đổi trạng thái lọc
  const handleFilterChange = (status: string | null) => {
    setFilterStatus(status);
    setCurrentPage(1); // Quay về trang đầu tiên khi thay đổi bộ lọc
  };

  // Thay đổi trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Hiển thị lỗi
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Image
              source={{uri: Icons.IconArrowBack}}
              style={{width: 24, height: 24}}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý hợp đồng</Text>
          <View style={styles.emptyView} />
        </View>

        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Có lỗi xảy ra: {error}. Vui lòng thử lại.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadContracts}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Image
            source={{uri: Icons.IconArrowBack}}
            style={{width: 24, height: 24}}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý hợp đồng</Text>
        <View style={styles.emptyView} />
      </View>

      <FilterStatus
        selectedStatus={filterStatus}
        onSelectStatus={handleFilterChange}
      />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.darkGreen} />
        </View>
      ) : contracts.length === 0 ? (
        <EmptyContract />
      ) : (
        <>
          <FlatList
            data={contracts}
            keyExtractor={item => item._id}
            renderItem={({item}) => <ContractItem contract={item} />}
            contentContainerStyle={styles.contractList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.darkGreen]}
                tintColor={Colors.darkGreen}
              />
            }
          />

          {pagination && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray150,
  },
  backButton: {
    padding: scale(8),
  },
  headerTitle: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(18),
    color: Colors.black,
  },
  emptyView: {
    width: scale(40),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contractList: {
    padding: scale(16),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  errorText: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(16),
    color: Colors.red,
    textAlign: 'center',
    marginBottom: verticalScale(16),
  },
  retryButton: {
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(10),
    backgroundColor: Colors.darkGreen,
    borderRadius: 8,
  },
  retryText: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(16),
    color: Colors.white,
  },
});

export default ContractManagement;
