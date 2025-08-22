import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  Animated,
  Easing,
} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {
  responsiveFont,
  responsiveSpacing,
  scale,
} from '../../../../utils/responsive';
import {LineChart} from 'react-native-chart-kit';
import Color from 'color';
import {Icons} from '../../../../assets/icons';

interface MainChartProps {
  title: string;
  data: number[];
  labels: string[];
  color: string;
}

const MainChart = ({title, data, labels, color}: MainChartProps) => {
  const screenWidth = Dimensions.get('window').width - responsiveSpacing(40);

  const MAX_POINTS = 5;
  // Xử lý labels để format thành "MM/YYYY"
  const processedLabels = (labels || []).map(label => {
    if (typeof label === 'string' && label.includes('thg')) {
      // Chuyển từ "thg 4 2025" thành "04/2025"
      const parts = label.replace('thg ', '').split(' ');
      if (parts.length === 2) {
        const month = parts[0].padStart(2, '0');
        const year = parts[1];
        return `${month}/${year}`;
      }
    }
    return label;
  });
  const displayLabels = processedLabels.slice(-MAX_POINTS);
  const displayData = (data && data.length > 0 ? data : [0]).slice(-MAX_POINTS);

  const latest = displayData[displayData.length - 1] ?? 0;

  const base = Color(color);
  const lineColor = base.darken(0.05).rgb().string();
  const gridColor = base.mix(Color('#ffffff'), 0.8).fade(0.5).rgb().string();

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    backgroundGradientFromOpacity: 1,
    backgroundGradientToOpacity: 1,
    decimalPlaces: 0,
    color: (opacity = 1) => base.alpha(opacity).rgb().string(),
    labelColor: () => Colors.textSecondary,
    fillShadowGradient: lineColor,
    fillShadowGradientOpacity: 0.22,
    strokeWidth: 3,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2.5',
      stroke: lineColor,
      fill: '#fff',
    },
    propsForLabels: {
      fontSize: 11,
    },
    propsForBackgroundLines: {
      strokeDasharray: '4 6',
      stroke: gridColor,
      strokeWidth: 1,
    },
  } as const;

  // Animation fade + slide
  const anim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim]);
  const animatedStyle = {
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [12, 0],
        }),
      },
    ],
  } as const;

  // Format Y label
  const isPercent = title.includes('%') || title.toLowerCase().includes('tỷ lệ');
  const isCurrency = title.toLowerCase().includes('vnđ');
  const formatYLabel = (v: string) => {
    const num = parseFloat(v);
    if (isNaN(num)) return v;
    if (isPercent) return `${Math.round(num)}%`;
    if (isCurrency) return `${Math.round(num).toLocaleString('vi-VN')}`;
    return `${Math.round(num)}`;
  };

  return (
    <Animated.View style={[styles.chartContainer, animatedStyle]}>
      <View style={[styles.borderLeft, {backgroundColor: base.hex()}]} />
      <View style={styles.contentContainer}>
        <Image
          source={{uri: Icons.IconReport as string}}
          style={[
            styles.watermarkIcon,
            {tintColor: base.fade(0.85).rgb().string()},
          ]}
          resizeMode="contain"
        />
        {/* Ẩn title trong content theo yêu cầu, giữ latest value nếu cần */}
        <Text style={styles.latestValue}>
          Tháng gần nhất: {Number(latest || 0).toLocaleString('vi-VN')}
        </Text>
        <LineChart
          data={{
            labels: displayLabels,
            datasets: [
              {
                data: displayData,
                color: () => lineColor,
              },
            ],
          }}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines
          withOuterLines
          withDots={false}
          fromZero
          yAxisInterval={1}
          yLabelsOffset={8}
          xLabelsOffset={12}
          formatYLabel={formatYLabel}
          segments={4}
          decorator={() => (
            <View
              style={{
                position: 'absolute',
                bottom: 36,
                right: 18,
                paddingHorizontal: 8,
                paddingVertical: 4,
                backgroundColor: '#fff',
                borderRadius: 8,
                shadowColor: Colors.shadowDefault,
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 2,
              }}>
              <Text
                style={{
                  fontFamily: Fonts.Roboto_Bold,
                  color: Colors.darkGray,
                  fontSize: 12,
                }}>
                {formatYLabel(String(latest))}
              </Text>
            </View>
          )}
        />
      </View>
    </Animated.View>
  );
};

export default MainChart;

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginHorizontal: responsiveSpacing(16),
    marginBottom: responsiveSpacing(16),
    flexDirection: 'row',
    shadowColor: Colors.shadowDefault,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  borderLeft: {
    width: 6,
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    padding: responsiveSpacing(12),
  },
  chartTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
  },
  latestValue: {
    marginTop: responsiveSpacing(4),
    fontSize: responsiveFont(12),
    color: Colors.textSecondary,
    marginBottom: responsiveSpacing(6),
  },
  chart: {
    marginVertical: responsiveSpacing(8),
    borderRadius: 8,
  },
  watermarkIcon: {
    position: 'absolute',
    right: responsiveSpacing(10),
    top: responsiveSpacing(10),
    width: scale(22),
    height: scale(22),
    opacity: 1,
  },
});
