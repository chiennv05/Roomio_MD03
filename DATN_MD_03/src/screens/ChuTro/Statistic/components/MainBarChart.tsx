import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import {BarChart} from 'react-native-chart-kit';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {
  responsiveFont,
  responsiveSpacing,
} from '../../../../utils/responsive';
import {useSelector} from 'react-redux';
import {RootState} from '../../../../store';

interface Props {
  title: string;
  data?: number[];
  labels?: string[];
  color?: string;
  onNavigate?: (direction: 'prev' | 'next') => void;
  currentPeriod?: string;
  onMonthSelect?: (month: number) => void;
  chartType?: 'revenue' | 'rooms' | 'contracts' | 'invoices'; // Thêm loại biểu đồ
  onTabChange?: (tabType: 'revenue' | 'rooms' | 'contracts') => void; // Thêm callback khi đổi tab
}

export default function MainBarChart({title, onNavigate, onMonthSelect, chartType = 'revenue', onTabChange}: Props) {
  const screenWidth = Dimensions.get('window').width - responsiveSpacing(60); // Giảm width để căn giữa
  const {data: dashboardData} = useSelector((state: RootState) => state.dashboard);
  
  // State for tracking pressed month for visual feedback
  const [pressedMonthIndex, setPressedMonthIndex] = React.useState<number | null>(null);
  const [selectedMonthIndex, setSelectedMonthIndex] = React.useState<number | null>(null);

  // State for current period navigation
  const [currentPeriod, setCurrentPeriod] = React.useState(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();
    return { month: currentMonth, year: currentYear };
  });

  // Effect to set the current month as selected by default
  React.useEffect(() => {
    if (dashboardData?.monthlyStats?.labels) {
      const labels = dashboardData.monthlyStats.labels;
      const currentMonthLabel = `thg ${currentPeriod.month} ${currentPeriod.year}`;
      const currentMonthIndex = labels.findIndex(label => label === currentMonthLabel);
      
      if (currentMonthIndex !== -1) {
        const startIndex = Math.max(0, currentMonthIndex - 5);
        const displayIndex = currentMonthIndex - startIndex;
        if (displayIndex >= 0 && displayIndex < 6) {
          setSelectedMonthIndex(displayIndex);
        }
      }
    }
  }, [dashboardData, currentPeriod]);

  // Generate month labels for current period
  const generateMonthLabels = () => {
    if (!dashboardData?.monthlyStats?.labels) {
      return ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'];
    }

    const labels = dashboardData.monthlyStats.labels;
    const currentMonthLabel = `thg ${currentPeriod.month} ${currentPeriod.year}`;
    const currentMonthIndex = labels.findIndex(label => label === currentMonthLabel);
    
    if (currentMonthIndex === -1) {
      // Nếu không tìm thấy tháng hiện tại, trả về 6 tháng cuối cùng
      return labels.slice(-6).map(label => {
        // Convert "thg 8 2025" to "Tháng 8"
        const match = label.match(/thg (\d+) \d+/);
        return match ? `Tháng ${match[1]}` : label;
      });
    }
    
    // Lấy 6 tháng liên tiếp từ tháng hiện tại trở về trước
    const startIndex = Math.max(0, currentMonthIndex - 5);
    const endIndex = currentMonthIndex + 1;
    const displayLabels = labels.slice(startIndex, endIndex);
    
    // Nếu không đủ 6 tháng, thêm tháng trước vào đầu
    while (displayLabels.length < 6) {
      const firstMonth = parseInt(displayLabels[0]?.match(/thg (\d+)/)?.[1] || '1');
      const prevMonth = firstMonth - 1;
      const prevYear = prevMonth <= 0 ? currentPeriod.year - 1 : currentPeriod.year;
      const actualPrevMonth = prevMonth <= 0 ? 12 : prevMonth;
      displayLabels.unshift(`thg ${actualPrevMonth} ${prevYear}`);
    }
    
    return displayLabels.slice(-6).map(label => {
      // Convert "thg 8 2025" to "Tháng 8"
      const match = label.match(/thg (\d+) \d+/);
      return match ? `Tháng ${match[1]}` : label;
    });
  };



  // Get current display data based on chart type
  const getCurrentDisplayData = () => {
    if (!dashboardData?.monthlyStats) {
      return [0, 0, 0, 0, 0, 0]; // Trả về toàn bộ 0 nếu không có dữ liệu
    }

    let sourceData: number[] = [];
    
    // Chọn dữ liệu theo loại biểu đồ
    switch (chartType) {
      case 'revenue':
        sourceData = dashboardData.monthlyStats.revenue || [];
        break;
      case 'rooms':
        sourceData = dashboardData.monthlyStats.rooms || [];
        break;
      case 'contracts':
        sourceData = dashboardData.monthlyStats.contracts || [];
        break;
      case 'invoices':
        sourceData = dashboardData.monthlyStats.invoices || [];
        break;
      default:
        sourceData = dashboardData.monthlyStats.revenue || [];
    }
    
    const labels = dashboardData.monthlyStats.labels || [];
    
    // Tìm tháng hiện tại trong labels
    const currentMonthLabel = `thg ${currentPeriod.month} ${currentPeriod.year}`;
    const currentMonthIndex = labels.findIndex(label => label === currentMonthLabel);
    
    if (currentMonthIndex === -1) {
      // Nếu không tìm thấy tháng hiện tại, trả về 6 tháng cuối cùng
      return sourceData.slice(-6);
    }
    
    // Lấy 6 tháng liên tiếp từ tháng hiện tại trở về trước
    const startIndex = Math.max(0, currentMonthIndex - 5);
    const endIndex = currentMonthIndex + 1;
    const displayData = sourceData.slice(startIndex, endIndex);
    
    // Nếu không đủ 6 tháng, thêm 0 vào đầu
    while (displayData.length < 6) {
      displayData.unshift(0);
    }
    
    const finalData = displayData.slice(-6); // Đảm bảo chỉ trả về 6 tháng
    
    // Trả về dữ liệu thực từ API
    return finalData;
  };

  const displayLabels = generateMonthLabels();
  const displayData = getCurrentDisplayData();

  // Chart configuration to match Figma exactly
  const chartConfig = {
    backgroundGradientFrom: Colors.limeGreen,
    backgroundGradientTo: Colors.limeGreen,
    backgroundGradientFromOpacity: 1,
    backgroundGradientToOpacity: 1,
    decimalPlaces: 0,
    color: () => Colors.black,
    labelColor: () => Colors.black,
    barPercentage: 0.7, // Tăng độ rộng bar để giống như trong hình
    fillShadowGradient: Colors.black,
    fillShadowGradientOpacity: 1,
    propsForBackgroundLines: {
      stroke: 'rgba(0,0,0,0.1)',
      strokeDasharray: '5,5',
    },
    propsForLabels: {
      fontSize: 11,
      fontFamily: Fonts.Roboto_Regular,
    },
    style: {
      borderRadius: 16,
    },
  } as const;

  // Animation
  const anim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [currentPeriod, anim]);

  const animatedStyle = {
    opacity: anim,
    transform: [
      { translateY: anim.interpolate({inputRange: [0, 1], outputRange: [12, 0]}) },
      { scaleY: anim.interpolate({inputRange: [0, 1], outputRange: [0.96, 1]}) },
    ],
  } as const;

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newPeriod = { ...currentPeriod };
    
    if (direction === 'prev') {
      // Lùi 6 tháng
      newPeriod.month -= 6;
      if (newPeriod.month <= 0) {
        newPeriod.month += 12;
        newPeriod.year -= 1;
      }
    } else {
      // Tiến 6 tháng
      newPeriod.month += 6;
      if (newPeriod.month > 12) {
        newPeriod.month -= 12;
        newPeriod.year += 1;
      }
    }
    
    setCurrentPeriod(newPeriod);
    
    if (onNavigate) {
      onNavigate(direction);
    }
  };

  // Format update time
  const formatUpdateTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    
    return `Cập nhật: ${hours}:${minutes}:${seconds}, ${day}/${month}/${year}`;
  };

  // Handle bar click to select specific month
  const handleBarPress = (index: number) => {
    if (onMonthSelect && dashboardData?.monthlyStats?.labels) {
      const labels = dashboardData.monthlyStats.labels;
      const currentMonthLabel = `thg ${currentPeriod.month} ${currentPeriod.year}`;
      const currentMonthIndex = labels.findIndex(label => label === currentMonthLabel);
      
      if (currentMonthIndex !== -1) {
        // Calculate the actual month index based on display index
        const startIndex = Math.max(0, currentMonthIndex - 5);
        const actualMonthIndex = startIndex + index;
        
        if (actualMonthIndex < labels.length) {
          const selectedLabel = labels[actualMonthIndex];
          const monthMatch = selectedLabel.match(/thg (\d+) \d+/);
          if (monthMatch) {
            const monthNumber = parseInt(monthMatch[1]);
            onMonthSelect(monthNumber);
            // Set selected month for visual feedback
            setSelectedMonthIndex(index);
          }
        }
      }
    }
  };



  return (
    <View style={styles.container}>
      {/* Tab Navigation - Tương tác được dựa trên chartType */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, chartType === 'revenue' && styles.activeTab]}
          onPress={() => onTabChange && onTabChange('revenue')}
        >
          <Text style={[styles.tabText, chartType === 'revenue' && styles.activeTabText]}>
            Doanh thu
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, chartType === 'rooms' && styles.activeTab]}
          onPress={() => onTabChange && onTabChange('rooms')}
        >
          <Text style={[styles.tabText, chartType === 'rooms' && styles.activeTabText]}>
            Phòng trọ
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, chartType === 'contracts' && styles.activeTab]}
          onPress={() => onTabChange && onTabChange('contracts')}
        >
          <Text style={[styles.tabText, chartType === 'contracts' && styles.activeTabText]}>
            Hợp đồng
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chart Container */}
      <Animated.View style={[styles.chartContainer, animatedStyle]}>
        <View style={styles.contentContainer}>        
          <Text style={styles.chartTitle}>{title}</Text>

                      <View style={styles.chartWrapper}>
            <BarChart
              data={{
                labels: displayLabels,
                datasets: [
                  {
                    data: displayData,
                    colors: displayData.map((value, index) => {
                      // Nếu giá trị = 0 thì không hiển thị (transparent)
                      if (value === 0) {
                        return () => 'transparent';
                      }
                      
                      // Nếu đang bấm vào bar này, hiện thị màu nhấn mạnh hơn
                      if (pressedMonthIndex === index) {
                        return () => '#0F120B'; // Màu đen đậm hơn khi bấm
                      }
                      
                      // Nếu đây là tháng được chọn, hiện thị màu đen
                      if (selectedMonthIndex === index) {
                        return () => '#17190F'; // Màu đen cho tháng được chọn
                      }
                      
                      // Lấy tháng tương ứng với index
                      const labels = dashboardData?.monthlyStats?.labels || [];
                      const currentMonthLabel = `thg ${currentPeriod.month} ${currentPeriod.year}`;
                      const currentMonthIndex = labels.findIndex(label => label === currentMonthLabel);
                      
                      if (currentMonthIndex !== -1) {
                        // Tính index của tháng trong displayData
                        const startIndex = Math.max(0, currentMonthIndex - 5);
                        const monthIndex = startIndex + index;
                        
                        // Nếu là tháng hiện tại thì màu đen
                        if (monthIndex === currentMonthIndex) {
                          return () => '#17190F'; // Màu đen cho tháng hiện tại
                        }
                      }
                      
                      // Các tháng khác dùng màu nhạt hơn theo Figma (#17190F với 40% opacity)
                      return () => 'rgba(23, 25, 15, 0.4)'; // Màu xanh nhạt cho các tháng khác
                    }),
                  },
                ],
              }}
              width={screenWidth}
              height={200}
              fromZero
              yAxisInterval={1}
              yLabelsOffset={8}
              xLabelsOffset={8}
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
              withVerticalLabels={true}
              withHorizontalLabels={true}
            />
            
            {/* Overlay tạo các vùng click cho từng tháng */}
            <View style={styles.chartOverlay}>
              {displayLabels.map((label, index) => (
                <TouchableOpacity
                  key={`month-${index}`}
                  style={[
                    styles.monthTouchArea,
                    pressedMonthIndex === index && styles.monthTouchAreaPressed
                  ]}
                  onPress={() => {
                    handleBarPress(index);
                    setSelectedMonthIndex(index);
                  }}
                  onPressIn={() => setPressedMonthIndex(index)}
                  onPressOut={() => setPressedMonthIndex(null)}
                  activeOpacity={0.7}
                />
              ))}
            </View>
          </View>

          {/* Navigation Arrows */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => handleNavigate('prev')}
            >
              <Text style={styles.arrowText}>‹</Text>
            </TouchableOpacity>
            
            <Text style={styles.updateText}>
              {formatUpdateTime()}
            </Text>
            
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => handleNavigate('next')}
            >
              <Text style={styles.arrowText}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginHorizontal: responsiveSpacing(16),
    marginBottom: responsiveSpacing(16),
    padding: responsiveSpacing(4),
  },
  tab: {
    flex: 1,
    paddingVertical: responsiveSpacing(12),
    paddingHorizontal: responsiveSpacing(16),
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.limeGreen,
  },
  tabText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Medium,
    color: Colors.black,
  },
  activeTabText: {
    color: Colors.black,
  },
  chartContainer: {
    backgroundColor: Colors.limeGreen,
    borderRadius: 16,
    marginHorizontal: responsiveSpacing(16),
    marginBottom: responsiveSpacing(16),
    shadowColor: Colors.shadowDefault,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  contentContainer: {
    flex: 1,
    padding: responsiveSpacing(16),
    backgroundColor: Colors.limeGreen,
    borderRadius: 16,
    alignItems: 'center', // Căn giữa nội dung
  },
  chartTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: responsiveSpacing(12),
  },
  chartWrapper: {
    position: 'relative',
    alignSelf: 'center',
  },
  chart: {
    marginVertical: responsiveSpacing(8),
    borderRadius: 12,
    alignSelf: 'center', // Căn giữa chart
  },
  chartOverlay: {
    position: 'absolute',
    top: 8,
    left: 40, // Offset để khớp với vị trí bars
    right: 20,
    bottom: 40, // Để tránh label ở dưới
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthTouchArea: {
    flex: 1,
    height: '100%',
    marginHorizontal: 2,
  },
  monthTouchAreaPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Hiệu ứng nhấn mạnh khi bấm
    borderRadius: 4,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: responsiveSpacing(16),
  },
  arrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowDefault,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  arrowText: {
    fontSize: responsiveFont(20),
    color: Colors.black,
    fontWeight: 'bold',
  },
  updateText: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    textAlign: 'center',
  },
});

