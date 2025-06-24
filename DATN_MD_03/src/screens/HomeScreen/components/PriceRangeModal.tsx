import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
} from 'react-native';
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
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Khoảng giá</Text>
            <Text style={styles.subtitle}>Lọc tìm kiếm theo khoảng giá ( theo tháng )</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Price Display */}
            <View style={styles.priceDisplay}>
              <Text style={styles.priceLabel}>
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
    maxHeight: '70%',
    minHeight: '45%',
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
    flex: 1,
    paddingHorizontal: responsiveSpacing(20),
    paddingTop: responsiveSpacing(10),
  },
  priceDisplay: {
    marginBottom: responsiveSpacing(30),
  },
  priceLabel: {
    fontSize: responsiveFont(20),
    fontWeight: 'bold',
    color: Colors.unselectedText,
    marginBottom: responsiveSpacing(8),
  },
  priceValue: {
    fontSize: responsiveFont(20),
    fontWeight: 'bold',
    color: Colors.darkGreen,
  },

  sliderContainer: {
    marginBottom: responsiveSpacing(40),
    paddingVertical: responsiveSpacing(10),
    alignItems: 'center',
  },

  footer: {
    padding: responsiveSpacing(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 