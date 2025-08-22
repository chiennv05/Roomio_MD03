import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import {BarChart} from 'react-native-chart-kit';
import Color from 'color';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {
  responsiveFont,
  responsiveSpacing,
  scale,
} from '../../../../utils/responsive';
import {Icons} from '../../../../assets/icons';

interface Props {
  title: string;
  data: number[];
  labels: string[];
  color: string;
}

// A bar chart matching the provided visual reference, while keeping
// the same props/behavior as MainChart for drop‑in use on StatisticScreen.
export default function MainBarChart({title, data, labels, color}: Props) {
  const screenWidth = Dimensions.get('window').width - responsiveSpacing(40);

  // Windowed view over full dataset (5 points), with arrows to navigate
  const WINDOW_SIZE = 5;

  // Normalize labels (e.g., "thg 4 2025" => "04/2025") to match existing charts
  const processedLabels = (labels || []).map(label => {
    if (typeof label === 'string' && label.includes('thg')) {
      const parts = label.replace('thg ', '').split(' ');
      if (parts.length === 2) {
        const month = parts[0].padStart(2, '0');
        const year = parts[1];
        return `${month}/${year}`;
      }
    }
    return label;
  });
  // Find current month index to focus initially
  const currentMMYY = (() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear());
    return `${mm}/${yy}`;
  })();
  const foundIdx = processedLabels.lastIndexOf(currentMMYY);
  const lastIdx = Math.max(0, processedLabels.length - 1);
  const initialEndIndex = foundIdx >= 0 ? foundIdx : lastIdx;
  const [endIndex, setEndIndex] = React.useState(initialEndIndex);
  // Keep endIndex synced when labels change
  React.useEffect(() => {
    const idx = processedLabels.lastIndexOf(currentMMYY);
    const target = idx >= 0 ? idx : Math.max(0, processedLabels.length - 1);
    if (target !== endIndex) setEndIndex(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processedLabels.length]);

  const startIndex = Math.max(0, Math.min(endIndex - WINDOW_SIZE + 1, Math.max(0, processedLabels.length - WINDOW_SIZE)));

  const safeData = data && data.length > 0 ? data : [0];
  const displayLabels = processedLabels.slice(startIndex, Math.min(endIndex + 1, processedLabels.length));
  const displayData = safeData.slice(startIndex, Math.min(endIndex + 1, safeData.length));

  // Hiển thị "dấu chấm" cho giá trị 0 bằng cách dùng giá trị siêu nhỏ chỉ để vẽ chiều cao,
  // nhưng vẫn giữ số hiển thị là 0 (decimalPlaces=0 sẽ làm tròn về 0)
  const maxVal = Math.max(...displayData, 0);
  const hasAnyPositive = displayData.some(v => v > 0);
  const tiny = hasAnyPositive ? Math.max(maxVal * 0.015, 0.001) : 0; // chỉ dùng tiny khi có ít nhất 1 giá trị > 0
  const adjustedData = hasAnyPositive
    ? displayData.map(v => (v === 0 ? Math.min(tiny, Math.max(0.01, maxVal * 0.02)) : v))
    : displayData; // tất cả = 0 thì không vẽ chấm để tránh trục Y bị sai

  const barColors = displayData.map((v, i) => {
    const ratio = maxVal > 0 ? v / maxVal : 0; // 0..1
    const opacity = 0.3 + 0.7 * Math.max(0, Math.min(1, ratio)); // 0.3..1
    // Nhấn mạnh cột tháng hiện tại (cuối cửa sổ)
    if (i === displayData.length - 1) {
      return Color(Colors.black).alpha(0.95).rgb().string();
    }
    return Color(Colors.dearkOlive).alpha(opacity).rgb().string();
  });

  const latest = displayData[displayData.length - 1] ?? 0;

  const canPrev = startIndex > 0;
  const canNext = endIndex < processedLabels.length - 1;
  const goPrev = () => canPrev && setEndIndex(prev => Math.max(WINDOW_SIZE - 1, prev - 1));
  const goNext = () => canNext && setEndIndex(prev => Math.min(processedLabels.length - 1, prev + 1));

  const base = Color(color);
  const barColor = Colors.dearkOlive; // Dark bar color as in reference

  // Chart-kit config to mimic the visual style in the reference image
  const chartConfig = {
    backgroundGradientFrom: Colors.limeGreen,
    backgroundGradientTo: Colors.limeGreen,
    backgroundGradientFromOpacity: 1,
    backgroundGradientToOpacity: 1,
    decimalPlaces: 0,
    color: () => barColor, // bars color
    labelColor: () => 'rgba(0,0,0,0.65)',
    barPercentage: 0.58,
    fillShadowGradient: barColor,
    fillShadowGradientOpacity: 1,
    propsForBackgroundLines: {
      stroke: 'rgba(0,0,0,0.06)',
      strokeDasharray: '4 6',
    },
    propsForLabels: {
      fontSize: 11,
    },
    style: {
      borderRadius: 16,
    },
  } as const;

  // Animation (fade/slide) consistent with MainChart
  const anim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [endIndex, displayData.length]);
  const animatedStyle = {
    opacity: anim,
    transform: [
      { translateY: anim.interpolate({inputRange: [0, 1], outputRange: [12, 0]}) },
      { scaleY: anim.interpolate({inputRange: [0, 1], outputRange: [0.96, 1]}) },
    ],
  } as const;

  // Format Y label theo ngữ cảnh (currency/count/percent)
  const isPercent = title.includes('%') || title.toLowerCase().includes('tỷ lệ');
  const isCurrency =
    title.toLowerCase().includes('vnđ') ||
    title.toLowerCase().includes('doanh thu');
  const formatYLabel = (v: string) => {
    const num = parseFloat(v);
    if (isNaN(num)) return v;
    if (isPercent) return `${Math.round(num)}%`;
    if (isCurrency) return `${Math.round(num).toLocaleString('vi-VN')}`;
    return `${Math.round(num)}`;
  };

  return (
    <Animated.View style={[styles.chartContainer, animatedStyle]}>
      <View style={[styles.contentContainer]}>        
        <Image
          source={{uri: Icons.IconReport as string}}
          style={[styles.watermarkIcon, {tintColor: base.fade(0.85).rgb().string()}]}
          resizeMode="contain"
        />
        <Text style={styles.chartTitle}>{title}</Text>
        <Text style={styles.latestValue}>
          Tháng gần nhất: {formatYLabel(String(latest || 0))}
        </Text>

        {/* Navigation header */}
        <View style={styles.navHeader}>
          <TouchableOpacity activeOpacity={0.8} onPress={goPrev} disabled={!canPrev} hitSlop={{top:8,bottom:8,left:8,right:8}}>
            <View style={[styles.navCircle, !canPrev && {opacity: 0.35}]}>
              <Image source={{uri: Icons.IconArrowLeft as string}} style={styles.navIconWhite} />
            </View>
          </TouchableOpacity>
          <Text style={styles.navHeaderText}>
            {displayLabels[0]} — {displayLabels[displayLabels.length - 1]}
          </Text>
          <TouchableOpacity activeOpacity={0.8} onPress={goNext} disabled={!canNext} hitSlop={{top:8,bottom:8,left:8,right:8}}>
            <View style={[styles.navCircle, !canNext && {opacity: 0.35}]}>
              <Image source={{uri: Icons.IconArrowRight as string}} style={styles.navIconWhite} />
            </View>
          </TouchableOpacity>
        </View>

        <BarChart
          data={{
            labels: displayLabels,
            datasets: [
              {
                // Giữ data thật để tính màu, nhưng dùng adjustedData để vẽ "dấu chấm" cho 0
                data: adjustedData,
                colors: barColors.map(c => ((_opacity: number = 1) => c)),
              },
            ],
          }}
          width={screenWidth}
          height={240}
          fromZero
          yAxisInterval={1}
          yLabelsOffset={8}
          xLabelsOffset={12}
          chartConfig={chartConfig}
          style={styles.chart}
          withInnerLines={true}
          showBarTops={false}
          withCustomBarColorFromData={true}
          flatColor={true}
          segments={4}
          yAxisLabel=""
          yAxisSuffix=""
          showValuesOnTopOfBars={false}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginHorizontal: responsiveSpacing(16),
    marginBottom: responsiveSpacing(16),
    flexDirection: 'row',
    shadowColor: Colors.shadowDefault,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  contentContainer: {
    flex: 1,
    padding: responsiveSpacing(12),
    backgroundColor: Colors.limeGreen, // lime background like reference
    borderRadius: 14,
  },
  chartTitle: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  latestValue: {
    marginTop: responsiveSpacing(4),
    fontSize: responsiveFont(12),
    color: Colors.dearkOlive,
    marginBottom: responsiveSpacing(6),
  },
  chart: {
    marginVertical: responsiveSpacing(8),
    borderRadius: 12,
  },
  watermarkIcon: {
    position: 'absolute',
    right: responsiveSpacing(10),
    top: responsiveSpacing(10),
    width: scale(22),
    height: scale(22),
    opacity: 1,
  },
  navHeader: {
    marginTop: responsiveSpacing(8),
    marginBottom: responsiveSpacing(6),
    paddingHorizontal: responsiveSpacing(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navHeaderText: {
    fontFamily: Fonts.Roboto_Medium,
    fontSize: responsiveFont(12),
    color: Colors.darkGray,
  },
  navHeaderChevron: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(16),
    color: Colors.white,
    textAlign: 'center',
    width: 22,
  },
  navCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(23,25,15,0.6)', // Colors.dearkOlive with alpha for strong contrast on lime
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowDefault,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
  },
  navIconWhite: {width: 16, height: 16, tintColor: Colors.white},
});

