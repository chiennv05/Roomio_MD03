import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
  Image,
} from 'react-native';
import {useRoute, RouteProp, useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector, useDispatch} from 'react-redux';
import {RootState, AppDispatch} from '../../../store';
import {
  fetchTenantDetails,
  resetTenantDetail,
} from '../../../store/slices/tenantSlice';
import {RootStackParamList} from '../../../types/route';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {responsiveFont, scale} from '../../../utils/responsive';
import {formatDate} from '../../../utils/formatDate';
import HeaderWithBack from './components/HeaderWithBack';
import LoadingAnimation from '../../../components/LoadingAnimation';

const StatusBadge = ({
  text,
  type = 'success',
}: {
  text: string;
  type?: 'success' | 'error' | 'neutral';
}) => (
  <View
    style={[
      styles.badge,
      type === 'success' && {backgroundColor: Colors.limeGreen},
      type === 'error' && {backgroundColor: Colors.error},
      type === 'neutral' && styles.badgeNeutral,
    ]}>
    <Text
      style={[styles.badgeText, type === 'neutral' && styles.badgeNeutralText]}>
      {text}
    </Text>
  </View>
);

const TenantDetailScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'TenantDetail'>>();
  const {tenantId} = route.params;
  const insets = useSafeAreaInsets();

  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const {selectedTenant, activeContract, detailLoading} = useSelector(
    (state: RootState) => state.tenant,
  );

  // Animated occupancy progress
  const progressAnim = React.useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (token && tenantId) {
      dispatch(fetchTenantDetails({token, tenantId}));
    }
    return () => {
      dispatch(resetTenantDetail());
    };
  }, [dispatch, token, tenantId]);

  useEffect(() => {
    const max = activeContract?.contractInfo?.maxOccupancy || 1;
    const count = activeContract?.contractInfo?.tenantCount || 0;
    const target = Math.min(1, count / Math.max(1, max));
    Animated.timing(progressAnim, {
      toValue: target,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [
    activeContract?.contractInfo?.tenantCount,
    activeContract?.contractInfo?.maxOccupancy,
    progressAnim,
  ]);

  // Refetch khi màn hình quay lại để đồng bộ người ở cùng sau khi chỉnh sửa
  useFocusEffect(
    React.useCallback(() => {
      if (token && tenantId) {
        dispatch(fetchTenantDetails({token, tenantId}));
      }
      return undefined;
    }, [dispatch, token, tenantId]),
  );

  const renderInfoRow = (
    label: string,
    value: string | number | undefined | null,
  ) => (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value ?? 'Không có'}</Text>
    </View>
  );

  if (!selectedTenant) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <HeaderWithBack
          title="Chi tiết người thuê"
          backgroundColor={Colors.white}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>
            Không tìm thấy thông tin người thuê
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (detailLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <HeaderWithBack
          title="Chi tiết người thuê"
          backgroundColor={Colors.white}
        />
        <View style={styles.loadingContainer}>
          <LoadingAnimation />
        </View>
      </SafeAreaView>
    );
  }

  // Bỏ biến không dùng và sắp xếp lại thứ tự hiển thị theo yêu cầu

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <SafeAreaView style={[styles.safeArea, {paddingTop: insets.top}]}>
        <HeaderWithBack
          title="Chi tiết người thuê"
          backgroundColor={Colors.white}
        />

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}>
          {/* Tổng quan đẹp mắt: Phòng, sức chứa, số đang ở, chip thành viên */}
          {activeContract && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>
                Phòng {activeContract.contractInfo.roomNumber}
              </Text>
              <Text style={styles.summarySubTitle}>
                {activeContract.contractInfo.tenantCount}/
                {activeContract.contractInfo.maxOccupancy} người đang ở
              </Text>
              <View style={styles.progressContainer}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }) as any,
                    },
                  ]}
                />
              </View>

              <View style={styles.peopleRow}>
                <View style={[styles.personChip, styles.representativeChip]}>
                  {selectedTenant.avatar ? (
                    <Image
                      source={{uri: selectedTenant.avatar}}
                      style={styles.avtCotenaant}
                    />
                  ) : (
                    <Text style={[styles.personInitial]}>
                      {(
                        selectedTenant.fullName ||
                        selectedTenant.username ||
                        'N'
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  )}
                  <View style={styles.personInfo}>
                    <Text style={[styles.personName, {color: Colors.white}]}>
                      Đại diện:{' '}
                      {selectedTenant.fullName || selectedTenant.username}
                    </Text>
                    <Text style={[styles.personMeta, {color: Colors.white}]}>
                      SĐT {selectedTenant.phone}
                    </Text>
                  </View>
                </View>

                {activeContract.contractInfo.coTenants?.map((co: any, idx) => (
                  <View key={`cotenant-${idx}`} style={styles.personChip}>
                    {co.avatar ? (
                      <Image
                        source={{uri: co.avatar}}
                        style={styles.avtCotenaant}
                      />
                    ) : (
                      <Text style={styles.personInitial}>
                        {((co.fullName || co.username || 'N') as string)
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    )}
                    <View style={styles.personInfo}>
                      <Text style={styles.personName}>
                        {co.fullName || co.username || 'Không rõ'}
                      </Text>
                      <Text style={styles.personMeta}>
                        {co.phone || 'SĐT: -'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
          {/* Bỏ phần Thông tin phòng hiện tại theo yêu cầu */}

          {/* 2) Thông tin người đại diện (người thuê chính) */}
          <View style={[styles.section, styles.card]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Thông tin người đại diện</Text>
            </View>
            {renderInfoRow('Họ tên:', selectedTenant.fullName)}
            {renderInfoRow('Tên đăng nhập:', selectedTenant.username)}
            {renderInfoRow('Số điện thoại:', selectedTenant.phone)}
            {renderInfoRow('Email:', selectedTenant.email)}
            {renderInfoRow('CCCD:', selectedTenant.identityNumber)}
            {renderInfoRow('Ngày sinh:', formatDate(selectedTenant.birthDate))}
            {renderInfoRow('Địa chỉ:', selectedTenant.address)}
            {/* {renderInfoRow('Ngày tạo:', formatDate(selectedTenant.createdAt))} */}
          </View>

          {/* 3) Thông tin người ở cùng phòng (có thể thêm/xóa) */}
          {activeContract && (
            <View style={[styles.section, styles.card]}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>
                  Thông tin người ở cùng phòng
                </Text>
                <View style={styles.headerRight}>
                  <StatusBadge
                    text={`${
                      activeContract.contractInfo.coTenants?.length || 0
                    } người`}
                    type="neutral"
                  />
                </View>
              </View>

              {activeContract.contractInfo.coTenants?.map((coTenant, index) => (
                <View key={index} style={styles.coTenantCard}>
                  <View style={styles.coHeaderRow}>
                    <View
                      style={[
                        styles.coAvatar,
                        {
                          backgroundColor: coTenant.avatar
                            ? Colors.white
                            : Colors.limeGreen,
                        },
                      ]}>
                      {coTenant.avatar ? (
                        <Image
                          source={{uri: coTenant.avatar}}
                          style={styles.avtCotenaant}
                        />
                      ) : (
                        <Text style={styles.coAvatarText}>
                          {(
                            (coTenant as any).fullName ||
                            coTenant.username ||
                            'N'
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <View style={styles.flex1}>
                      <Text style={styles.coName}>
                        {(coTenant as any).fullName ||
                          coTenant.username ||
                          'Không rõ'}
                      </Text>
                      <Text style={styles.coSub}>
                        {coTenant.phone || 'SĐT: -'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.coDivider} />
                  {renderInfoRow(
                    'Họ tên:',
                    (coTenant as any).fullName ||
                      coTenant.username ||
                      'Không có',
                  )}
                  {renderInfoRow(
                    'Tên đăng nhập:',
                    coTenant.username || 'Không có',
                  )}
                  {renderInfoRow(
                    'Số điện thoại:',
                    coTenant.phone || 'Không có',
                  )}
                  {renderInfoRow('Email:', coTenant.email || 'Không có')}
                  {renderInfoRow(
                    'CCCD:',
                    coTenant.identityNumber || 'Không có',
                  )}
                  {renderInfoRow(
                    'Ngày sinh:',
                    coTenant.birthDate
                      ? formatDate(coTenant.birthDate)
                      : 'Không có',
                  )}
                  {renderInfoRow('Địa chỉ:', coTenant.address || 'Không có')}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: responsiveFont(16),
    color: Colors.darkGreen,
    fontFamily: Fonts.Roboto_Regular,
  },
  errorText: {
    fontSize: responsiveFont(16),
    color: Colors.error,
    fontFamily: Fonts.Roboto_Regular,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: 0,
    marginBottom: scale(12),
    paddingHorizontal: scale(20),
    paddingVertical: scale(20),
    marginTop: scale(0),
  },
  summaryCard: {
    backgroundColor: Colors.dearkOlive,
    marginHorizontal: scale(0),
    marginBottom: scale(12),
    paddingHorizontal: scale(20),
    paddingVertical: scale(20),
    borderBottomLeftRadius: scale(16),
    borderBottomRightRadius: scale(16),
  },
  summaryTitle: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
  },
  summarySubTitle: {
    marginTop: scale(6),
    fontSize: responsiveFont(15),
    color: Colors.white,
  },
  progressContainer: {
    height: scale(10),
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: scale(6),
    overflow: 'hidden',
    marginTop: scale(12),
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.limeGreen,
    borderRadius: scale(6),
  },
  peopleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
    marginTop: scale(12),
  },
  personChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: scale(20),
    paddingVertical: scale(8),
    paddingHorizontal: scale(12),
    elevation: 1,
  },
  representativeChip: {
    backgroundColor: Colors.darkGreen,
  },
  personInitial: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: Colors.limeGreen,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: Colors.black,
    fontFamily: Fonts.Roboto_Bold,
    marginRight: scale(8),
  },
  personInfo: {
    flexDirection: 'column',
  },
  personName: {
    fontSize: responsiveFont(15),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  personMeta: {
    fontSize: responsiveFont(12),
    color: Colors.textGray,
  },
  sectionTitle: {
    fontSize: responsiveFont(19),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: scale(16),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(12),
    gap: scale(8),
  },
  headerRight: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  sectionAccent: {
    width: scale(6),
    height: scale(20),
    backgroundColor: Colors.limeGreen,
    borderRadius: scale(4),
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: scale(14),
    alignItems: 'flex-start',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    elevation: 1,
  },
  highlightBox: {
    marginTop: scale(8),
    marginBottom: scale(8),
    paddingVertical: scale(10),
    paddingHorizontal: scale(12),
    backgroundColor: '#F5FFF0',
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: Colors.limeGreen,
  },
  highlightLabel: {
    fontSize: responsiveFont(12),
    color: Colors.darkGreen,
    fontFamily: Fonts.Roboto_Medium,
  },
  highlightValue: {
    marginTop: scale(4),
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  label: {
    fontSize: responsiveFont(15),
    fontFamily: Fonts.Roboto_Medium,
    color: Colors.darkGray,
    width: scale(130),
    letterSpacing: 0.2,
  },
  value: {
    fontSize: responsiveFont(17),
    fontFamily: Fonts.Roboto_Medium,
    color: Colors.black,
    flex: 1,
    lineHeight: scale(24),
    letterSpacing: 0.15,
  },
  coTenantItem: {
    marginBottom: scale(16),
    paddingBottom: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  coTenantCard: {
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    padding: scale(12),
    marginBottom: scale(12),
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  coHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(8),
  },
  coAvatar: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(10),
  },
  coAvatarText: {
    color: Colors.black,
    fontFamily: Fonts.Roboto_Bold,
  },
  coName: {
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  coSub: {
    color: Colors.textGray,
    fontSize: responsiveFont(12),
  },
  coDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: scale(8),
  },
  coTenantTitle: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGreen,
    marginBottom: scale(8),
  },
  contractHistoryItem: {
    marginBottom: scale(16),
    paddingBottom: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  contractTitle: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGreen,
    marginBottom: scale(8),
  },
  flex1: {flex: 1},
  badge: {
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
    borderRadius: scale(20),
  },
  badgeText: {
    fontSize: responsiveFont(12),
    color: Colors.black,
    fontFamily: Fonts.Roboto_Bold,
  },
  badgeNeutral: {
    backgroundColor: Colors.limeGreenOpacityLight,
    borderWidth: 1,
    borderColor: Colors.limeGreen,
  },
  badgeNeutralText: {
    color: Colors.darkGreen,
  },
  editButton: {
    backgroundColor: Colors.limeGreenOpacityLight,
    borderRadius: scale(16),
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
  },
  editButtonText: {
    color: Colors.darkGreen,
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(12),
  },
  primaryCta: {
    backgroundColor: Colors.limeGreen,
    borderRadius: scale(24),
    paddingVertical: scale(12),
    alignItems: 'center',
    marginBottom: scale(12),
  },
  primaryCtaText: {
    color: Colors.black,
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(14),
  },
  avtCotenaant: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    marginRight: scale(8),
  },
});

export default TenantDetailScreen;
