import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';
import { 
  responsiveSpacing, 
  responsiveFont, 
  responsiveIcon,
  isSmallDevice,
  isTablet
} from '../../../utils/responsive';
import { Icons } from '../../../assets/icons';
import { ServicePrices, ServicePriceConfig, CustomService } from '../../../types/Room';

// Responsive item width
const getItemWidth = () => {
  if (isTablet) {
    return 140; // Lớn hơn cho tablet
  } else if (isSmallDevice) {
    return 100; // Nhỏ hơn cho màn hình nhỏ
  } else {
    return 120; // Kích thước bình thường
  }
};

const ITEM_WIDTH = getItemWidth();

interface ServiceFeesProps {
  servicePrices: ServicePrices;
  servicePriceConfig?: ServicePriceConfig;
  customServices?: CustomService[];
}

// Mapping cho service labels và icons
const serviceMapping = {
  electricity: { label: 'Điện', icon: Icons.IconElectricalSelected },
  water: { label: 'Nước', icon: Icons.IconWarterDropSelected },
  cleaning: { label: 'Dịch vụ', icon: Icons.IconServiceSelected },
  parking: { label: 'Gửi xe', icon: Icons.IconSacXeSelectd },
  internet: { label: 'Internet', icon: Icons.IconWifiSelectd },
  elevator: { label: 'Thang máy', icon: Icons.IconThangMaySelectd },
};

// Hàm lấy unit theo loại pricing
const getPriceUnit = (serviceKey: string, priceType?: string): string => {
  const baseUnits: Record<string, string> = {
    electricity: 'kWh',
    water: 'm³',
  };

  // Xử lý theo từng priceType
  switch (priceType) {
    case 'perUsage':
      // Nếu là điện hoặc nước, sử dụng unit cơ bản
      if (baseUnits[serviceKey]) {
        return `/${baseUnits[serviceKey]}`;
      }
      return '/lần sử dụng';
      
    case 'perPerson':
      return '/người/tháng';
      
    case 'perRoom':
      return '/phòng/tháng';
      
    default:
      // Fallback: nếu không có priceType hoặc không xác định
      if (baseUnits[serviceKey]) {
        return `/${baseUnits[serviceKey]}`;
      }
      return '/tháng';
  }
};

interface ProcessedService {
  key: string;
  value: number;
  label: string;
  icon: string | undefined;
  unit: string;
  type: 'basic' | 'custom';
}

interface AnimatedServiceItemProps {
  service: ProcessedService;
  index: number;
  scrollX: Animated.SharedValue<number>;
}

const AnimatedServiceItem: React.FC<AnimatedServiceItemProps> = ({ service, index, scrollX }) => {
  const inputRange = [
    (index - 1) * ITEM_WIDTH,
    index * ITEM_WIDTH,
    (index + 1) * ITEM_WIDTH,
  ];

  const itemStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.9, 1, 0.9],
      'clamp'
    );

    return {
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View style={[styles.serviceItemNoBg, itemStyle]}>
      <Image source={{ uri: service.icon }} style={styles.serviceIconNoBg} resizeMode="contain" />
      <Text style={styles.serviceLabel}>{service.label}</Text>
      <Text style={styles.serviceValue}>{`${service.value.toLocaleString('vi-VN')}${service.unit}`}</Text>
    </Animated.View>
  );
};

// Hàm lấy icon phù hợp cho custom service dựa trên tên
const getCustomServiceIcon = (serviceName: string): string => {
  const name = serviceName.toLowerCase();
  
  if (name.includes('internet') || name.includes('wifi')) {
    return Icons.IconWifiMienPhi || Icons.IconVeSinh || '';
  }
  if (name.includes('máy giặt') || name.includes('giặt')) {
    return Icons.IconMayGiat || Icons.IconVeSinh || '';
  }
  if (name.includes('gửi xe') || name.includes('parking') || name.includes('xe')) {
    return Icons.IconGuiXe || Icons.IconVeSinh || '';
  }
  if (name.includes('vệ sinh') || name.includes('dọn dẹp') || name.includes('cleaning')) {
    return Icons.IconVeSinh || '';
  }
  if (name.includes('thang máy') || name.includes('elevator')) {
    return Icons.IconThangMay || Icons.IconVeSinh || '';
  }
  if (name.includes('bảo vệ') || name.includes('security')) {
    return Icons.IconBaoVe || Icons.IconVeSinh || '';
  }
  
  // Icon mặc định cho dịch vụ
  return Icons.IconVeSinh || '';
};

