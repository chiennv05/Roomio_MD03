import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomSlider from './CustomSlider';
import ItemButtonConfirm from '../../LoginAndRegister/components/ItemButtonConfirm';
import { Icons } from '../../../assets/icons';
import { Colors } from '../../../theme/color';
import { responsiveFont, responsiveSpacing, moderateScale } from '../../../utils/responsive';

interface PriceRangeModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (minPrice: number, maxPrice: number) => void;
  selectedMinPrice?: number;
  selectedMaxPrice?: number;
}

const PriceRangeModal: React.FC<PriceRangeModalProps> = ({
  visible,
  onClose,
  onConfirm,
  selectedMinPrice = 0,
  selectedMaxPrice = 20000000,
}) => {
  const insets = useSafeAreaInsets();
  const [minPrice, setMinPrice] = useState(selectedMinPrice);
  const [maxPrice, setMaxPrice] = useState(selectedMaxPrice);

  useEffect(() => {
    if (visible) {
      setMinPrice(selectedMinPrice);
      setMaxPrice(selectedMaxPrice);
    }
  }, [visible, selectedMinPrice, selectedMaxPrice]);

  const handleConfirm = () => {
    onConfirm(minPrice, maxPrice);
    onClose();
  };

  const handleReset = () => {
    // Reset về giá trị mặc định (xóa filter)
    onConfirm(0, 20000000);
    onClose();
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      const millions = price / 1000000;
      return millions % 1 === 0 ? `${millions} triệu` : `${millions.toFixed(1)} triệu`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}k`;
    } else {
      return price.toString();
    }
  };



  const handleSliderChange = (values: number[]) => {
    setMinPrice(values[0]);
    setMaxPrice(values[1]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Khoảng giá</Text>
            <Text style={styles.subtitle}>Lọc tìm kiếm theo khoảng giá ( theo tháng )</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Price Display */}
            <View style={styles.priceDisplay}>
              <Text style={styles.priceText}>
                Giá từ <Text style={styles.priceValue}>{formatPrice(minPrice)}</Text> đến <Text style={styles.priceValue}>{formatPrice(maxPrice)}</Text>
              </Text>
            </View>

            {/* Slider */}
            <View style={styles.sliderContainer}>
              <CustomSlider
                values={[minPrice, maxPrice]}
                onValuesChange={handleSliderChange}
                minValue={0}
                maxValue={20000000}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <ItemButtonConfirm
              title="Xác nhận"
              icon={Icons.IconRemoveWhite}
              onPress={handleConfirm}
              onPressIcon={handleReset}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PriceRangeModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    height: '45%', // Tăng chiều cao để có đủ không gian cho slider
  },
  header: {
    padding: responsiveSpacing(20),
    paddingBottom: responsiveSpacing(10),
  },
  title: {
    fontSize: responsiveFont(24),
    fontWeight: 'bold',
    color: Colors.darkGray,
    marginBottom: responsiveSpacing(4),
  },
  subtitle: {
    fontSize: responsiveFont(14),
    color: Colors.textGray,
  },
  content: {
    // paddingHorizontal: responsiveSpacing(20),
    paddingTop: responsiveSpacing(10), // Giảm padding top
    // paddingBottom: responsiveSpacing(100), // Đảm bảo không bị che bởi footer
    alignItems: 'stretch', // Cho phép content căn trái
  },
  priceDisplay: {
    marginBottom: responsiveSpacing(10), // Giảm khoảng cách
    alignItems: 'flex-start', // Căn trái
    justifyContent: 'center',
    height: responsiveSpacing(40), // Giảm chiều cao hơn nữa
    paddingHorizontal: responsiveSpacing(20),
  },
  priceText: {
    fontFamily: 'Roboto',
    fontSize: responsiveFont(24), // Tăng font size
    fontWeight: 'bold', // Làm bold
    lineHeight: responsiveFont(24),
    color: Colors.darkGray,
    textAlign: 'left', // Căn trái
  },
  priceValue: {
    fontFamily: 'Roboto',
    fontSize: responsiveFont(20), // Tăng font size
    fontWeight: 'bold', // Làm bold
    lineHeight: responsiveFont(24),
    color: Colors.darkGreen,
  },

  sliderContainer: {
    width: '100%',
    alignItems: 'center',
    minHeight: responsiveSpacing(100), // Giảm chiều cao slider container
    justifyContent: 'center',
  },

  footer: {
    position: 'absolute', // Đặt footer ở vị trí cố định
    bottom: 0,
    left: 0,
    right: 0,
    padding: responsiveSpacing(20),
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.backgroud,
  },
});
