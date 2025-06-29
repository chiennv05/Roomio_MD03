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

interface ServicePricesType {
  electricity?: number;
  water?: number;
  cleaning?: number;
  parking?: number;
  internet?: number;
  elevator?: number;
}

interface ServiceFeesProps {
  servicePrices: ServicePricesType;
}

// Mapping cho service labels và icons
const serviceMapping = {
  electricity: { label: 'Điện', icon: Icons.IconTienDien, unit: '/kWh' },
  water: { label: 'Nước', icon: Icons.IconTienNuoc, unit: '/m³' },
  cleaning: { label: 'Dịch vụ', icon: Icons.IconVeSinh, unit: '/tháng' },
  parking: { label: 'Gửi xe', icon: Icons.IconGuiXe, unit: '/tháng' },
  internet: { label: 'Internet', icon: Icons.IconWifiMienPhi, unit: '/tháng' },
  elevator: { label: 'Thang máy', icon: Icons.IconThangMay, unit: '/tháng' },
};

interface AnimatedServiceItemProps {
  service: {
    key: string;
    value: number;
    label: string;
    icon: string | undefined;
    unit: string;
  };
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
    <Animated.View style={[styles.serviceItem, itemStyle]}>
      <View style={styles.serviceIconContainer}>
        {service.icon ? (
          <Image source={{ uri: service.icon }} style={styles.serviceIcon} resizeMode="contain" />
        ) : (
          <Text style={styles.serviceIconText}>💰</Text>
        )}
      </View>
      <Text style={styles.serviceLabel} numberOfLines={1}>{service.label}</Text>
      <Text style={styles.serviceValue} numberOfLines={2}>
        {`${service.value.toLocaleString('vi-VN')}${service.unit}`}
      </Text>
    </Animated.View>
  );
};

const ServiceFees: React.FC<ServiceFeesProps> = ({ servicePrices }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Lọc ra những service có giá > 0
  const activeServices = Object.entries(servicePrices)
    .filter(([_key, value]) => value && value > 0)
    .map(([key, value]) => ({
      key,
      value: value as number,
      ...serviceMapping[key as keyof typeof serviceMapping]
    }));

  // Nếu không có service nào thì không hiển thị section
  if (activeServices.length === 0) {
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
    const totalPages = Math.max(1, Math.ceil(activeServices.length / 3));
    const currentPage = Math.min(Math.floor(scrollProgress * totalPages), totalPages - 1);
    
    setCurrentIndex(currentPage);
  };

  // Calculate total pages for indicators
  const itemsPerPage = 3;
  const totalPages = Math.max(1, Math.ceil(activeServices.length / itemsPerPage));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phí dịch vụ</Text>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {activeServices.map((service, index) => (
          <AnimatedServiceItem
            key={service.key}
            service={service}
            index={index}
            scrollX={scrollX}
          />
        ))}
      </ScrollView>

      {/* Indicators */}
      {activeServices.length > itemsPerPage && (
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
  scrollView: {
    height: responsiveSpacing(isTablet ? 140 : isSmallDevice ? 100 : 120),
  },
  scrollContent: {
    paddingHorizontal: responsiveSpacing(8),
    alignItems: 'center',
  },
  serviceItem: {
    alignItems: 'center',
    width: ITEM_WIDTH,
    marginHorizontal: responsiveSpacing(4),
    backgroundColor: Colors.white,
    paddingVertical: responsiveSpacing(isTablet ? 16 : isSmallDevice ? 10 : 12),
    paddingHorizontal: responsiveSpacing(8),
    borderRadius: responsiveSpacing(8),
  },
  serviceIconContainer: {
    width: responsiveIcon(isTablet ? 56 : isSmallDevice ? 40 : 48),
    height: responsiveIcon(isTablet ? 56 : isSmallDevice ? 40 : 48),
    backgroundColor: Colors.lightGray,
    borderRadius: responsiveIcon(isTablet ? 28 : isSmallDevice ? 20 : 24),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveSpacing(8),
  },
  serviceIcon: {
    width: responsiveIcon(isTablet ? 32 : isSmallDevice ? 24 : 28),
    height: responsiveIcon(isTablet ? 32 : isSmallDevice ? 24 : 28),
  },
  serviceLabel: {
    fontSize: responsiveFont(14),
    color: Colors.textGray,
    fontFamily: Fonts.Roboto_Regular,
    marginVertical: responsiveSpacing(5),
    textAlign: 'center',
    fontWeight: '600',
  },
  serviceValue: {
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    fontSize: responsiveFont(14),
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: responsiveFont(12),
  },
  serviceIconText: {
    fontSize: responsiveFont(isTablet ? 28 : isSmallDevice ? 16 : 20),
    color: Colors.textGray,
    fontFamily: Fonts.Roboto_Regular,
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
