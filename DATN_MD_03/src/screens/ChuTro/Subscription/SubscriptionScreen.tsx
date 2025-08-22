import React, {useEffect, useMemo, useRef, useState} from 'react';
import {StyleSheet, Text, View, StatusBar, InteractionManager, ScrollView} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {SCREEN, responsiveFont, scale, verticalScale, responsiveSpacing} from '../../../utils/responsive';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import {loadPlans, loadSubscriptions} from '../../../store/slices/subscriptionSlice';
import Carousel from 'react-native-reanimated-carousel';
import HeaderWithBack from '../TenantList/components/HeaderWithBack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSharedValue} from 'react-native-reanimated';
import PlanHeroCard from './components/PlanHeroCard';
import IndicatorBar from './components/IndicatorBar';
import {getUpgradeQuote} from '../../../store/slices/subscriptionSlice';
import LoadingOverlay from '../../../components/LoadingOverlay';
import {useCustomAlert} from '../../../hooks/useCustomAlrert';
import CustomAlertModal from '../../../components/CustomAlertModal';
import ManagePlanModal from './components/ManagePlanModal';
// Chuyển sang màn hình riêng hiển thị QR full-screen

const SubscriptionScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {plans, current, loading, quote, quotesByPlan} = useSelector((s: RootState) => s.subscription);
  const pending = useSelector((s: RootState) => (s.subscription as any).pending);
  const items = useSelector((s: RootState) => (s.subscription as any).items || []);
  const token = useSelector((s: RootState) => s.auth.token);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const currentPlan = (current?.plan || '').toLowerCase();
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);
  const [_activeIndex, setActiveIndex] = useState(0);
  const {showError, visible, alertConfig, hideAlert} = useCustomAlert() as any;
  const [manageOpen, setManageOpen] = useState(false);

  useEffect(() => {
    dispatch(loadPlans());
    if (token) {
      dispatch(loadSubscriptions(token));
    }
  }, [dispatch, token]);
  // Sắp xếp theo giá tăng dần; xác định index gói hiện tại
  const dataOrdered = useMemo(
    () => [...plans].sort((a, b) => (a.price || 0) - (b.price || 0)),
    [plans],
  );
  const currentItem = useMemo(
    () => dataOrdered.find(p => (p.key || '').toLowerCase() === currentPlan),
    [dataOrdered, currentPlan],
  );
  const defaultIndex = useMemo(() => {
    const idx = dataOrdered.findIndex(p => (p.key || '').toLowerCase() === currentPlan);
    return idx >= 0 ? idx : 0;
  }, [dataOrdered, currentPlan]);

  // Bảng màu gradient mở rộng để dùng cho 7-8+ gói, tránh trùng màu
  const PLAN_GRADIENTS: [string, string][] = [
    ['#E9FFB7', '#BAFD00'], // vibrant lime (FREE)
    ['#BAFD00', '#A5F000'], // lime neon (PRO)
    ['#c4b5fd', '#a5b4fc'], // violet → indigo (BUSINESS)
    ['#99f6e4', '#67e8f9'], // teal → sky
    ['#fbcfe8', '#f5d0fe'], // pink → fuchsia
    ['#fde68a', '#fca5a5'], // amber → rose
    ['#93c5fd', '#60a5fa'], // blue → light blue
    ['#bbf7d0', '#86efac'], // emerald → green
    ['#fcd34d', '#f59e0b'], // amber strong
    ['#fecaca', '#fda4af'], // red-pale → rose
  ];

  const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = hash * 31 + str.charCodeAt(i);
      // clamp to 32-bit range to avoid overflow
      if (hash > 2147483647) { hash -= 4294967296; }
      if (hash < -2147483648) { hash += 4294967296; }
    }
    return Math.abs(hash);
  };

  const getPlanColors = (key: string) => {
    const k = (key || '').toLowerCase();
    if (k === 'free') { return PLAN_GRADIENTS[0]; }
    if (k === 'pro') { return PLAN_GRADIENTS[1]; }
    if (k === 'business') { return PLAN_GRADIENTS[2]; }
    const idx = hashString(k) % PLAN_GRADIENTS.length;
    return PLAN_GRADIENTS[idx];
  };

  // Badge theo dải giá 0 → 1.000.000 VND, bước 100k
  const getBadgeLabelByPrice = (price: number): string | undefined => {
    if (!price || price <= 0) {
      return 'Bắt đầu miễn phí';
    }
    // làm tròn về bậc 100k trong khoảng 100k..1.000k
    const band = Math.min(10, Math.max(1, Math.round(price / 100_000)));
    const labels: Record<number, string> = {
      1: 'Tiết kiệm & hiệu quả',
      2: 'Được chọn nhiều',
      3: 'Khuyến nghị cho chủ trọ',
      4: 'Nâng cao quản lý',
      5: 'Tối ưu hiệu suất',
      6: 'Chuyên nghiệp',
      7: 'Doanh nghiệp nhỏ',
      8: 'Mở rộng quy mô',
      9: 'Cao cấp',
      10: 'Tối ưu cho chuyên nghiệp',
    };
    return labels[band] || undefined;
  };

  const historyOrdered = useMemo(() => {
    const arr = Array.isArray(items) ? items : [];
    return [...arr].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  }, [items]);

  const formatDateTime = (d?: string) => {
    if (!d) { return '-'; }
    const date = new Date(d);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mi} ${dd}/${mm}/${yyyy}`;
  };

  const getPlanNameByKey = (key?: string) => {
    if (!key) { return undefined; }
    const k = key.toLowerCase();
    const found = plans?.find(p => (p.key || '').toLowerCase() === k);
    return found?.name || key;
  };

  const renderStatusChip = (status?: string) => {
    const s = (status || '').toLowerCase();
    const map: any = {
      active: {bg: '#DCFCE7', fg: '#16a34a', label: 'Đã xử lý'},
      pending: {bg: '#FEF3C7', fg: '#f59e0b', label: 'Đang xử lý'},
      rejected: {bg: '#FEE2E2', fg: '#ef4444', label: 'Từ chối'},
      expired: {bg: '#E5E7EB', fg: '#6b7280', label: 'Hết hạn'},
    };
    const cfg = map[s] || {bg: '#E5E7EB', fg: '#374151', label: s || '—'};
    return (
      <View style={[styles.statusChip, {backgroundColor: cfg.bg}]}> 
        <Text style={[styles.statusChipText, {color: cfg.fg}]}>{cfg.label}</Text>
      </View>
    );
  };

  // Lấy báo giá theo plan khi người dùng lướt tới card đó
  useEffect(() => {
    setActiveIndex(defaultIndex);
  }, [defaultIndex]);

  // Prefetch thông minh: chỉ load các gói lân cận trước để tránh đơ UI, phần còn lại tải nền
  const prefetchedRef = useRef(new Set<string>());
  useEffect(() => {
    if (!token || !plans?.length) { return; }
    const center = defaultIndex;
    const indices = [center, center - 1, center + 1].filter(i => i >= 0 && i < plans.length);
    InteractionManager.runAfterInteractions(() => {
      indices.forEach((i, idx) => {
        const p = plans[i];
        const k = (p.key || '').toLowerCase();
        if (k === currentPlan) { return; }
        if (quotesByPlan[p.key] || prefetchedRef.current.has(p.key)) { return; }
        prefetchedRef.current.add(p.key);
        setTimeout(() => {
          dispatch(getUpgradeQuote({token, plan: p.key}));
        }, 120 * idx);
      });
    });

    // Prefetch các gói còn lại theo nền, tuần tự và trễ để không chặn khung hình
    const others = plans
      .map((p, i) => ({p, i}))
      .filter(({i}) => !indices.includes(i));
    const timer = setTimeout(() => {
      InteractionManager.runAfterInteractions(() => {
        others.forEach(({p}, idx) => {
          const k = (p.key || '').toLowerCase();
          if (k === currentPlan) { return; }
          if (quotesByPlan[p.key] || prefetchedRef.current.has(p.key)) { return; }
          prefetchedRef.current.add(p.key);
          setTimeout(() => {
            dispatch(getUpgradeQuote({token, plan: p.key}));
          }, 200 * idx);
        });
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [plans, token, currentPlan, defaultIndex, quotesByPlan, dispatch]);

  // Thu nhỏ width để lộ hai cạnh card kế bên rõ hơn
  const cardWidth = SCREEN.width - scale(50);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#BAFD00', '#F4F4F4']}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={[
          styles.header,
          {
            paddingTop: insets.top + responsiveSpacing(8),
          },
        ]}
      >
        <HeaderWithBack title="Gói đăng ký" backgroundColor="transparent" />
        <Text style={styles.headerSubtitle}>Chọn gói phù hợp với nhu cầu của bạn</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* bỏ dải tím hai bên theo yêu cầu */}

        <Carousel
          width={cardWidth}
          height={verticalScale(480)}
          data={dataOrdered}
          defaultIndex={defaultIndex}
          mode="parallax"
          modeConfig={{parallaxScrollingScale: 0.86, parallaxScrollingOffset: 70}}
          scrollAnimationDuration={700}
          onProgressChange={(_, absoluteProgress) => {
            progress.value = absoluteProgress;
          }}
          onSnapToItem={setActiveIndex}
          renderItem={({item}) => {
            const isCurrent = (item.key || '').toLowerCase() === currentPlan;
            const isLower = !!currentItem && (item.price || 0) < (currentItem.price || 0);
            const isHigher = !!currentItem && (item.price || 0) > (currentItem.price || 0);
            const routeLabel = isCurrent
              ? 'Đang là gói này'
              : isHigher
              ? `${currentItem?.name ?? 'Hiện tại'} → ${item.name}`
              : `${item.name}`;
            const expected = quotesByPlan[item.key]?.expectedAmount ?? null;
            const priceText = isCurrent
              ? ''
              : expected !== null
              ? (expected === 0 ? 'Miễn phí' : `${expected.toLocaleString('vi-VN')} ${quote?.currency || item.currency}`)
              : (item.price === 0 ? 'Miễn phí' : `${item.price.toLocaleString('vi-VN')} ${item.currency}`);
            const durationText = item.durationDays ? `${item.durationDays} ngày` : undefined;
            const maxRoomsRaw = Number(item.maxActiveRooms ?? -1);
            const isUnlimited = maxRoomsRaw === -1 || maxRoomsRaw >= 999999;
            const maxRoomsText = isUnlimited ? 'Không giới hạn phòng' : `Tối đa ${maxRoomsRaw} phòng hoạt động`;
            const bullets = [
              'Không quảng cáo',
              'Quản lý phòng nâng cao',
              maxRoomsText,
            ];
            // Badge linh hoạt dựa theo giá (giá càng cao -> thông điệp định hướng mạnh hơn)
            const price = item.price || 0;
            const badgeLabel = getBadgeLabelByPrice(price);
            const handleUpgrade = () => {
              if (!token) { return; }
              // Nếu giá nâng cấp = 0 hoặc rẻ hơn không hợp lệ theo policy server, để server trả message
              // Nhưng chặn sớm case hạ cấp (plan giá thấp hơn): hiển thị message có sẵn
              const isDowngrade = (item.price || 0) < (currentItem?.price || 0);
              if (isDowngrade) {
                showError('Chỉ hỗ trợ nâng cấp lên gói có giá cao hơn gói hiện tại');
                return;
              }
              // Chỉ lấy báo giá + QR để hiển thị; xác nhận CK mới gửi yêu cầu
              dispatch(getUpgradeQuote({token, plan: item.key})).then((res: any) => {
                if (res?.meta?.requestStatus === 'fulfilled') {
                  navigation.navigate('SubscriptionPayment');
                }
              });
            };
            const handleManage = () => setManageOpen(true);
            return (
              <PlanHeroCard
                colors={getPlanColors(item.key) as [string, string]}
                title={item.name}
                isMuted={isLower}
                priceText={priceText}
                durationText={durationText}
                bullets={bullets}
                isCurrent={isCurrent}
                onPress={isCurrent ? handleManage : handleUpgrade}
                routeLabel={routeLabel}
                planKey={(item.key || '').toLowerCase()}
                isPopular={false}
                badgeLabel={badgeLabel}
              />
            );
          }}
        />
        <View style={styles.indicatorRow}>
          <IndicatorBar
            items={dataOrdered.map(p => ({_id: p._id, key: p.key}))}
            progress={progress}
          />
        </View>
        {/* Chỉ hiện overlay khi tải lần đầu (chưa có kế hoạch nào) */}
        {loading && (plans?.length ?? 0) === 0 && <LoadingOverlay visible />}

        {/* Panel trạng thái gói hiện tại / yêu cầu chờ duyệt */}
        <View style={styles.statusPanel}>
          {current ? (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Gói hiện tại</Text>
              <Text style={styles.statusValue}>{getPlanNameByKey(current.plan)}</Text>
            </View>
          ) : (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Gói hiện tại</Text>
              <Text style={styles.statusMuted}>Chưa có</Text>
            </View>
          )}
          {pending && (
            <View style={styles.pendingBox}>
              <Text style={styles.pendingTitle}>Yêu cầu nâng cấp đang chờ duyệt</Text>
              <Text style={styles.pendingLine}>Gói: <Text style={styles.pendingStrong}>{getPlanNameByKey(pending.plan)}</Text></Text>
              {!!pending.expectedAmount && (
                <Text style={styles.pendingLine}>Số tiền: {pending.expectedAmount.toLocaleString('vi-VN')} VND</Text>
              )}
              {!!pending.transferNote && (
                <Text style={styles.pendingLine}>Nội dung CK: {pending.transferNote}</Text>
              )}
              <Text style={styles.pendingHint}>Bạn đã chuyển khoản? Hệ thống sẽ tự động đối soát và Admin sẽ duyệt trong thời gian sớm nhất.</Text>
            </View>
          )}
        </View>

        {!!historyOrdered.length && (
          <View style={styles.historyPanel}>
            <Text style={styles.historyTitle}>Lịch sử đăng ký</Text>
            {historyOrdered.slice(0, 6).map((it: any, idx: number) => {
              const s = (it.status || '').toLowerCase();
              const leftColor = s === 'active' ? '#16a34a' : s === 'pending' ? '#f59e0b' : s === 'rejected' ? '#ef4444' : '#9CA3AF';
              return (
                <View key={it._id || String(idx)} style={styles.historyRow}>
                  <View style={styles.timelineCol}>
                    <View style={styles.timelineLine} />
                    <View style={[
                      styles.timelineDot,
                      s === 'active' ? styles.dotActive : s === 'pending' ? styles.dotPending : s === 'rejected' ? styles.dotRejected : styles.dotMuted,
                    ]} />
                  </View>
                  <View style={[
                    styles.historyCard,
                    styles.historyCardShadow,
                    [styles.cardLeftBorder, {borderLeftColor: leftColor}],
                  ]}>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.cardPlan}>{getPlanNameByKey(it.plan)}</Text>
                      {renderStatusChip(it.status)}
                    </View>
                    <View style={styles.cardRowBetween}>
                      <Text style={styles.cardField}>Yêu cầu lúc</Text>
                      <Text style={styles.cardValue}>{formatDateTime(it.createdAt)}</Text>
                    </View>
                    {!!it.expectedAmount && (
                      <View style={styles.cardRowBetween}>
                        <Text style={styles.cardField}>Số tiền</Text>
                        <Text style={styles.cardValue}>{Number(it.expectedAmount).toLocaleString('vi-VN')} VND</Text>
                      </View>
                    )}
                    {!!it.transferNote && (
                      <View style={styles.cardRowBetween}>
                        <Text style={styles.cardField}>Nội dung CK</Text>
                        <Text style={[styles.cardValue, styles.cardValueRight]} numberOfLines={1}>{it.transferNote}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
        <CustomAlertModal
          visible={!!visible}
          title={alertConfig?.title || 'Thông báo'}
          message={alertConfig?.message || ''}
          onClose={hideAlert}
          type={alertConfig?.type}
        />
        <ManagePlanModal
          visible={manageOpen}
          onClose={() => setManageOpen(false)}
          subscription={current}
          planName={currentItem?.name}
        />
        {/* QR chuyển khoản đã chuyển sang màn riêng: SubscriptionPayment */}
      </ScrollView>
    </View>
  );
};

export default SubscriptionScreen;

// IndicatorPill đã tách sang components/IndicatorBar.tsx

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  header: {
    width: SCREEN.width,
    paddingBottom: responsiveSpacing(6),
    paddingHorizontal: scale(16),
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerSubtitle: {
    marginTop: responsiveSpacing(6),
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(12),
    color: '#374151',
    alignSelf: 'center',
  },
  content: {
    paddingHorizontal: scale(16),
    paddingTop: responsiveSpacing(12),
  },
  historyPanel: {
    marginTop: verticalScale(8),
    paddingHorizontal: 0,
  },
  historyTitle: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(14),
    color: Colors.dearkOlive,
    marginBottom: verticalScale(6),
    paddingHorizontal: scale(4),
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(10),
  },
  timelineCol: {width: scale(16), alignItems: 'center'},
  timelineLine: {position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: '#E5E7EB'},
  timelineDot: {width: scale(8), height: scale(8), borderRadius: 999, marginTop: verticalScale(10)},
  dotActive: {backgroundColor: '#16a34a'},
  dotPending: {backgroundColor: '#f59e0b'},
  dotRejected: {backgroundColor: '#ef4444'},
  dotMuted: {backgroundColor: '#9CA3AF'},
  historyCard: {flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: scale(12), paddingVertical: verticalScale(10), borderWidth: 1, borderColor: '#E5E7EB'},
  historyCardShadow: {shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: {width: 0, height: 2}, elevation: 1},
  cardLeftBorder: {borderLeftWidth: 3},
  cardHeaderRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  cardPlan: {fontFamily: Fonts.Roboto_Bold, fontSize: responsiveFont(13), color: Colors.black},
  cardLine: {marginTop: verticalScale(2), fontFamily: Fonts.Roboto_Regular, fontSize: responsiveFont(12), color: '#374151'},
  cardRowBetween: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: verticalScale(4)},
  cardField: {fontFamily: Fonts.Roboto_Regular, fontSize: responsiveFont(12), color: '#6b7280'},
  cardValue: {fontFamily: Fonts.Roboto_Bold, fontSize: responsiveFont(12), color: Colors.dearkOlive},
  cardValueRight: {flexShrink: 1, textAlign: 'right'},
  statusChip: {borderRadius: 999, paddingHorizontal: scale(8), paddingVertical: verticalScale(3)},
  statusChipText: {fontFamily: Fonts.Roboto_Bold, fontSize: responsiveFont(11)},
  statusPanel: {
    marginTop: verticalScale(12),
    marginBottom: verticalScale(8),
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(6),
  },
  statusLabel: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(12),
    color: '#6b7280',
  },
  statusValue: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(12),
    color: Colors.dearkOlive,
    textTransform: 'capitalize',
  },
  statusMuted: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(12),
    color: '#9CA3AF',
  },
  pendingBox: {
    marginTop: verticalScale(6),
    backgroundColor: Colors.limeGreenOpacityLight,
    borderRadius: 12,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
  },
  pendingTitle: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(13),
    color: Colors.dearkOlive,
    marginBottom: verticalScale(4),
  },
  pendingLine: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(12),
    color: '#374151',
  },
  pendingStrong: {
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    textTransform: 'capitalize',
  },
  pendingHint: {
    marginTop: verticalScale(6),
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(11),
    color: '#374151',
  },
  // removed side shapes
  planCard: {
    borderRadius: 16,
    paddingVertical: verticalScale(18),
    paddingHorizontal: scale(16),
    marginBottom: verticalScale(12),
  },
  cardCurrent: {
    opacity: 0.9,
  },
  planTitle: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(18),
    color: Colors.black,
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planDesc: {
    marginTop: verticalScale(6),
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(13),
    color: '#2b2b2b',
  },
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: '#000',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(8),
    borderRadius: 999,
    marginTop: verticalScale(12),
  },
  ctaText: {
    color: '#fff',
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(14),
  },
  ctaDisabled: {
    backgroundColor: '#1f2937',
    opacity: 0.85,
  },
  planBadge: {
    backgroundColor: '#0f172a',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  badgeMuted: {
    backgroundColor: '#6b7280',
  },
  // Removed explicit 'ĐỀ XUẤT' badge per new design
  planBadgeText: {
    color: '#fff',
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(12),
  },
  // Hero card styles (carousel)
  heroCard: {
    borderRadius: 24,
    paddingVertical: verticalScale(26),
    paddingHorizontal: scale(16),
    marginHorizontal: scale(8),
    minHeight: verticalScale(360),
  },
  heroCardMuted: {
    opacity: 0.95,
  },
  heroTilt: {
    transform: [{skewY: '-2deg'}],
  },
  heroHeading: {
    textAlign: 'center',
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(19),
    color: Colors.black,
    marginBottom: verticalScale(6),
  },
  routeLabel: {
    textAlign: 'center',
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(16),
    color: Colors.black,
    marginBottom: verticalScale(6),
  },
  heroPlanName: {
    textAlign: 'center',
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(22),
    color: Colors.black,
  },
  heroPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(10),
  },
  crown: {fontSize: responsiveFont(22), marginRight: scale(6)},
  priceText: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(22),
    color: Colors.black,
  },
  perText: {
    marginLeft: scale(6),
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(14),
    color: '#2b2b2b',
  },
  bullets: {
    marginTop: verticalScale(14),
    gap: verticalScale(6),
  },
  bullet: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(14),
    color: '#111827',
  },
  ctaWhite: {
    marginTop: verticalScale(18),
    backgroundColor: '#fff',
    alignSelf: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    borderRadius: 14,
  },
  ctaWhiteDisabled: {
    opacity: 0.7,
  },
  ctaWhiteText: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(15),
    color: Colors.black,
  },
  indexRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: verticalScale(14),
    gap: scale(8),
  },
  indexChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
  },
  indexChipActive: {
    backgroundColor: '#111827',
  },
  indexNum: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(12),
    color: '#111827',
    marginRight: scale(6),
  },
  indexNumActive: {
    color: '#fff',
  },
  indexName: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(11),
    color: '#4b5563',
  },
  indexNameActive: {
    color: '#fff',
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: scale(10),
    marginTop: verticalScale(-90),
  },
  indicatorPill: {
    height: scale(12),
    borderRadius: 999,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(10),
  },
  indicatorText: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(10),
    color: '#fff',
  },
  compareWrap: {
    marginTop: verticalScale(8),
    alignItems: 'center',
  },
  compareBtn: {
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(8),
    borderRadius: 999,
    backgroundColor: '#111827',
  },
  compareText: {
    color: '#fff',
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(12),
  },
  benefitWrap: {
    marginTop: verticalScale(24),
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(18),
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(16),
    color: Colors.dearkOlive,
    marginBottom: verticalScale(12),
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
  },
  chip: {
    backgroundColor: Colors.limeGreenOpacityLight,
    borderRadius: 999,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
  },
  chipText: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(12),
    color: Colors.dearkOlive,
  },
  bankPanel: {
    marginTop: verticalScale(16),
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(12),
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  bankTitle: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(14),
    color: Colors.dearkOlive,
    marginBottom: verticalScale(8),
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(4),
  },
  bankLabel: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(12),
    color: '#6b7280',
  },
  bankValue: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(12),
    color: Colors.dearkOlive,
  },
  bankNote: {
    marginTop: verticalScale(8),
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(11),
    color: '#374151',
  },
});
