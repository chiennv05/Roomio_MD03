import React from 'react';
import {StyleSheet, Text, View, Dimensions} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, responsiveSpacing} from '../../../../utils/responsive';
import {LineChart} from 'react-native-chart-kit';

interface StatChartProps {
  title: string;
  data: number[];
  labels: string[];
  color: string;
}

const StatChart = ({title, data, labels, color}: StatChartProps) => {
  const screenWidth = Dimensions.get('window').width - responsiveSpacing(40);

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: () => color,
    labelColor: () => Colors.textGray,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: color,
    },
    propsForLabels: {
      fontSize: 10,
    },
  };

  return (
    <View style={styles.chartContainer}>
      <View style={[styles.borderLeft, {backgroundColor: color}]} />
      <View style={styles.contentContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <LineChart
          data={{
            labels: labels || [],
            datasets: [
              {
                data: data && data.length > 0 ? data : [0],
              },
            ],
          }}
          width={screenWidth}
          height={180}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={false}
          withOuterLines
          fromZero
          yAxisInterval={1}
        />
      </View>
    </View>
  );
};

export default StatChart;

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginHorizontal: responsiveSpacing(16),
    marginBottom: responsiveSpacing(16),
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  borderLeft: {
    width: 5,
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
    marginBottom: responsiveSpacing(10),
  },
  chart: {
    marginVertical: responsiveSpacing(8),
    borderRadius: 8,
  },
});