const ServiceFees: React.FC<ServiceFeesProps> = ({ 
  servicePrices, 
  servicePriceConfig = {},
  customServices = [] 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Xử lý basic services (điện, nước, v.v.)
  const basicServices: ProcessedService[] = Object.entries(servicePrices)
    .filter(([_key, value]) => value && value > 0)
    .map(([key, value]) => {
      const serviceInfo = serviceMapping[key as keyof typeof serviceMapping];
      const priceType = servicePriceConfig[key as keyof ServicePriceConfig];
      
      return {
        key,
        value: value as number,
        label: serviceInfo?.label || key,
        icon: serviceInfo?.icon,
        unit: getPriceUnit(key, priceType),
        type: 'basic' as const,
      };
    });

  // Xử lý custom services
  const processedCustomServices: ProcessedService[] = customServices.map((service, index) => ({
    key: `custom_${index}`,
    value: service.price,
    label: service.name,
    icon: getCustomServiceIcon(service.name),
    unit: getPriceUnit('custom', service.priceType),
    type: 'custom' as const,
  }));

  // Kết hợp tất cả services
  const allServices = [...basicServices, ...processedCustomServices];

  // Nếu không có service nào thì không hiển thị section
  if (allServices.length === 0) {
    return null;
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const contentWidth = event.nativeEvent.contentSize.width;
    const scrollViewWidth = event.nativeEvent.layoutMeasurement.width;
    
    scrollX.value = offsetX;
    
    // Calculate progress through the scroll
    const maxScrollX = contentWidth - scrollViewWidth;
    const scrollProgress = maxScrollX > 0 ? offsetX / maxScrollX : 0;
    
    // Calculate which indicator should be active based on scroll progress
    const totalPages = Math.max(1, Math.ceil(allServices.length / 3));
    const currentPage = Math.min(Math.floor(scrollProgress * totalPages), totalPages - 1);
    
    setCurrentIndex(currentPage);
  };

  // Calculate total pages for indicators
  const itemsPerPage = 3;
  const totalPages = Math.max(1, Math.ceil(allServices.length / itemsPerPage));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dịch vụ</Text>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContentNoBg}
        style={styles.scrollViewNoBg}
      >
        {allServices.map((service, index) => (
          <AnimatedServiceItem
            key={service.key}
            service={service}
            index={index}
            scrollX={scrollX}
          />
        ))}
      </ScrollView>

      {/* Indicators */}
      {allServices.length > itemsPerPage && (
        <View style={styles.indicatorContainer}>
          {Array.from({ length: totalPages }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentIndex === index && styles.activeIndicator,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: responsiveSpacing(16),
  },
  title: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(16),
    color: Colors.black,
    marginBottom: responsiveSpacing(16),
  },
  scrollViewNoBg: {
    height: responsiveSpacing(isTablet ? 140 : isSmallDevice ? 110 : 130),
    backgroundColor: 'transparent',
  },
  scrollContentNoBg: {
    paddingHorizontal: responsiveSpacing(8),
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  serviceItemNoBg: {
    alignItems: 'center',
    width: ITEM_WIDTH,
    marginHorizontal: responsiveSpacing(4),
    backgroundColor: 'transparent',
    paddingVertical: responsiveSpacing(isTablet ? 12 : isSmallDevice ? 8 : 10),
    paddingHorizontal: responsiveSpacing(4),
    borderRadius: 0,
  },
  serviceIconNoBg: {
    width: responsiveIcon(32),
    height: responsiveIcon(32),
    tintColor: Colors.darkGreen,
    marginBottom: responsiveSpacing(4),
  },
  serviceLabel: {
    fontSize: responsiveFont(13),
    color: Colors.textGray,
    fontFamily: Fonts.Roboto_Regular,
    marginVertical: responsiveSpacing(2),
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: responsiveFont(16),
  },
  serviceValue: {
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    fontSize: responsiveFont(17),
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: responsiveFont(20),
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: responsiveSpacing(12),
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
    marginHorizontal: 3,
  },
  activeIndicator: {
    backgroundColor: Colors.darkGreen,
    width: 20,
  },
});

export default ServiceFees;
