import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {Icons} from '../../../assets/icons';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {
  scale,
  verticalScale,
  responsiveFont,
  responsiveSpacing,
  SCREEN,
  responsiveIcon,
} from '../../../utils/responsive';
import {AppDispatch, RootState} from '../../../store';
import {fetchMyContracts} from '../../../store/slices/contractSlice';
import ContractItem from './components/ContractItem';
import EmptyContract from './components/EmptyContract';
import {ItemInput, UIHeader} from '../MyRoom/components';
import FilterStatusItem from './components/FilterStatusItem';
import {filterOptionsContract} from './utils/filterContract';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';

const ContractManagement = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchText, setSearchText] = useState('');
  const {contracts, pagination, loading} = useSelector(
    (state: RootState) => state.contract,
  );

  // Load contracts
  const loadContracts = useCallback(
    async ({
      page = currentPage,
      limit = itemsPerPage,
      status = selectedFilter,
      roomName = searchText,
    }: {
      page?: number;
      limit?: number;
      status?: string;
      roomName?: string;
    }) => {
      const statusToSend = status === 'all' ? undefined : status;
      await dispatch(
        fetchMyContracts({
          page,
          limit,
          status: statusToSend,
          roomName,
        }),
      );
    },
    [currentPage, itemsPerPage, selectedFilter, searchText, dispatch],
  );

  // Gọi load khi filter hoặc page thay đổi
  useEffect(() => {
    loadContracts({
      page: currentPage,
      status: selectedFilter,
      roomName: searchText,
    });
  }, [selectedFilter, currentPage, loadContracts, searchText]);

  // Kéo để làm mới
  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await loadContracts({page: 1, status: selectedFilter});
    setRefreshing(false);
  };

  // Load thêm khi scroll tới cuối
  const loadMoreContracts = async () => {
    if (loadingMore || loading) return;
    if (pagination && currentPage >= pagination.totalPages) return;

    setLoadingMore(true);
    const nextPage = currentPage + 1;
    await loadContracts({page: nextPage, status: selectedFilter});
    setCurrentPage(nextPage);
    setLoadingMore(false);
  };

  const handleClickFilter = useCallback((value: string) => {
    setSelectedFilter(value);
    setCurrentPage(1);
  }, []);

  const handleGoBack = () => navigation.goBack();
  const handleGoContractDetail = (contractId: string) => {
    navigation.navigate('ContractDetail', {contractId});
  };
  const handleGoAddContract = () => {
    navigation.navigate('AddContractNoNotification');
  };
  return (
    <SafeAreaView style={styles.container}>
      <UIHeader
        title="Quản lý hợp đồng"
        iconLeft={Icons.IconArrowLeft}
        onPressLeft={handleGoBack}
      />

      <View style={styles.conatinerSearch}>
        <ItemInput
          placeholder="Tìm hợp đồng theo tên phòng"
          value={searchText}
          onChangeText={setSearchText}
          editable={true}
          width={SCREEN.width * 0.9}
        />
      </View>

      {/* Filter */}
      <View style={styles.conatinerFilter}>
        <FlatList
          keyExtractor={(_, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterOptionsContract}
          renderItem={({item, index}) => (
            <FilterStatusItem
              item={item}
              isSelected={item.value === selectedFilter}
              onPress={handleClickFilter}
              index={index}
            />
          )}
        />
      </View>

      {/* Danh sách hợp đồng */}
      <View style={{flex: 1}}>
        <FlatList
          data={contracts}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({item}) => (
            <ContractItem contract={item} onPress={handleGoContractDetail} />
          )}
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
          onEndReached={loadMoreContracts}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={!loading ? <EmptyContract /> : null}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                size="small"
                color={Colors.darkGreen}
                style={{marginVertical: 10}}
              />
            ) : null
          }
        />
      </View>

      {/* Nút thêm hợp đồng */}
      <TouchableOpacity
        style={styles.buttonAddRoom}
        onPress={handleGoAddContract}>
        <Image source={{uri: Icons.IconAdd}} style={styles.styleIcon} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
    alignItems: 'center',
  },
  conatinerFilter: {
    width: SCREEN.width,
    justifyContent: 'center',
    marginVertical: responsiveSpacing(20),
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
  containerListRooms: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonAddRoom: {
    position: 'absolute',
    bottom: responsiveSpacing(20),
    right: responsiveSpacing(20),
    width: responsiveIcon(44),
    height: responsiveIcon(44),
    backgroundColor: Colors.limeGreen,
    borderRadius: responsiveIcon(44) / 2,
    padding: responsiveSpacing(12),
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  styleIcon: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
  },

  conatinerSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: SCREEN.width * 0.9,
    marginTop: responsiveSpacing(10),
  },
});

export default ContractManagement;
