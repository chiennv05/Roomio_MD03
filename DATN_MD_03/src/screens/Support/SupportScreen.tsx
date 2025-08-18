import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  SafeAreaView,
  Platform,
  Alert,
  StatusBar,
  Animated,
  RefreshControl,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Image} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';

import {Colors} from '../../theme/color';
import {Fonts} from '../../theme/fonts';
import {responsiveFont, responsiveSpacing, scale} from '../../utils/responsive';

import {
  Support,
  SupportStatusFilter,
  SupportCategoryFilter,
  SUPPORT_STATUS_COLORS,
  STATUS_FILTER_OPTIONS,
  CATEGORY_FILTER_OPTIONS,
} from '../../types/Support';
import {RootState} from '../../store';
import {
  fetchSupportRequests,
  deleteSupportRequest,
} from '../../store/slices/supportSlice';
import {
  SupportHeader,
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
  const {supportRequests, loading, pagination, error} = useSelector(
    (state: RootState) => state.support,
  );
  const navigation = useNavigation<SupportScreenNavigationProp>();

  const handleAddNewSupport = () => {
    navigation.navigate('AddNewSupport');
  };

  // 🎨 Beautiful Filter States
  const [statusFilter, setStatusFilter] =
    useState<SupportStatusFilter>('tatCa');
  const [categoryFilter, setCategoryFilter] =
    useState<SupportCategoryFilter>('tatCa');

  // Function to load support requests with filters
  const loadSupportRequests = useCallback(
    (page = 1) => {
      const params: any = {
        page,
        limit: 10,
      };

      if (statusFilter && statusFilter !== 'tatCa') {
        params.status = statusFilter;
      }

      if (categoryFilter && categoryFilter !== 'tatCa') {
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

  // 🎨 Beautiful Filter Options with Colors
  const statusOptions = STATUS_FILTER_OPTIONS.map(option => ({
    key: option.key,
    label: option.label,
    color: option.color,
    isActive: statusFilter === option.key,
  }));

  const categoryOptions = CATEGORY_FILTER_OPTIONS.map(option => ({
    key: option.key,
    label: option.label,
    color: option.color,
    isActive: categoryFilter === option.key,
  }));

  // 🎨 Beautiful Filter Section
  const renderFilters = () => (
    <View style={styles.filtersSection}>
      {/* Status Filter */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterTitle}>TRẠNG THÁI</Text>
        <View style={styles.filterRow}>
          {statusOptions.map(option => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterTab,
                option.isActive && [
                  styles.filterTabActive,
                  {backgroundColor: option.color},
                ],
              ]}
              onPress={() =>
                setStatusFilter(option.key as SupportStatusFilter)
              }>
              <Text
                style={[
                  styles.filterTabText,
                  option.isActive && styles.filterTabTextActive,
                ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterTitle}>DANH MỤC</Text>
        <View style={styles.filterRow}>
          {categoryOptions.map(option => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterTab,
                option.isActive && [
                  styles.filterTabActive,
                  {backgroundColor: option.color},
                ],
              ]}
              onPress={() =>
                setCategoryFilter(option.key as SupportCategoryFilter)
              }>
              <Text
                style={[
                  styles.filterTabText,
                  option.isActive && styles.filterTabTextActive,
                ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  // Render loading state
  const renderLoadingState = () => (
    <View style={styles.centerContainer}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.limeGreen} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    </View>
  );

  // Render error state
  const renderErrorState = () => (
    <View style={styles.centerContainer}>
      <View style={styles.errorContainer}>
        <View style={styles.errorIconContainer}>
          <Image
            source={require('../../assets/icons/icon_error.png')}
            style={styles.errorIcon}
          />
        </View>
        <Text style={styles.errorTitle}>Có lỗi xảy ra</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadSupportRequests()}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render modern summary stats with animations
  const renderSummaryStats = () => {
    const totalRequests = supportRequests.length;
    const openRequests = supportRequests.filter(
      item => item.status === 'mo',
    ).length;
    const processingRequests = supportRequests.filter(
      item => item.status === 'dangXuLy',
    ).length;
    const completedRequests = supportRequests.filter(
      item => item.status === 'hoanTat',
    ).length;

    const statsData = [
      {
        number: totalRequests,
        label: 'Tổng yêu cầu',
        color: Colors.limeGreen,
        bgColor: Colors.white,
        icon: require('../../assets/icons/icon_light_report.png'),
      },
      {
        number: openRequests,
        label: 'Đang mở',
        color: SUPPORT_STATUS_COLORS.mo,
        bgColor: Colors.white,
        icon: require('../../assets/icons/icon_eyes_on.png'),
      },
      {
        number: processingRequests,
        label: 'Đang xử lý',
        color: SUPPORT_STATUS_COLORS.dangXuLy,
        bgColor: Colors.white,
        icon: require('../../assets/icons/icon_warning.png'),
      },
      {
        number: completedRequests,
        label: 'Hoàn tất',
        color: SUPPORT_STATUS_COLORS.hoanTat,
        bgColor: Colors.white,
        icon: require('../../assets/icons/icon_check.png'),
      },
    ];

    return (
      <View style={styles.summaryRow}>
        {statsData.map((stat, index) => (
          <View key={index} style={styles.summaryCard}>
            <View
              style={[
                styles.summaryIconContainer,
                {backgroundColor: stat.color},
              ]}>
              <Image source={stat.icon} style={styles.summaryIcon} />
            </View>
            <Text style={[styles.summaryNumber, {color: stat.color}]}>
              {stat.number}
            </Text>
            <Text style={styles.summaryLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    );
  };

  // Render content based on loading state
  const renderContent = () => {
    if (loading && supportRequests.length === 0) {
      return renderLoadingState();
    }

    if (error && supportRequests.length === 0) {
      return renderErrorState();
    }

    return (
      <View style={styles.contentWrapper}>
        {supportRequests.length > 0 && renderSummaryStats()}
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
            supportRequests.length === 0
              ? styles.emptyListContent
              : styles.listContent
          }
          ListEmptyComponent={<EmptySupport />}
          refreshing={loading}
          onRefresh={() => loadSupportRequests()}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.limeGreen} />

      {/* Beautiful Header with Gradient */}
      <LinearGradient
        colors={[Colors.limeGreen, Colors.limeGreen]}
        style={styles.headerGradient}>
        <SupportHeader title="Yêu cầu hỗ trợ" />

        {/* Summary Stats integrated in header */}
        {supportRequests.length > 0 && renderSummaryStats()}
      </LinearGradient>

      {/* Beautiful Filters */}
      {renderFilters()}

      {/* Main content */}
      <View style={styles.contentContainer}>{renderContent()}</View>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </View>
      )}

      {/* Enhanced FAB Button */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={handleAddNewSupport}
        activeOpacity={0.8}>
        <LinearGradient
          colors={[Colors.limeGreen, Colors.darkGreen]}
          style={styles.fabGradient}>
          <Text style={styles.fabText}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
    paddingTop: responsiveSpacing(5),
  },

  // Beautiful Header with gradient
  headerGradient: {
    paddingBottom: responsiveSpacing(20),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },

  // Header styles
  headerContainer: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1,
  },

  // 🎨 Beautiful Filter Section
  filtersSection: {
    backgroundColor: Colors.white,
    paddingVertical: responsiveSpacing(16),
    paddingHorizontal: responsiveSpacing(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },

  filterGroup: {
    marginBottom: responsiveSpacing(16),
  },

  filterTitle: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Medium,
    color: Colors.textGray,
    marginBottom: responsiveSpacing(8),
    letterSpacing: 0.5,
  },

  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: responsiveSpacing(8),
  },

  filterTab: {
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(8),
    borderRadius: scale(20),
    backgroundColor: Colors.lightGray,
    borderWidth: 1,
    borderColor: Colors.divider,
  },

  filterTabActive: {
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  filterTabText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Medium,
    color: Colors.textGray,
  },

  filterTabTextActive: {
    color: Colors.white,
    fontFamily: Fonts.Roboto_Bold,
  },

  // Filters styles (legacy)
  filtersContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },

  // Content styles
  contentContainer: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },

  contentWrapper: {
    flex: 1,
  },

  // Summary stats styles
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: responsiveSpacing(16),
    marginTop: responsiveSpacing(16),
    borderRadius: scale(12),
    padding: responsiveSpacing(16),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  summaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: responsiveSpacing(8),
  },

  summaryNumber: {
    fontSize: responsiveFont(24),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.limeGreen,
    marginBottom: responsiveSpacing(4),
  },

  summaryLabel: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    textAlign: 'center',
  },

  // Summary stats in header styles
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(16),
  },

  // List styles
  listContent: {
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(8),
    paddingBottom: responsiveSpacing(100),
  },

  emptyListContent: {
    flex: 1,
    paddingHorizontal: responsiveSpacing(16),
  },

  // Loading state styles
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsiveSpacing(20),
  },

  loadingContainer: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: responsiveSpacing(32),
    borderRadius: scale(16),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  loadingText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    marginTop: responsiveSpacing(16),
  },

  // Summary icon styles
  summaryIconContainer: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveSpacing(8),
  },

  summaryIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: Colors.white,
  },

  // Error icon style
  errorIcon: {
    width: scale(48),
    height: scale(48),
    tintColor: Colors.error,
  },

  // FAB text style
  fabText: {
    fontSize: responsiveFont(28),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
    textAlign: 'center',
  },

  // Error state styles
  errorContainer: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: responsiveSpacing(32),
    borderRadius: scale(16),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxWidth: '90%',
  },

  errorIconContainer: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: Colors.rejectedBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveSpacing(16),
  },

  errorTitle: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(8),
    textAlign: 'center',
  },

  errorText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    marginBottom: responsiveSpacing(24),
    textAlign: 'center',
    lineHeight: responsiveFont(20),
  },

  retryButton: {
    paddingVertical: responsiveSpacing(12),
    paddingHorizontal: responsiveSpacing(24),
    backgroundColor: Colors.limeGreen,
    borderRadius: scale(25),
    shadowColor: Colors.limeGreen,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  retryButtonText: {
    color: Colors.white,
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(14),
    textAlign: 'center',
  },

  // Pagination styles
  paginationContainer: {
    backgroundColor: Colors.white,
    paddingVertical: responsiveSpacing(12),
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },

  // FAB Button styles
  fabButton: {
    position: 'absolute',
    right: responsiveSpacing(20),
    bottom:
      Platform.OS === 'ios' ? responsiveSpacing(30) : responsiveSpacing(30),
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    shadowColor: Colors.limeGreen,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: scale(30),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SupportScreen;
