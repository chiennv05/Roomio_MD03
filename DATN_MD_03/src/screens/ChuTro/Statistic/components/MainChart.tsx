import React from 'react';
import {StyleSheet, Text, View, Dimensions} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {
  responsiveFont,
  responsiveSpacing,
  scale,
} from '../../../../utils/responsive';
import {BarChart} from 'react-native-chart-kit';

interface MainChartProps {
  title: string;
  subtitle: string;
  mainValue: string;
  data: number[];
  labels: string[];
  color?: string;
  valueType?: 'revenue' | 'rooms' | 'contracts';
}

const MainChart: React.FC<MainChartProps> = ({
  title,
  subtitle,
  mainValue,
  data,
  labels,
  color = Colors.info,
  valueType = 'revenue',
}) => {
  const screenWidth = Dimensions.get('window').width - responsiveSpacing(32);

  const chartConfig = {
    backgroundGradientFrom: Colors.darkGray,
    backgroundGradientTo: Colors.darkGray,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(134, 182, 0, ${opacity})`, // Sử dụng primaryGreen đậm hơn
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 10,
    },
    barPercentage: 0.7,
  };

  // Tạo data cho chart với giá trị mặc định nếu không có data
  const chartData = {
    labels:
      labels.length > 0 ? labels : ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    datasets: [
      {
        data: data.length > 0 ? data : [0, 0, 0, 0, 0, 0, 0],
      },
    ],
  };

  // Format giá trị hiển thị dựa trên loại
  const formatValue = (value: string) => {
    if (valueType === 'revenue') {
      // Nếu value đã có "đ" thì giữ nguyên, nếu không thì thêm "đ"
      return value.includes('đ') ? value : `${value}đ`;
    } else if (valueType === 'rooms') {
      return `${value}ph`;
    } else if (valueType === 'contracts') {
      return `${value}hđ`;
    }
    return value;
  };

  // Lấy label phù hợp
  const getDeviceLabel = () => {
    switch (valueType) {
      case 'revenue':
        return 'DOANH THU';
      case 'rooms':
        return 'PHÒNG TRỌ';
      case 'contracts':
        return 'HỢP ĐỒNG';
      default:
        return 'THỐNG KÊ';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.deviceLabel}>{getDeviceLabel()}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.mainValue}>{formatValue(mainValue)}</Text>

        <View style={styles.chartContainer}>
          <BarChart
            data={chartData}
            width={screenWidth - 40}
            height={180}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars={false}
            withInnerLines={false}
            fromZero
            yAxisInterval={1}
            yAxisLabel=""
            yAxisSuffix=""
          />
        </View>

        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

export default MainChart;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.darkGray,
    marginHorizontal: responsiveSpacing(16),
    marginBottom: responsiveSpacing(20),
    borderRadius: scale(16),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  header: {
    paddingHorizontal: responsiveSpacing(16),
    paddingTop: responsiveSpacing(12),
  },
  deviceLabel: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.mediumGray,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  content: {
    padding: responsiveSpacing(16),
    paddingTop: responsiveSpacing(8),
  },
  title: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.white,
    marginBottom: responsiveSpacing(4),
  },
  mainValue: {
    fontSize: responsiveFont(32),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
    marginBottom: responsiveSpacing(16),
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: responsiveSpacing(12),
  },
  chart: {
    borderRadius: 8,
  },
  subtitle: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.mediumGray,
    textAlign: 'center',
  },
});
