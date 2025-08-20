import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform,
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
} from '../../../utils/responsive';
import {AppDispatch, RootState} from '../../../store';
import {fetchMyContracts} from '../../../store/slices/contractSlice';

import FilterStatusItem from '../../ChuTro/Contract/components/FilterStatusItem';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';
import {UIHeader} from '../../ChuTro/MyRoom/components';
import EmptyContract from '../../ChuTro/Contract/components/EmptyContract';
import ContractItem from '../../ChuTro/Contract/components/ContractItem';
import {filterOptionsContract} from './utils/filterContract';

const ContractLessee = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const {contracts, loading} = useSelector(
    (state: RootState) => state.contract,
  );

  // Load contracts với params truyền vào
  const loadContracts = useCallback(
    async ({
      page = currentPage,
      limit = itemsPerPage,
      status = selectedFilter,
    }: {
      page?: number;
      limit?: number;
      status?: string;
    }) => {
      const statusToSend = status === 'all' ? undefined : status;
      await dispatch(
        fetchMyContracts({
          page,
          limit,
          status: statusToSend,
        }),
      );
    },
    [dispatch, currentPage, itemsPerPage, selectedFilter],
  );

  // Gọi load khi filter hoặc page thay đổi
  useEffect(() => {
    loadContracts({page: currentPage, status: selectedFilter});
  }, [selectedFilter, currentPage, loadContracts]); // thiếu 'loadContracts'

  // Kéo để làm mới
  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1); // reset về trang đầu
    await loadContracts({page: 1, status: selectedFilter});
    setRefreshing(false);
  };

  // Chọn filter
  const handleClickFilter = useCallback((value: string) => {
    setSelectedFilter(value);
    setCurrentPage(1);
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleGoContractDetail = (contractId: string) => {
    navigation.navigate('ContractDetailLessee', {contractId});
  };
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={[styles.content, {paddingTop: statusBarHeight}]}>
        <UIHeader
          title="Hợp đồng của tôi"
          iconLeft={Icons.IconArrowLeft}
          onPressLeft={handleGoBack}
        />

        <View style={styles.conatinerFilter}>
          <FlatList
            keyExtractor={(_, index) => index.toString()}
            horizontal={true}
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

        <View style={styles.containerListRooms}>
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.darkGreen} />
            </View>
          ) : contracts.length === 0 ? (
            <EmptyContract />
          ) : (
            <FlatList
              data={contracts}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({item, index}) => (
                <ContractItem
                  key={index}
                  contract={item}
                  onPress={handleGoContractDetail}
                />
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
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
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
  },
});

export default ContractLessee;
